import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FaEye } from "react-icons/fa";
import { BiLike } from "react-icons/bi";
import { FaBookBookmark } from "react-icons/fa6";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  X,
  ExternalLink,
  PlayCircle,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import Card from "../components/Card";
import CardContent from "../components/CardContent";
import { useNavigate } from "react-router-dom";
import Verification from "../modals/DashboardVerification";
import { toast } from "react-toastify";
import Alert from "@mui/material/Alert";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

export default function StartupDashboard({ openAddMethodModal }) {
  const [startupIds, setStartupIds] = useState([]);
  const [startups, setStartups] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState("all");
  const [logoUrls, setLogoUrls] = useState({});

  const [metrics, setMetrics] = useState({
    views: 0,
    likes: 0,
    bookmarks: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [isAddMethodModalOpen, setIsAddMethodModalOpen] = useState(false);

  const handleAddStartupClick = () => {
    setIsAddMethodModalOpen(true);
  };

  // State for editing
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // State for verification modal
  const [verificationModal, setVerificationModal] = useState(false);
  const [selectedStartupId, setSelectedStartupId] = useState(null);
  const [selectedContactEmail, setSelectedContactEmail] = useState(null);

  // State for delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    startupId: null,
    startupName: "",
    isDeleting: false,
    error: null,
  });

  // State for delete draft confirmation modal
  const [deleteDraftModal, setDeleteDraftModal] = useState({
    isOpen: false,
    draftId: null,
    draftName: "",
    isDeleting: false,
    error: null,
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [donutData, setDonutData] = useState({
    labels: ["Likes", "Bookmarks", "Views"],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
        borderWidth: 0,
      },
    ],
  });

  const fetchCompanyLogo = async (startupId) => {
    // Skip if already fetching or fetched
    if (logoUrls[startupId] || logoUrls[startupId] === null) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/${startupId}/photo`,
        {
          credentials: "include",
          // Add cache control for faster subsequent loads
          cache: "force-cache",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setLogoUrls((prev) => ({
          ...prev,
          [startupId]: imageUrl,
        }));
      } else {
        // Mark as failed to avoid refetching
        setLogoUrls((prev) => ({
          ...prev,
          [startupId]: null,
        }));
      }
    } catch (error) {
      console.error(`Error fetching logo for startup ${startupId}:`, error);
      // Mark as failed to avoid refetching
      setLogoUrls((prev) => ({
        ...prev,
        [startupId]: null,
      }));
    }
  };

  const fetchDrafts = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/my-drafts`,
        {
          credentials: "include",
        }
      );

      // If no draft → 204 or error
      if (res.status === 204 || !res.ok) {
        setDrafts([]); // ← Important: clear drafts
        return;
      }

      const rawDraft = await res.json();

      // Backend returns the draft object directly with all fields
      // For backwards compatibility, check if formData is stringified
      let draftData;
      if (rawDraft.formData) {
        // Old format: { formData: "...", selectedTab: "..." }
        try {
          draftData =
            typeof rawDraft.formData === "string"
              ? JSON.parse(rawDraft.formData)
              : rawDraft.formData;

          if (typeof draftData === "string") {
            draftData = JSON.parse(draftData);
          }
        } catch (e) {
          console.warn("Failed to parse draft formData, using raw", e);
          draftData = {};
        }
      } else {
        // New format: direct draft object with all fields
        draftData = rawDraft;
      }

      const draftObject = {
        id: rawDraft.id || draftData.id, // Use the actual draft ID from backend
        companyName: draftData.companyName || "Untitled Draft",
        industry: draftData.industry || "Not specified",
        locationName: draftData.locationName || "No location",
        contactEmail: draftData.contactEmail || "",
        foundedDate: draftData.foundedDate || null,
        selectedTab: rawDraft.selectedTab || "Company Information",
        isDraft: true,
      };

      console.log("Draft fetched from backend:", draftObject);

      // Only add draft if it has a valid ID
      if (
        draftObject.id &&
        draftObject.id !== "undefined" &&
        draftObject.id !== "null"
      ) {
        // CURRENT: Only one draft allowed → replace array
        setDrafts([draftObject]);
      } else {
        console.warn("Draft has no valid ID, skipping:", draftObject);
        setDrafts([]);
      }

      // FUTURE: When backend supports multiple drafts → just change this line to:
      // setDrafts(prev => [...prev, draftObject]);
    } catch (err) {
      console.error("Error fetching draft:", err);
      setDrafts([]);
    }
  };

  const displayList = useMemo(() => {
    const filteredStartups = startups.filter((s) =>
      [s.companyName, s.industry, s.locationName].some((field) =>
        field?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    // Always show published startups first, then all drafts at the bottom
    return [...filteredStartups, ...drafts];
  }, [startups, drafts, searchQuery]);

  const [engagementData, setEngagementData] = useState({
    labels: months,
    datasets: [
      {
        label: "Likes",
        data: Array(12).fill(0),
        borderColor: "#3b82f6",
        fill: false,
      },
      {
        label: "Bookmarks",
        data: Array(12).fill(0),
        borderColor: "#10b981",
        fill: false,
      },
      {
        label: "Views",
        data: Array(12).fill(0),
        borderColor: "#f59e0b",
        fill: false,
      },
    ],
  });

  const handleDeleteClick = (startup) => {
    setDeleteModal({
      isOpen: true,
      startupId: startup.id,
      startupName: startup.companyName || "this startup",
      isDeleting: false,
      error: null,
    });
  };

  const handleDeleteDraftClick = (draftId, draftName) => {
    console.log(
      "Attempting to delete draft with ID:",
      draftId,
      "Name:",
      draftName
    );
    setDeleteDraftModal({
      isOpen: true,
      draftId: draftId,
      draftName: draftName || "Untitled Draft",
      isDeleting: false,
      error: null,
    });
  };

  const handleDeleteDraft = async () => {
    const draftId = deleteDraftModal.draftId;
    setDeleteDraftModal({ ...deleteDraftModal, isDeleting: true, error: null });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/draft/${draftId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete draft");
      }

      toast.success("Draft deleted successfully!");

      // Remove the draft from the state - using String() to ensure type consistency
      setDrafts((prevDrafts) =>
        prevDrafts.filter((draft) => String(draft.id) !== String(draftId))
      );

      // Close modal
      setDeleteDraftModal({
        isOpen: false,
        draftId: null,
        draftName: "",
        isDeleting: false,
        error: null,
      });
    } catch (error) {
      console.error("Error deleting draft:", error);
      setDeleteDraftModal({
        ...deleteDraftModal,
        isDeleting: false,
        error: error.message || "Failed to delete draft. Please try again.",
      });
    }

    fetchStartups();
  };

  const confirmDeleteStartup = async () => {
    const id = deleteModal.startupId;
    setDeleteModal({ ...deleteModal, isDeleting: true, error: null });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error deleting startup: ${response.status}`);
      }

      const updatedStartups = startups.filter((startup) => startup.id !== id);
      setStartups(updatedStartups);

      const updatedIds = startupIds.filter((startupId) => startupId !== id);
      setStartupIds(updatedIds);

      setActionSuccess("Startup deleted successfully");
      setTimeout(() => setActionSuccess(null), 3000);

      if (selectedStartup === id) {
        setSelectedStartup("all");
        await recalculateAllMetrics(updatedIds, updatedStartups);
      } else if (selectedStartup === "all") {
        await recalculateAllMetrics(updatedIds, updatedStartups);
      } else {
        await recalculateAllMetrics(updatedIds, updatedStartups);
      }

      // Close the modal after successful deletion
      setDeleteModal({
        isOpen: false,
        startupId: null,
        startupName: "",
        isDeleting: false,
        error: null,
      });
    } catch (error) {
      console.error("Error deleting startup:", error);
      setDeleteModal({
        ...deleteModal,
        isDeleting: false,
        error: error.message || "Failed to delete startup. Please try again.",
      });
    }
  };

  const recalculateAllMetrics = async (ids, updatedStartupsArray) => {
    if (!ids || ids.length === 0) {
      setMetrics({ views: 0, likes: 0, bookmarks: 0 });
      setDonutData({
        labels: ["No Data"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#cccccc"],
            borderWidth: 0,
          },
        ],
      });
      setEngagementData({
        labels: months,
        datasets: [
          {
            label: "Views",
            data: Array(12).fill(0),
            borderColor: "#f59e0b",
            fill: false,
          },
          {
            label: "Bookmarks",
            data: Array(12).fill(0),
            borderColor: "#10b981",
            fill: false,
          },
          {
            label: "Likes",
            data: Array(12).fill(0),
            borderColor: "#3b82f6",
            fill: false,
          },
        ],
      });
      return;
    }

    try {
      const totalMetrics = await fetchTotalMetrics(ids);

      if (totalMetrics) {
        const colors = updatedStartupsArray.map(
          (_, index) =>
            `hsl(${(index * 360) / updatedStartupsArray.length}, 70%, 50%)`
        );

        const startupMetrics = updatedStartupsArray.map((startup) => {
          return startup.likes || 1;
        });

        setDonutData({
          labels: updatedStartupsArray.map((startup) => startup.companyName),
          datasets: [
            {
              data: startupMetrics,
              backgroundColor: colors,
              borderWidth: 0,
            },
          ],
        });
      }

      await fetchAllStartupsEngagementData();
    } catch (error) {
      console.error("Error recalculating metrics after deletion:", error);
    }
  };

  const handleNavigateToUpdate = (startup) => {
    navigate(`/update-startup/${startup.id}`, { state: { startup } });
  };

  const fetchStartupIds = async () => {
    try {
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/my-startups`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching startup IDs: ${response.status}`);
      }

      const data = await response.json();
      console.log("Startup IDs fetched successfully: ", data);

      if (Array.isArray(data)) {
        setStartupIds(data);
        return data;
      } else {
        console.error("Expected array of startup IDs but got:", data);
        setStartupIds([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching startup IDs:", error);
      setError("Failed to load startup IDs. Please try again later.");
      setStartupIds([]);
      return [];
    }
  };

  const fetchStartups = async () => {
    try {
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/my-startups/details`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching startups: ${response.status}`);
      }

      const data = await response.json();
      console.log("Startups fetched successfully: ", data);

      if (Array.isArray(data)) {
        setStartups(data);
        return data;
      } else {
        console.error("Expected array of startups but got:", data);
        setStartups([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching startups:", error);
      setError("Failed to load startup details. Please try again later.");
      setStartups([]);
      return [];
    }
  };

  const fetchTotalMetrics = async (ids) => {
    if (!ids || ids.length === 0) {
      console.log("No startup IDs to fetch metrics for");
      setMetrics({ views: 0, likes: 0, bookmarks: 0 });
      return;
    }

    try {
      setError(null);
      let totalLikes = 0;
      let totalBookmarks = 0;
      let totalViews = 0;

      const promises = [];

      for (const id of ids) {
        promises.push(
          fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/likes/count/startup/${id}`,
            {
              credentials: "include",
            }
          )
            .then((response) => {
              if (response.ok) return response.json();
              return 0;
            })
            .then((data) => {
              totalLikes += data;
            })
            .catch((err) => {
              console.error(`Error fetching likes for startup ${id}:`, err);
            })
        );
      }

      for (const id of ids) {
        promises.push(
          fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/bookmarks/count/startup/${id}`,
            {
              credentials: "include",
            }
          )
            .then((response) => {
              if (response.ok) return response.json();
              return 0;
            })
            .then((data) => {
              totalBookmarks += data;
            })
            .catch((err) => {
              console.error(`Error fetching bookmarks for startup ${id}:`, err);
            })
        );
      }

      for (const id of ids) {
        promises.push(
          fetch(
            `${import.meta.env.VITE_BACKEND_URL}/startups/${id}/view-count`,
            {
              credentials: "include",
            }
          )
            .then((response) => {
              if (response.ok) return response.json();
              return 0;
            })
            .then((data) => {
              totalViews += data;
            })
            .catch((err) => {
              console.error(`Error fetching views for startup ${id}:`, err);
            })
        );
      }

      await Promise.all(promises);

      const newMetrics = {
        likes: totalLikes,
        bookmarks: totalBookmarks,
        views: totalViews,
      };

      setMetrics(newMetrics);

      console.log("Total metrics:", newMetrics);

      updateDonutChart("all", totalLikes, totalBookmarks, totalViews);

      return newMetrics;
    } catch (error) {
      console.error("Error fetching total metrics:", error);
      setError("Failed to load metrics. Please try again later.");
      return null;
    }
  };

  const handleChange = async (e) => {
    const selectedId = e.target.value;
    setSelectedStartup(selectedId);
    setLoading(true);

    try {
      setError(null);
      if (selectedId === "all") {
        await fetchAllStartupsData();
      } else {
        await fetchSingleStartupData(selectedId);
      }
    } catch (error) {
      console.error("Error handling startup selection change:", error);
      setError("Failed to load selected startup data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStartupsData = async () => {
    try {
      setError(null);
      setLoading(true);

      let ids = startupIds;
      if (ids.length === 0) {
        ids = await fetchStartupIds();
      }

      const startupsData = await fetchStartups();

      // Fetch all logos in parallel for faster loading
      const logoPromises = startupsData.map((startup) =>
        fetchCompanyLogo(startup.id)
      );
      Promise.all(logoPromises).catch((err) => {
        console.error("Error fetching some logos:", err);
      });

      const totalMetrics = await fetchTotalMetrics(ids);

      if (totalMetrics) {
        updateDonutChart(
          "all",
          totalMetrics.likes,
          totalMetrics.bookmarks,
          totalMetrics.views
        );
      }

      await fetchAllStartupsEngagementData();

      await fetchStartupMetrics();
    } catch (error) {
      console.error("Error fetching all startups data:", error);
      setError("Failed to load startup metrics.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStartupMetrics = async () => {
    if (startups.length === 0) {
      console.log("No startups to fetch metrics for");
      return;
    }

    try {
      setError(null);
      const updatedStartups = [...startups];

      await Promise.all(
        updatedStartups.map(async (startup, index) => {
          try {
            const [likesResponse, bookmarksResponse, viewsResponse] =
              await Promise.all([
                fetch(
                  `${
                    import.meta.env.VITE_BACKEND_URL
                  }/api/likes/count/startup/${startup.id}`,
                  {
                    credentials: "include",
                  }
                ),
                fetch(
                  `${
                    import.meta.env.VITE_BACKEND_URL
                  }/api/bookmarks/count/startup/${startup.id}`,
                  {
                    credentials: "include",
                  }
                ),
                fetch(
                  `${import.meta.env.VITE_BACKEND_URL}/startups/${
                    startup.id
                  }/view-count`,
                  {
                    credentials: "include",
                  }
                ),
              ]);

            const likesData = likesResponse.ok ? await likesResponse.json() : 0;
            const bookmarksData = bookmarksResponse.ok
              ? await bookmarksResponse.json()
              : 0;
            const viewsData = viewsResponse.ok ? await viewsResponse.json() : 0;

            updatedStartups[index] = {
              ...startup,
              likes: likesData,
              bookmarks: bookmarksData,
              views: viewsData,
            };
          } catch (error) {
            console.error(
              `Error fetching metrics for startup ${startup.id}:`,
              error
            );
            updatedStartups[index] = {
              ...startup,
              error: true,
            };
          }
        })
      );

      setStartups(updatedStartups);
    } catch (error) {
      console.error("Error fetching individual startup metrics:", error);
    }
  };

  const fetchSingleStartupData = async (startupId) => {
    try {
      setError(null);
      const [viewsResponse, likesResponse, bookmarksResponse] =
        await Promise.all([
          fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/startups/${startupId}/view-count`,
            {
              credentials: "include",
            }
          ),
          fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/likes/count/startup/${startupId}`,
            {
              credentials: "include",
            }
          ),
          fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/bookmarks/count/startup/${startupId}`,
            {
              credentials: "include",
            }
          ),
        ]);

      const viewsData = viewsResponse.ok ? await viewsResponse.json() : 0;
      const likesData = likesResponse.ok ? await likesResponse.json() : 0;
      const bookmarksData = bookmarksResponse.ok
        ? await bookmarksResponse.json()
        : 0;

      setMetrics({
        views: viewsData,
        likes: likesData,
        bookmarks: bookmarksData,
      });

      const selectedStartupObj = startups.find((s) => s.id === startupId);
      if (selectedStartupObj) {
        updateDonutChart(startupId, likesData, bookmarksData, viewsData);
      }

      await fetchSingleStartupEngagementData(startupId);
    } catch (error) {
      console.error(`Error fetching data for startup ID ${startupId}:`, error);
      setError("Failed to load startup data.");
    }
  };

  const updateDonutChart = (
    startupId,
    likesValue,
    bookmarksValue,
    viewsValue
  ) => {
    if (startupId === "all") {
      if (startups.length === 0) {
        setDonutData({
          labels: ["No Data"],
          datasets: [
            {
              data: [1],
              backgroundColor: ["#cccccc"],
              borderWidth: 0,
            },
          ],
        });
        return;
      }

      const colors = startups.map(
        (_, index) => `hsl(${(index * 360) / startups.length}, 70%, 50%)`
      );

      const startupMetrics = startups.map((startup) => {
        const startupLikes = startup.likes !== undefined ? startup.likes : 1;
        return Math.max(startupLikes, 1);
      });

      setDonutData({
        labels: startups.map((startup) => startup.companyName),
        datasets: [
          {
            data: startupMetrics,
            backgroundColor: colors,
            borderWidth: 0,
          },
        ],
      });
    } else {
      setDonutData({
        labels: ["Likes", "Bookmarks", "Views"],
        datasets: [
          {
            data: [likesValue, bookmarksValue, viewsValue],
            backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
            borderWidth: 0,
          },
        ],
      });
    }
  };

  const fetchAllStartupsEngagementData = async () => {
    try {
      setError(null);
      const [viewsResponse, bookmarksResponse, likesResponse] =
        await Promise.all([
          fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/views/grouped-by-month/logged-in-user-startups`,
            {
              credentials: "include",
            }
          ),
          fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/bookmarks/grouped-by-month/logged-in-user-startups`,
            {
              credentials: "include",
            }
          ),
          fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/likes/grouped-by-month/logged-in-user-startups`,
            {
              credentials: "include",
            }
          ),
        ]);

      const viewsData = viewsResponse.ok ? await viewsResponse.json() : {};
      const bookmarksData = bookmarksResponse.ok
        ? await bookmarksResponse.json()
        : {};
      const likesData = likesResponse.ok ? await likesResponse.json() : {};

      console.log("All startups engagement data:", {
        views: viewsData,
        bookmarks: bookmarksData,
        likes: likesData,
      });

      updateEngagementChart(viewsData, bookmarksData, likesData);
    } catch (error) {
      console.error("Error fetching engagement data for all startups:", error);
    }
  };

  const fetchSingleStartupEngagementData = async (startupId) => {
    try {
      setError(null);
      const [viewsResponse, bookmarksResponse, likesResponse] =
        await Promise.all([
          fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/views/count-by-month/${startupId}`,
            {
              credentials: "include",
            }
          ),
          fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/bookmarks/grouped-by-month/startup/${startupId}`,
            {
              credentials: "include",
            }
          ),
          fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/likes/grouped-by-month/startup/${startupId}`,
            {
              credentials: "include",
            }
          ),
        ]);

      const viewsData = viewsResponse.ok ? await viewsResponse.json() : {};
      const bookmarksData = bookmarksResponse.ok
        ? await bookmarksResponse.json()
        : {};
      const likesData = likesResponse.ok ? await likesResponse.json() : {};

      console.log("Single startup engagement data:", {
        views: viewsData,
        bookmarks: bookmarksData,
        likes: likesData,
      });

      updateEngagementChart(viewsData, bookmarksData, likesData);
    } catch (error) {
      console.error(
        `Error fetching engagement data for startup ID ${startupId}:`,
        error
      );
    }
  };

  const updateEngagementChart = (viewsData, bookmarksData, likesData) => {
    const normalizedViewsData = typeof viewsData === "object" ? viewsData : {};
    const normalizedBookmarksData =
      typeof bookmarksData === "object" ? bookmarksData : {};
    const normalizedLikesData = typeof likesData === "object" ? likesData : {};

    const viewsValues = months.map((month) => normalizedViewsData[month] || 0);
    const bookmarksValues = months.map(
      (month) => normalizedBookmarksData[month] || 0
    );
    const likesValues = months.map((month) => normalizedLikesData[month] || 0);

    setEngagementData({
      labels: months,
      datasets: [
        {
          label: "Views",
          data: viewsValues,
          borderColor: "#f59e0b",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Bookmarks",
          data: bookmarksValues,
          borderColor: "#10b981",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Likes",
          data: likesValues,
          borderColor: "#3b82f6",
          fill: false,
          tension: 0.1,
        },
      ],
    });
  };

  const handleEditStartup = (startup) => {
    setEditingId(startup.id);
    setEditFormData({
      companyName: startup.companyName || "",
      industry: startup.industry || "",
      foundedDate: startup.foundedDate
        ? new Date(startup.foundedDate).toISOString().split("T")[0]
        : "",
      contactEmail: startup.contactEmail || "",
      phoneNumber: startup.phoneNumber || "",
      website: startup.website || "",
      locationName: startup.locationName || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleUpdateStartup = async (id) => {
    setSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editFormData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error updating startup: ${response.status}`);
      }

      const updatedStartups = startups.map((startup) =>
        startup.id === id ? { ...startup, ...editFormData } : startup
      );
      setStartups(updatedStartups);

      setActionSuccess("Startup updated successfully");
      setTimeout(() => setActionSuccess(null), 3000);

      setEditingId(null);
      setEditFormData({});
    } catch (error) {
      console.error("Error updating startup:", error);
      setError("Failed to update startup. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);

    if (selectedStartup === "all") {
      fetchAllStartupsData();
    } else {
      fetchSingleStartupData(selectedStartup);
    }
  };

  const centerTextPlugin = {
    id: "centerText",
    beforeDraw(chart) {
      const { width, height, ctx } = chart;
      ctx.save();

      let text, subText;
      if (selectedStartup === "all") {
        text = "All Startups";
        subText = `${startups.length} Companies`;
      } else {
        const selectedStartupObj = startups.find(
          (s) => s.id === selectedStartup
        );
        text = selectedStartupObj?.companyName || "Startup";
        subText = selectedStartupObj?.industry || "";
      }

      const mainFontSize = Math.min(width, height) * 0.1;
      const subFontSize = mainFontSize * 0.5;

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.font = `bold ${mainFontSize}px sans-serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillStyle = "#3b82f6";

      if (text.length > 10) {
        const words = text.split(" ");
        let line = "";
        let lines = [];

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + " ";
          if (testLine.length > 10 && i > 0) {
            lines.push(line);
            line = words[i] + " ";
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        const totalHeight = lines.length * mainFontSize * 1.2;
        let startY = centerY - totalHeight / 2 + mainFontSize / 2;

        lines.forEach((line, index) => {
          ctx.fillText(
            line.trim(),
            centerX,
            startY + index * mainFontSize * 1.2
          );
        });

        if (subText) {
          ctx.font = `${subFontSize}px sans-serif`;
          ctx.fillStyle = "#64748b";
          ctx.fillText(subText, centerX, startY + totalHeight + subFontSize);
        }
      } else {
        ctx.fillText(text, centerX, centerY - (subText ? subFontSize : 0));

        if (subText) {
          ctx.font = `${subFontSize}px sans-serif`;
          ctx.fillStyle = "#64748b";
          ctx.fillText(subText, centerX, centerY + mainFontSize * 0.7);
        }
      }

      ctx.restore();
    },
  };

  const handleVerifyNow = (id, email) => {
    if (!id || !email) {
      toast.error("Cannot verify: Missing startup ID or email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Cannot verify: Invalid email format.");
      return;
    }
    setSelectedStartupId(id);
    setSelectedContactEmail(email);
    setVerificationModal(true);
  };

  const handleVerifySuccess = (verifiedStartupId) => {
    // Update the startups array to set emailVerified to true for the verified startup
    const updatedStartups = startups.map((startup) =>
      startup.id === verifiedStartupId
        ? { ...startup, emailVerified: true }
        : startup
    );
    setStartups(updatedStartups);

    // Show success notification
    setActionSuccess("Email verified successfully");
    setTimeout(() => setActionSuccess(null), 3000);

    // Recalculate metrics if necessary (similar to delete functionality)
    if (selectedStartup === "all" || selectedStartup === verifiedStartupId) {
      recalculateAllMetrics(startupIds, updatedStartups);
    }
  };

  const handleSendCode = async (id, email) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/send-verification-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startupId: id, email }),
          credentials: "include",
        }
      );
      if (response.ok) toast.success("Verification code sent to your email!");
      else toast.error("Failed to send verification code.");
    } catch (error) {
      console.error("Error sending code:", error);
      toast.error("Error sending verification code.");
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      try {
        // Run all three in parallel
        const [ids, startupsData] = await Promise.all([
          fetchStartupIds(),
          fetchStartups(),
          fetchDrafts(), // ← This loads your draft
        ]);

        // After startups are loaded, fetch all logos in parallel for faster loading
        if (startupsData && startupsData.length > 0) {
          const logoPromises = startupsData.map((startup) =>
            fetchCompanyLogo(startup.id)
          );
          Promise.all(logoPromises).catch((err) => {
            console.error("Error fetching some logos:", err);
          });
        }

        // Fetch metrics
        if (ids && ids.length > 0) {
          await fetchTotalMetrics(ids);
          await fetchAllStartupsEngagementData();
        }
      } catch (err) {
        console.error("Failed to initialize dashboard:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();

    // Cleanup function to revoke object URLs and prevent memory leaks
    return () => {
      Object.values(logoUrls).forEach((url) => {
        if (url && typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []); // ← Only runs once on mount

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate("/")}
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Startup Dashboard
                </h1>
                <p className="text-sm text-gray-500 hidden lg:block">
                  Manage your startup portfolio
                </p>
              </div>
            </div>
            <button
              onClick={openAddMethodModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50"
              disabled={loading}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden sm:inline">Add Startup</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
        {/* Enhanced Alert Messages */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-red-900 text-sm">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {actionSuccess && (
          <div className="mb-6">
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-green-900 text-sm">Success</p>
                <p className="text-sm text-green-700 mt-1">{actionSuccess}</p>
              </div>
              <button
                onClick={() => setActionSuccess(null)}
                className="text-green-400 hover:text-green-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
            <div className="flex flex-wrap gap-2 justify-center">
              {["All", "Likes", "Bookmarks", "Views"].map((filter) => (
                <button
                  key={filter}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeFilter === filter
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => handleFilterClick(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Premium Metrics Cards with Glassmorphism */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Views Card - Enhanced */}
            <div className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <FaEye className="h-6 w-6 text-amber-600" />
                </div>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-md border border-amber-200">
                  VIEWS
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Total Views
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? (
                  <span className="inline-block w-24 h-8 bg-gray-200 rounded animate-pulse"></span>
                ) : (
                  metrics.views.toLocaleString()
                )}
              </p>
            </div>

            {/* Bookmarks Card - Enhanced */}
            <div className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FaBookBookmark className="h-6 w-6 text-emerald-600" />
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-200">
                  SAVED
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Bookmarks
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? (
                  <span className="inline-block w-24 h-8 bg-gray-200 rounded animate-pulse"></span>
                ) : (
                  metrics.bookmarks.toLocaleString()
                )}
              </p>
            </div>

            {/* Likes Card - Enhanced */}
            <div className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BiLike className="h-6 w-6 text-blue-600" />
                </div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-200">
                  LIKES
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Total Likes
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? (
                  <span className="inline-block w-24 h-8 bg-gray-200 rounded animate-pulse"></span>
                ) : (
                  metrics.likes.toLocaleString()
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart Card - Redesigned */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Engagement Distribution
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-100 rounded-full">
                      <span className="text-xs font-semibold text-indigo-600">
                        {startupIds.length}
                      </span>
                    </span>
                    <span>Total Startups</span>
                  </div>
                </div>
                <div className="w-full sm:w-64">
                  <label
                    htmlFor="startup-select"
                    className="block mb-2 text-xs font-semibold text-gray-700 uppercase"
                  >
                    Select Startup
                  </label>
                  <div className="relative">
                    <select
                      id="startup-select"
                      value={selectedStartup}
                      onChange={handleChange}
                      className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      <option value="all">All Startups</option>
                      {startups.map((st) => (
                        <option value={st.id} key={st.id}>
                          {st.companyName}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-80">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-xs font-semibold text-amber-700 mb-2 uppercase">
                        Views
                      </p>
                      <p className="text-2xl font-bold text-amber-900 flex items-center justify-center gap-2">
                        {metrics.views.toLocaleString()}
                        <FaEye className="text-amber-600" size={18} />
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs font-semibold text-blue-700 mb-2 uppercase">
                        Likes
                      </p>
                      <p className="text-2xl font-bold text-blue-900 flex items-center justify-center gap-2">
                        {metrics.likes.toLocaleString()}
                        <BiLike className="text-blue-600" size={18} />
                      </p>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                      <p className="text-xs font-semibold text-emerald-700 mb-2 uppercase">
                        Bookmarks
                      </p>
                      <p className="text-2xl font-bold text-emerald-900 flex items-center justify-center gap-2">
                        {metrics.bookmarks.toLocaleString()}
                        <FaBookBookmark
                          className="text-emerald-600"
                          size={18}
                        />
                      </p>
                    </div>
                  </div>
                  <div className="relative w-56 h-56 mx-auto">
                    <Doughnut
                      data={donutData}
                      options={{
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            enabled: true,
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            padding: 12,
                            cornerRadius: 8,
                            titleFont: {
                              size: 13,
                              weight: "bold",
                            },
                            bodyFont: {
                              size: 12,
                            },
                            callbacks: {
                              title: (tooltipItems) => {
                                return donutData.labels[
                                  tooltipItems[0].dataIndex
                                ];
                              },
                              label: (context) => {
                                const label =
                                  donutData.labels[context.dataIndex];
                                const value =
                                  donutData.datasets[0].data[context.dataIndex];

                                if (selectedStartup === "all") {
                                  return `${label}: ${value} likes`;
                                } else {
                                  const metrics = [
                                    "Likes",
                                    "Bookmarks",
                                    "Views",
                                  ];
                                  return `${
                                    metrics[context.dataIndex]
                                  }: ${value}`;
                                }
                              },
                            },
                          },
                        },
                        cutout: "70%",
                        animation: {
                          animateRotate: true,
                          animateScale: true,
                        },
                      }}
                      plugins={[centerTextPlugin]}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Line Chart Card - Enhanced */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Engagement Over Time
                </h2>
                <p className="text-sm text-gray-600 font-medium">
                  Monthly trends for views, likes, and bookmarks
                </p>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-72">
                  <Line
                    data={engagementData}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                              size: 12,
                              weight: "500",
                            },
                          },
                        },
                        tooltip: {
                          mode: "index",
                          intersect: false,
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          padding: 12,
                          cornerRadius: 8,
                          titleFont: {
                            size: 13,
                            weight: "bold",
                          },
                          bodyFont: {
                            size: 12,
                          },
                        },
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false,
                          },
                          title: {
                            display: true,
                            text: "Months",
                            font: {
                              size: 12,
                              weight: "600",
                            },
                          },
                        },
                        y: {
                          grid: {
                            color: "rgba(0, 0, 0, 0.05)",
                          },
                          title: {
                            display: true,
                            text: "Engagement Count",
                            font: {
                              size: 12,
                              weight: "600",
                            },
                          },
                          beginAtZero: true,
                        },
                      },
                      interaction: {
                        mode: "nearest",
                        axis: "x",
                        intersect: false,
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Professional Startups Table */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Your Startups</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage and monitor all your startup listings
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Startup Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Industry
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Founded Date
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative w-12 h-12 mb-4">
                            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
                          </div>
                          <p className="text-gray-600 font-semibold text-sm">
                            Loading startups...
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Please wait
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : displayList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                              />
                            </svg>
                          </div>
                          <p className="text-gray-900 font-semibold text-base mb-1">
                            No startups found
                          </p>
                          <p className="text-gray-500 text-sm mb-4">
                            Start by adding your first startup
                          </p>
                          <button
                            onClick={openAddMethodModal}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Add Your First Startup
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayList.map((item) => {
                      const isDraft = !!item.isDraft;
                      const formattedDate = item.foundedDate
                        ? new Date(item.foundedDate).toLocaleDateString()
                        : "N/A";

                      return (
                        <tr
                          key={`${isDraft ? "draft" : "startup"}-${item.id}`}
                          className={`${
                            isDraft
                              ? "bg-amber-50"
                              : "hover:bg-gray-50 cursor-pointer"
                          } transition-colors duration-150`}
                          onClick={() =>
                            !isDraft && navigate(`/startup/${item.id}`)
                          }
                        >
                          {/* Startup Name + Logo + Location */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                  {logoUrls[item.id] ? (
                                    <img
                                      src={logoUrls[item.id]}
                                      alt={item.companyName}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                  ) : logoUrls[item.id] === null ? (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex bg-gray-600 items-center justify-center">
                                      <span className="text-lg font-bold text-white">
                                        {(item.companyName ||
                                          "?")[0].toUpperCase()}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center animate-pulse">
                                      <svg
                                        className="w-6 h-6 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="font-semibold text-gray-900 truncate text-sm">
                                    {item.companyName || "Untitled Draft"}
                                  </p>
                                  {isDraft && (
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded">
                                      Draft
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  {item.locationName || "No location"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Industry */}
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-100">
                              {item.industry || "N/A"}
                            </span>
                          </td>

                          {/* Founded Date */}
                          <td className="px-6 py-4 text-center text-sm text-gray-600">
                            {formattedDate}
                          </td>

                          {/* Email */}
                          <td className="px-6 py-4 text-center">
                            <a
                              href={`mailto:${item.contactEmail}`}
                              className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
                            >
                              {item.contactEmail || "N/A"}
                            </a>
                          </td>

                          {/* Phone Number */}
                          <td className="px-6 py-4 text-center text-sm text-gray-600">
                            {item.phoneNumber || "N/A"}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 text-center">
                            {isDraft ? (
                              <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md">
                                Draft
                              </span>
                            ) : item.emailVerified ? (
                              <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-md">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Verified
                              </span>
                            ) : (
                              <button
                                className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerifyNow(item.id, item.contactEmail);
                                }}
                              >
                                Verify Now
                              </button>
                            )}
                          </td>

                          {/* Actions */}
                          <td
                            className="px-6 py-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-center gap-2">
                              {isDraft ? (
                                <>
                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/add-startup?draftId=${item.id}`
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                    title="Continue editing draft"
                                  >
                                    <PlayCircle size={14} /> Continue
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteDraftClick(
                                        item.id,
                                        item.companyName
                                      )
                                    }
                                    className="inline-flex items-center justify-center w-8 h-8 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                    title="Delete draft"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleNavigateToUpdate(item)}
                                    className="inline-flex items-center justify-center w-8 h-8 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(item)}
                                    className="inline-flex items-center justify-center w-8 h-8 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {verificationModal && (
          <Verification
            setVerificationModal={setVerificationModal}
            startupId={selectedStartupId}
            contactEmail={selectedContactEmail}
            resetForm={() => {}}
            onVerifySuccess={handleVerifySuccess}
          />
        )}
        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 transition-opacity z-50"
              onClick={() =>
                !deleteModal.isDeleting &&
                setDeleteModal({ ...deleteModal, isOpen: false })
              }
              aria-hidden="true"
            ></div>

            {/* Modal container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
                {/* Modal header */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-gray-900">
                          Delete Startup
                        </h3>
                        <button
                          onClick={() =>
                            !deleteModal.isDeleting &&
                            setDeleteModal({ ...deleteModal, isOpen: false })
                          }
                          className="text-gray-400 hover:text-gray-600"
                          disabled={deleteModal.isDeleting}
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Are you sure you want to delete{" "}
                          <span className="font-semibold text-gray-900">
                            {deleteModal.startupName}
                          </span>
                          ?
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          This action cannot be undone and all data will be
                          permanently removed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Error message */}
                  {deleteModal.error && (
                    <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                      <div className="flex items-start gap-2">
                        <svg
                          className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-sm text-red-700">
                          {deleteModal.error}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer with action buttons */}
                <div className="border-t border-gray-200 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    onClick={() =>
                      setDeleteModal({ ...deleteModal, isOpen: false })
                    }
                    disabled={deleteModal.isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    onClick={confirmDeleteStartup}
                    disabled={deleteModal.isDeleting}
                  >
                    {deleteModal.isDeleting ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Delete Draft Confirmation Modal */}
        {deleteDraftModal.isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 transition-opacity z-50"
              onClick={() =>
                !deleteDraftModal.isDeleting &&
                setDeleteDraftModal({ ...deleteDraftModal, isOpen: false })
              }
              aria-hidden="true"
            ></div>

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
                {/* Modal Content */}
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-red-100 rounded-full p-2.5 dark:bg-red-900/30">
                      <Trash2 className="h-6 w-6 text-red-600 dark:text-red-500" />
                    </div>
                    <div className="ml-4 w-full">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-6">
                          Delete Draft
                        </h3>
                        <button
                          onClick={() =>
                            !deleteDraftModal.isDeleting &&
                            setDeleteDraftModal({
                              ...deleteDraftModal,
                              isOpen: false,
                            })
                          }
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                          disabled={deleteDraftModal.isDeleting}
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Are you sure you want to delete the draft{" "}
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {deleteDraftModal.draftName}
                          </span>
                          ?
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          This action cannot be undone and the draft will be
                          permanently removed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {deleteDraftModal.error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded animate-pulse">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <p className="ml-2 text-sm text-red-700 dark:text-red-400">
                          {deleteDraftModal.error}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* Actions */}
                <div className="px-6 py-4 sm:flex sm:flex-row-reverse">
                  {/* Delete Button */}
                  <button
                    type="button"
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-white font-medium 
              ${
                deleteDraftModal.isDeleting
                  ? "bg-red-400 dark:bg-red-500/70"
                  : "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              } 
              shadow-sm focus:ring-4 focus:ring-red-300 dark:focus:ring-red-700 focus:outline-none
              transition-all duration-200 ease-in-out sm:ml-3
              ${
                deleteDraftModal.isDeleting
                  ? "opacity-80 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
                    onClick={handleDeleteDraft}
                    disabled={deleteDraftModal.isDeleting}
                  >
                    <div className="flex items-center justify-center">
                      {deleteDraftModal.isDeleting ? (
                        <>
                          <svg
                            className="w-4 h-4 mr-2 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-1.5" />
                          <span>Delete Draft</span>
                        </>
                      )}
                    </div>
                  </button>

                  {/* Cancel Button */}
                  <button
                    type="button"
                    className={`mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2.5 rounded-lg
              border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
              text-gray-700 dark:text-gray-200 font-medium
              hover:bg-gray-50 dark:hover:bg-gray-600
              focus:ring-4 focus:ring-indigo-100 dark:focus:ring-gray-700 focus:outline-none
              transition-all duration-200 ease-in-out
              ${
                deleteDraftModal.isDeleting
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
                    onClick={() =>
                      setDeleteDraftModal({
                        ...deleteDraftModal,
                        isOpen: false,
                      })
                    }
                    disabled={deleteDraftModal.isDeleting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FaEye } from "react-icons/fa";
import { BiLike } from "react-icons/bi";
import { FaBookBookmark } from "react-icons/fa6";
import { ArrowLeft, Edit, Trash2, Save, X, ExternalLink, PlayCircle } from "lucide-react";
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
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/${startupId}/photo`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setLogoUrls((prev) => ({
          ...prev,
          [startupId]: imageUrl,
        }));
      }
    } catch (error) {
      console.error(`Error fetching logo for startup ${startupId}:`, error);
    }
  };

  const fetchDrafts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/startups/draft`, {
        credentials: "include",
      });

      // If no draft → 204 or error
      if (res.status === 204 || !res.ok) {
        setDrafts([]); // ← Important: clear drafts
        return;
      }

      const rawDraft = await res.json();

      // Backend currently returns: { formData: "...stringified...", selectedTab: "..." }
      let parsedFormData;
      try {
        // Sometimes it's double-stringified because of how backend saves it
        parsedFormData = typeof rawDraft.formData === "string" 
          ? JSON.parse(rawDraft.formData) 
          : rawDraft.formData;

        if (typeof parsedFormData === "string") {
          parsedFormData = JSON.parse(parsedFormData);
        }
      } catch (e) {
        console.warn("Failed to parse draft formData, using raw", e);
        parsedFormData = {};
      }

      const draftObject = {
        ...parsedFormData,
        companyName: parsedFormData.companyName || "Untitled Draft",
        industry: parsedFormData.industry || "Not specified",
        locationName: parsedFormData.locationName || "No location",
        contactEmail: parsedFormData.contactEmail || "",
        foundedDate: parsedFormData.foundedDate || null,
        selectedTab: rawDraft.selectedTab || "Company Information",
        isDraft: true,
        draftId: `server-draft-${Date.now()}`, // unique key even with one draft
      };

      // CURRENT: Only one draft allowed → replace array
      setDrafts([draftObject]);

      // FUTURE: When backend supports multiple drafts → just change this line to:
      // setDrafts(prev => [...prev, draftObject]);
    } catch (err) {
      console.error("Error fetching draft:", err);
      setDrafts([]);
    }
  };

  const displayList = useMemo(() => {
    const filteredStartups = startups.filter(s =>
      [s.companyName, s.industry, s.locationName].some(field =>
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
      startupsData.forEach((startup) => fetchCompanyLogo(startup.id));

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
    startup.id === verifiedStartupId ? { ...startup, emailVerified: true } : startup
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
        await Promise.all([
          fetchStartupIds(),
          fetchStartups(),
          fetchDrafts(),   // ← This loads your draft
        ]);

        // After startups are loaded, fetch logos and metrics
        startups.forEach(s => fetchCompanyLogo(s.id));
        if (startupIds.length > 0) {
          await fetchTotalMetrics(startupIds);
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
  }, []); // ← Only runs once on mount


  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-10 space-y-6 bg-white text-black">
      <button
        onClick={() => navigate("/")}
        className="cursor-pointer flex items-center text-black mb-6 transition-colors hover:text-white hover:bg-indigo-500 rounded-md p-1.5"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        <span>Back to Home</span>
      </button>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow-md">
          <div className="flex items-center">
            <div className="py-1">
              <svg
                className="h-6 w-6 mr-4 text-red-500"
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
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {actionSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded shadow-md">
          <div className="flex items-center">
            <div className="py-1">
              <svg
                className="h-6 w-6 mr-4 text-green-500"
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
            <div>
              <p className="font-bold">Success</p>
              <p className="text-sm">{actionSuccess}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 pr-10">
        <input
          type="text"
          placeholder="Search Startups"
          className="input input-bordered w-full md:max-w-xs bg-white border-gray-300 border-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            className={`btn ${
              activeFilter === "All" ? "btn-primary" : "btn-outline"
            } btn-sm`}
            onClick={() => handleFilterClick("All")}
          >
            All
          </button>
          <button
            className={`btn ${
              activeFilter === "Likes" ? "btn-primary" : "btn-outline"
            } btn-sm`}
            onClick={() => handleFilterClick("Likes")}
          >
            Likes
          </button>
          <button
            className={`btn ${
              activeFilter === "Bookmarks" ? "btn-primary" : "btn-outline"
            } btn-sm`}
            onClick={() => handleFilterClick("Bookmarks")}
          >
            Bookmarks
          </button>
          <button
            className={`btn ${
              activeFilter === "Views" ? "btn-primary" : "btn-outline"
            } btn-sm`}
            onClick={() => handleFilterClick("Views")}
          >
            Views
          </button>
        </div>
      </div>

      <div className="stats shadow w-full text-black">
        <div className="stat place-items-center">
          <div className="stat-title text-black">Views</div>
          <div className="stat-value">{loading ? "..." : metrics.views}</div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title text-black">Bookmarks</div>
          <div className="stat-value text-secondary">
            {loading ? "..." : metrics.bookmarks}
          </div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title text-black">Likes</div>
          <div className="stat-value">{loading ? "..." : metrics.likes}</div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="card w-full lg:w-1/2 p-4 bg-white shadow-md rounded-md">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h3 className="text-lg font-bold text-blue-900">
              {startupIds.length} Total Startups
            </h3>
            <div className="w-full max-w-sm">
              <label
                htmlFor="startup-select"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Select a startup
              </label>
              <select
                id="startup-select"
                value={selectedStartup}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg 
                focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                disabled={loading}
              >
                <option value="all">All Startups</option>
                {startups.map((st) => (
                  <option value={st.id} key={st.id}>
                    {st.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="loading loading-spinner loading-lg text-blue-900"></div>
            </div>
          ) : (
            <>
              <div className="text-center flex flex-wrap items-center justify-evenly text-sm font-semibold text-gray-400 mt-4">
                <div className="mx-4 my-2">
                  <p>Views</p>
                  <p className="text-2xl flex items-center">
                    {metrics.views} <FaEye className="ml-2 text-blue-900" />
                  </p>
                </div>
                <div className="mx-4 my-2">
                  <p>Likes</p>
                  <p className="text-2xl flex items-center">
                    {metrics.likes} <BiLike className="ml-2 text-blue-900" />
                  </p>
                </div>
                <div className="mx-4 my-2">
                  <p>Bookmarks</p>
                  <p className="text-2xl flex items-center">
                    {metrics.bookmarks}{" "}
                    <FaBookBookmark className="ml-2 text-blue-900" />
                  </p>
                </div>
              </div>
              <div className="w-40 h-40 mx-auto p-1 border-4 border-blue-900 mt-4 rounded-full flex items-center justify-center">
                <Doughnut
                  data={donutData}
                  options={{
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        enabled: true,
                        callbacks: {
                          title: (tooltipItems) => {
                            return donutData.labels[tooltipItems[0].dataIndex];
                          },
                          label: (context) => {
                            const label = donutData.labels[context.dataIndex];
                            const value =
                              donutData.datasets[0].data[context.dataIndex];

                            if (selectedStartup === "all") {
                              return `${label}: ${value} likes`;
                            } else {
                              const metrics = ["Likes", "Bookmarks", "Views"];
                              return `${metrics[context.dataIndex]}: ${value}`;
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

        <Card className="w-full lg:w-1/2">
          <CardContent>
            <h2 className="text-xl text-blue-900 font-semibold mb-2">
              Engagement Over Time
            </h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="loading loading-spinner loading-lg text-blue-900"></div>
              </div>
            ) : (
              <div className="w-full h-64">
                <Line
                  data={engagementData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                      tooltip: {
                        mode: "index",
                        intersect: false,
                      },
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: "Months",
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: "Engagement Count",
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
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead className="text-white bg-blue-900">
            <tr>
              <th>Startup Name</th>
              <th>Industry</th>
              <th>Founded Date</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  Loading startups...
                </td>
              </tr>
            ) : displayList.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No startups or drafts found
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
                    key={isDraft ? item.draftId : item.id}
                    className={`${!isDraft ? "hover cursor-pointer" : "bg-amber-50"} transition-colors`}
                    onClick={() => !isDraft && navigate(`/startup/${item.id}`)}
                  >
                    {/* Startup Name + Logo + Location */}
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div className="w-14 h-14 rounded-full ring-4 ring-blue-900 ring-offset-2 ring-offset-white">
                            {logoUrls[item.id] ? (
                              <img
                                src={logoUrls[item.id]}
                                alt={item.companyName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold text-gray-700">
                                {(item.companyName || "?")[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-base flex items-center gap-2">
                            {item.companyName || "Untitled Draft"}
                            {isDraft && <span className="badge badge-warning badge-sm">Draft</span>}
                          </div>
                          <div className="text-sm opacity-70">
                            {item.locationName || "No location"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="font-medium">{item.industry || "N/A"}</td>

                    {/* Founded Date */}
                    <td>{formattedDate}</td>

                    {/* Email */}
                    <td className="text-sm">{item.contactEmail || "N/A"}</td>

                    {/* Phone Number */}
                    <td className="text-sm">{item.phoneNumber || "N/A"}</td>

                    {/* Status */}
                    <td>
                      {isDraft ? (
                        <span className="badge badge-ghost badge-sm">Draft</span>
                      ) : item.emailVerified ? (
                        <span className="badge badge-success badge-sm">Verified</span>
                      ) : (
                        <button
                          className="btn btn-xs btn-outline btn-info"
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
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {isDraft ? (
                          <button
                            onClick={() => navigate("/add-startup?draft=true")}
                            className="btn btn-sm btn-primary flex items-center gap-1"
                          >
                            <PlayCircle size={18} /> Continue
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleNavigateToUpdate(item)}
                              className="btn btn-sm btn-outline"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(item)}
                              className="btn btn-sm btn-outline btn-error"
                              title="Delete"
                            >
                              <Trash2 size={16} />
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
        <div className="text-right mt-4">
          <button
            onClick={openAddMethodModal} 
            className="btn btn-primary"
            disabled={loading}
          >
            Add Startup
          </button>
        </div>
        {verificationModal && (
          <Verification
            setVerificationModal={setVerificationModal}
            startupId={selectedStartupId}
            contactEmail={selectedContactEmail}
            resetForm={() => {}}
            onVerifySuccess={handleVerifySuccess} // Pass the callback
          />
        )}
        {/* Delete Confirmation Modal */}
        {deleteModal.isOpen && (
          <>
            {/* Backdrop with smooth fade-in */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out z-50"
              onClick={() =>
                !deleteModal.isDeleting &&
                setDeleteModal({ ...deleteModal, isOpen: false })
              }
              aria-hidden="true"
            ></div>

            {/* Modal container with slide-up animation */}
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 sm:px-0">
              <div
                className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden w-full max-w-md mx-auto transform transition-all duration-300 ease-in-out"
                style={{ animation: "0.3s ease-out 0s 1 slideInFromBottom" }}
              >
                {/* Modal header with visual separation */}
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-red-100 rounded-full p-2.5 dark:bg-red-900/30">
                      <Trash2 className="h-6 w-6 text-red-600 dark:text-red-500" />
                    </div>
                    <div className="ml-4 w-full">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-6">
                          Delete Startup
                        </h3>
                        <button
                          onClick={() =>
                            !deleteModal.isDeleting &&
                            setDeleteModal({ ...deleteModal, isOpen: false })
                          }
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                          disabled={deleteModal.isDeleting}
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Are you sure you want to delete{" "}
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {deleteModal.startupName}
                          </span>
                          ?
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          This action cannot be undone and all associated data
                          will be permanently removed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Error message with improved styling */}
                  {deleteModal.error && (
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
                          {deleteModal.error}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider line */}
                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* Footer with action buttons */}
                <div className="px-6 py-4 sm:flex sm:flex-row-reverse">
                  {/* Delete button with enhanced danger styling */}
                  <button
                    type="button"
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-white font-medium 
              ${
                deleteModal.isDeleting
                  ? "bg-red-400 dark:bg-red-500/70"
                  : "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              } 
              shadow-sm focus:ring-4 focus:ring-red-300 dark:focus:ring-red-700 focus:outline-none
              transition-all duration-200 ease-in-out sm:ml-3
              ${
                deleteModal.isDeleting
                  ? "opacity-80 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
                    onClick={confirmDeleteStartup}
                    disabled={deleteModal.isDeleting}
                  >
                    <div className="flex items-center justify-center">
                      {deleteModal.isDeleting ? (
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
                          <span>Delete Permanently</span>
                        </>
                      )}
                    </div>
                  </button>

                  {/* Cancel button with subtle styling */}
                  <button
                    type="button"
                    className={`mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2.5 rounded-lg
              border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
              text-gray-700 dark:text-gray-200 font-medium
              hover:bg-gray-50 dark:hover:bg-gray-600
              focus:ring-4 focus:ring-indigo-100 dark:focus:ring-gray-700 focus:outline-none
              transition-all duration-200 ease-in-out
              ${
                deleteModal.isDeleting
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
                    onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                    disabled={deleteModal.isDeleting}
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

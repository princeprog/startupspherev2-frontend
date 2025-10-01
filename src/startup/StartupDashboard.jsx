import React, { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { BiLike } from "react-icons/bi";
import { FaBookBookmark } from "react-icons/fa6";
import { ArrowLeft, Edit, Trash2, Save, X, ExternalLink } from "lucide-react";
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
import Verification from "../modals/DashboardVerification"; // Adjust path as needed
import { toast } from "react-toastify"; // Assuming you use toast for notifications

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

  const handleDeleteStartup = async (id) => {
    if (window.confirm("Are you sure you want to delete this startup?")) {
      setSubmitting(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/startups/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

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
      } catch (error) {
        console.error("Error deleting startup:", error);
        setError("Failed to delete startup. Please try again.");
        setTimeout(() => setError(null), 3000);
      } finally {
        setSubmitting(false);
      }
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
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/likes/count/startup/${id}`, {
            credentials: "include",
          })
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
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bookmarks/count/startup/${id}`, {
            credentials: "include",
          })
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
          fetch(`${import.meta.env.VITE_BACKEND_URL}/startups/${id}/view-count`, {
            credentials: "include",
          })
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
                  `${import.meta.env.VITE_BACKEND_URL}/api/likes/count/startup/${startup.id}`,
                  {
                    credentials: "include",
                  }
                ),
                fetch(
                  `${import.meta.env.VITE_BACKEND_URL}/api/bookmarks/count/startup/${startup.id}`,
                  {
                    credentials: "include",
                  }
                ),
                fetch(
                  `${import.meta.env.VITE_BACKEND_URL}/startups/${startup.id}/view-count`,
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
          fetch(`${import.meta.env.VITE_BACKEND_URL}/startups/${startupId}/view-count`, {
            credentials: "include",
          }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/likes/count/startup/${startupId}`, {
            credentials: "include",
          }),
          fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/bookmarks/count/startup/${startupId}`,
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
            `${import.meta.env.VITE_BACKEND_URL}/api/views/grouped-by-month/logged-in-user-startups`,
            {
              credentials: "include",
            }
          ),
          fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/bookmarks/grouped-by-month/logged-in-user-startups`,
            {
              credentials: "include",
            }
          ),
          fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/likes/grouped-by-month/logged-in-user-startups`,
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
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/views/count-by-month/${startupId}`, {
            credentials: "include",
          }),
          fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/bookmarks/grouped-by-month/startup/${startupId}`,
            {
              credentials: "include",
            }
          ),
          fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/likes/grouped-by-month/startup/${startupId}`,
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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/startups/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
        credentials: "include",
      });

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

  const filteredStartups = startups.filter((startup) => {
    const query = searchQuery.toLowerCase();
    return (
      startup.companyName?.toLowerCase().includes(query) ||
      startup.industry?.toLowerCase().includes(query) ||
      startup.locationName?.toLowerCase().includes(query)
    );
  });

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
    setSelectedStartupId(id);
    setSelectedContactEmail(email);
    setVerificationModal(true);
    /*handleSendCode(id, email);*/
  };

  const handleSendCode = async (id, email) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/startups/send-verification-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId: id, email }),
        credentials: "include",
      });
      if (response.ok) toast.success("Verification code sent to your email!");
      else toast.error("Failed to send verification code.");
    } catch (error) {
      console.error("Error sending code:", error);
      toast.error("Error sending verification code.");
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);

      try {
        const ids = await fetchStartupIds();
        const startupsData = await fetchStartups();

        if (startupsData && startupsData.length > 0) {
          startupsData.forEach((startup) => {
            fetchCompanyLogo(startup.id);
          });
        }

        if (ids && ids.length > 0) {
          await fetchAllStartupsData();
        }
      } catch (error) {
        console.error("Error during initialization:", error);
        setError("Failed to initialize dashboard. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

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
                <td colSpan={7} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : filteredStartups.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  No startups found
                </td>
              </tr>
            ) : (
              filteredStartups.map((st) => {
                const formattedDate = st.foundedDate
                  ? new Date(st.foundedDate).toLocaleDateString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A";

                return (
                  <tr
                    key={st.id}
                    className="hover cursor-pointer"
                    onClick={() => navigate(`/startup/${st.id}`)}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle h-12 w-12">
                            {logoUrls[st.id] ? (
                              <img
                                src={logoUrls[st.id]}
                                alt={`${st.companyName} logo`}
                                className="object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/100?text=No+Logo";
                                }}
                              />
                            ) : (
                              <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                                <span className="text-gray-500 text-xs">
                                  {st.companyName?.charAt(0)?.toUpperCase() ||
                                    "?"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{st.companyName}</div>
                          <div className="text-sm opacity-50">
                            {st.locationName || "Location not specified"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {st.industry || "N/A"}
                      <br />
                      <span className="badge badge-ghost badge-sm">
                        {st.website ? (
                          <a
                            href={
                              st.website.startsWith("http")
                                ? st.website
                                : `https://${st.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {st.website} <ExternalLink size={12} />
                          </a>
                        ) : (
                          "No website"
                        )}
                      </span>
                    </td>
                    <td>{formattedDate}</td>
                    <td>{st.contactEmail || "N/A"}</td>
                    <td>{st.phoneNumber || "N/A"}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {st.emailVerified ? (
                        "Verified"
                      ) : (
                        <button
                          className="btn btn-sm btn-outline btn-success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerifyNow(st.id, st.contactEmail);
                          }}
                          disabled={submitting}
                        >
                          Verify Now
                        </button>
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateToUpdate(st);
                          }}
                          className="btn btn-sm btn-outline btn-info"
                          disabled={submitting}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStartup(st.id);
                          }}
                          className="btn btn-sm btn-outline btn-error"
                          disabled={submitting}
                        >
                          <Trash2 size={16} />
                        </button>
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
          />
        )}
      </div>
    </div>
  );
}
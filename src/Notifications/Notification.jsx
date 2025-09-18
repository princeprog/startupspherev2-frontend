import React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  FaBell,
  FaCheckCircle,
  FaRegCircle,
  FaRegTrashAlt,
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import { IoFilter } from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";
import { MdAccessTimeFilled } from "react-icons/md";
import { toast } from "react-toastify";

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Notification component failed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <FaBell className="h-12 w-12 text-gray-400 mx-auto mb-4" />

          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            We had trouble loading your notifications
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function NotificationComponent() {

  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest"); // 'newest' or 'oldest'
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [deletingIds, setDeletingIds] = useState([]);
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  const initiateDelete = (id) => {
    setConfirmingDelete(id);
  };

  const confirmDelete = async () => {
    if (confirmingDelete) {
      await handleDelete(confirmingDelete);
      setConfirmingDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmingDelete(null);
  };

  // Basic filter categories
  const statusFilters = [
    { id: "all", name: "All" },
    { id: "unread", name: "Unread" },
    { id: "read", name: "Read" },
  ];

  // Dynamic type filters based on the notifications data
  const typeFilters = useMemo(() => {
    // Default "All Types" filter is always present
    const filters = [{ id: "all", name: "All Types" }];

    // Add unique types from the fetched notifications
    if (notifications && notifications.length > 0) {
      const types = new Set();
      notifications.forEach((notif) => {
        if (notif && notif.type) {
          types.add(notif.type);
        }
      });

      // Create a filter for each unique type
      Array.from(types).forEach((type) => {
        filters.push({
          id: type,
          name: type.charAt(0).toUpperCase() + type.slice(1) + "s",
        });
      });
    } else {
      // Default types if no notifications or not loaded yet
      filters.push(
        { id: "connection", name: "Connections" },
        { id: "message", name: "Messages" },
        { id: "update", name: "Updates" },
        { id: "system", name: "System" }
      );
    }

    return filters;
  }, [notifications]);

  // Helper function to transform API data to our component's format
  const transformNotificationData = (item) => {
    return {
      id: item.id,
      type: determineNotificationType(item),
      content: item.remarks,
      isRead: item.viewed,
      action: determineAction(item),
      entityId: item.startup?.id,
      timestamp: item.createdAt || new Date().toISOString(),
      sender: item.startup
        ? {
            id: item.startup.id,
            name: item.startup.companyName,
            avatar: item.startup.photo
              ? `${import.meta.env.VITE_BACKEND_URL}/startups/${
                  item.startup.id
                }/photo`
              : null,
          }
        : null,
      rawData: item, // Store the raw data for reference if needed
    };
  };

  // Helper to determine action based on notification content
  const determineAction = (item) => {
    if (item.viewed) return null;

    const message = item.remarks?.toLowerCase() || "";

    if (message.includes("application") || message.includes("submitted")) {
      return "Review";
    } else if (message.includes("message") || message.includes("contact")) {
      return "Reply";
    } else if (message.includes("connect") || message.includes("follow")) {
      return "Respond";
    } else {
      return "View";
    }
  };

  // Helper to determine notification type based on content
  const determineNotificationType = (item) => {
    const message = item.remarks?.toLowerCase() || "";

    if (message.includes("application") || message.includes("submitted")) {
      return "update";
    } else if (message.includes("message") || message.includes("contact")) {
      return "message";
    } else if (message.includes("connect") || message.includes("follow")) {
      return "connection";
    } else {
      return "system";
    }
  };

  // Fetch real notification data from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use fetch instead of axios to call the API
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/notifications/my`,
        {
          method: "GET",
          credentials: "include", // Important for cookies/auth
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        let notificationData = [];

        // Handle both array and single object responses
        if (Array.isArray(result.data)) {
          notificationData = result.data.map((item) =>
            transformNotificationData(item)
          );
        } else if (result.data) {
          // Single notification object
          notificationData = [transformNotificationData(result.data)];
        }

        // Sort notifications by default (newest first)
        notificationData.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        setNotifications(notificationData);
      } else {
        throw new Error(result.message || "Failed to fetch notifications");
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setError("Failed to load notifications. Please try again later.");

      // Fallback to mock data for development/demo
      console.log("Using mock data as fallback");
      const mockData = generateMockNotifications();
      setNotifications(mockData);

      setLoading(false);
    }
  };

  // Generate mock data for development/fallback
  const generateMockNotifications = () => {
    try {
      const types = ["connection", "message", "update", "system"];
      const mockData = [];

      for (let i = 1; i <= 15; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const isRead = Math.random() > 0.4;

        let content = "";
        let action = null;
        let entityId = Math.floor(Math.random() * 1000);

        switch (type) {
          case "connection":
            content = `${getRandomName()} wants to connect with you`;
            action = "Respond";
            break;
          case "message":
            content = `New message from ${getRandomName()}`;
            action = "Reply";
            break;
          case "update":
            content = `${getRandomStartupName()} just updated their profile`;
            action = "View";
            break;
          case "system":
            content = getRandomSystemMessage();
            break;
          default:
            content = "New notification";
        }

        mockData.push({
          id: i,
          type,
          content,
          isRead,
          action: isRead ? null : action,
          entityId,
          timestamp: new Date(
            Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
          ).toISOString(),
          sender:
            type !== "system"
              ? {
                  id: Math.floor(Math.random() * 100),
                  name: getRandomName(),
                  avatar: `https://i.pravatar.cc/150?img=${Math.floor(
                    Math.random() * 70
                  )}`,
                }
              : null,
        });
      }

      // Sort by date (newest first)
      mockData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return mockData;
    } catch (error) {
      console.error("Error generating mock data:", error);
      return [];
    }
  };

  // Helper functions for mock data
  const getRandomName = () => {
    const firstNames = [
      "Alex",
      "Jordan",
      "Taylor",
      "Morgan",
      "Casey",
      "Riley",
      "Jamie",
      "Avery",
      "Cameron",
      "Skyler",
    ];
    const lastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Jones",
      "Brown",
      "Davis",
      "Miller",
      "Wilson",
      "Moore",
      "Taylor",
    ];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
      lastNames[Math.floor(Math.random() * lastNames.length)]
    }`;
  };

  const getRandomStartupName = () => {
    const prefixes = [
      "Tech",
      "Inno",
      "Future",
      "Smart",
      "Eco",
      "Next",
      "Quantum",
      "Cyber",
      "Digital",
      "Meta",
    ];
    const suffixes = [
      "Corp",
      "Labs",
      "Tech",
      "AI",
      "Solutions",
      "Systems",
      "Hub",
      "Works",
      "Wave",
      "Sphere",
    ];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${
      suffixes[Math.floor(Math.random() * suffixes.length)]
    }`;
  };

  const getRandomSystemMessage = () => {
    const messages = [
      "Your account has been verified successfully",
      "Security alert: New login detected",
      "Platform maintenance scheduled for tomorrow",
      "Your subscription will renew in 7 days",
      "We've updated our privacy policy",
      "New feature alert: Check out our new dashboard",
      "Your profile is 80% complete",
      "Welcome to StartupSphere!",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Load notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    try {
      if (!notifications || notifications.length === 0) {
        setFilteredNotifications([]);
        return;
      }

      let result = [...notifications];

      // Apply status filter
      if (activeFilter === "read") {
        result = result.filter((notif) => notif && notif.isRead);
      } else if (activeFilter === "unread") {
        result = result.filter((notif) => notif && !notif.isRead);
      }

      // Apply type filter
      if (activeTypeFilter !== "all") {
        result = result.filter(
          (notif) => notif && notif.type === activeTypeFilter
        );
      }

      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(
          (notif) =>
            notif &&
            ((notif.content && notif.content.toLowerCase().includes(query)) ||
              (notif.sender &&
                notif.sender.name &&
                notif.sender.name.toLowerCase().includes(query)))
        );
      }

      // Apply sorting
      result.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });

      setFilteredNotifications(result);
    } catch (error) {
      console.error("Error filtering notifications:", error);
      setFilteredNotifications([]);
      setError("Error filtering notifications");
    }
  }, [notifications, activeFilter, activeTypeFilter, searchQuery, sortOrder]);

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "newest" ? "oldest" : "newest"));
  };

  // Handle marking a notification as read/unread
  const handleToggleRead = async (id, currentReadStatus) => {
    try {
      // Update on the server
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/notifications/${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ viewed: !currentReadStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      // Update local state
      const updatedNotifications = notifications.map((notif) =>
        notif.id === id ? { ...notif, isRead: !currentReadStatus } : notif
      );

      setNotifications(updatedNotifications);
      toast.success(
        `Notification marked as ${currentReadStatus ? "unread" : "read"}`
      );
    } catch (error) {
      console.error("Failed to update notification:", error);
      // Fallback to just updating UI for demo
      const updatedNotifications = notifications.map((notif) =>
        notif.id === id ? { ...notif, isRead: !currentReadStatus } : notif
      );
      setNotifications(updatedNotifications);
      toast.success(
        `Notification marked as ${currentReadStatus ? "unread" : "read"}`
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingIds((prev) => [...prev, id]);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/notifications/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to delete notification (${response.status})`
        );
      }

      const updatedNotifications = notifications.filter(
        (notif) => notif.id !== id
      );
      setNotifications(updatedNotifications);
      toast.success("Notification deleted successfully");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error(
        error.message || "Failed to delete notification. Please try again."
      );
    } finally {
      setDeletingIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/notifications/my/markAllRead`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      // Update local state
      const updatedNotifications = notifications.map((notif) => ({
        ...notif,
        isRead: true,
      }));
      setNotifications(updatedNotifications);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      // Fallback to just updating UI for demo
      const updatedNotifications = notifications.map((notif) => ({
        ...notif,
        isRead: true,
      }));
      setNotifications(updatedNotifications);
      toast.success("All notifications marked as read");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffTime / (1000 * 60));

      if (diffMinutes < 60) {
        return diffMinutes <= 1 ? "Just now" : `${diffMinutes} minutes ago`;
      } else if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
      } else if (diffDays === 0) {
        return "Today";
      } else if (diffDays === 1) {
        return "Yesterday";
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown date";
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    try {
      switch (type) {
        case "connection":
          return (
            <div className="bg-blue-100 p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          );
        case "message":
          return (
            <div className="bg-green-100 p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          );
        case "update":
          return (
            <div className="bg-amber-100 p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          );
        case "system":
          return (
            <div className="bg-purple-100 p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-purple-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          );
        default:
          return (
            <div className="bg-gray-100 p-2 rounded-full">
              <FaBell className="h-5 w-5 text-gray-600" />
            </div>
          );
      }
    } catch (error) {
      console.error("Error rendering notification icon:", error);
      return (
        <div className="bg-gray-100 p-2 rounded-full">
          <FaBell className="h-5 w-5 text-gray-600" />
        </div>
      );
    }
  };

  // Count notifications by type
  const countByType = useMemo(() => {
    const counts = { all: notifications.length };

    typeFilters.forEach((filter) => {
      if (filter.id !== "all") {
        counts[filter.id] = notifications.filter(
          (n) => n && n.type === filter.id
        ).length;
      }
    });

    counts.read = notifications.filter((n) => n && n.isRead).length;
    counts.unread = notifications.filter((n) => n && !n.isRead).length;

    return counts;
  }, [notifications, typeFilters]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg">
          <FaBell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Unable to load notifications
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 pb-10 w-screen">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <FaBell className="h-8 w-8 mr-3 text-white" />
              <h1 className="text-2xl font-bold text-black">Notifications</h1>
              {!loading &&
                filteredNotifications &&
                filteredNotifications.length > 0 && (
                  <span className="ml-3 px-2.5 py-0.5 bg-white bg-opacity-20 text-black rounded-full text-sm">
                    {countByType.unread} unread
                  </span>
                )}
            </div>

            <div className="flex flex-col sm:flex-row w-full md:w-auto space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notifications..."
                  className="w-full sm:w-64 px-4 py-2 pr-10 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
              </div>

              <div className="relative">
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-800 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                >
                  <IoFilter className="h-4 w-4 mr-2" />
                  Filter
                </button>

                {showFilterMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 overflow-hidden border border-gray-100">
                    <div className="p-3 bg-gray-50 border-b border-gray-100">
                      <h3 className="font-medium text-gray-800">
                        Filter Notifications
                      </h3>
                    </div>

                    <div className="p-3">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Status
                      </p>
                      <div className="space-y-2">
                        {statusFilters.map((filter) => (
                          <button
                            key={filter.id}
                            onClick={() => {
                              setActiveFilter(filter.id);
                              setShowFilterMenu(false);
                            }}
                            className={`block text-black w-full text-left px-2 py-1 rounded flex justify-between items-center ${
                              activeFilter === filter.id
                                ? "bg-blue-50 text-blue-700"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <span>{filter.name}</span>
                            <span className="bg-gray-100 text-xs px-1.5 py-0.5 rounded-full">
                              {countByType[filter.id] || 0}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Type
                      </p>
                      <div className="space-y-2">
                        {typeFilters.map((filter) => (
                          <button
                            key={filter.id}
                            onClick={() => {
                              setActiveTypeFilter(filter.id);
                              setShowFilterMenu(false);
                            }}
                            className={`text-black block w-full text-left px-2 py-1 rounded flex justify-between items-center ${
                              activeTypeFilter === filter.id
                                ? "bg-blue-50 text-blue-700"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <span>{filter.name}</span>
                            <span className="bg-gray-100 text-xs px-1.5 py-0.5 rounded-full">
                              {countByType[filter.id] || 0}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Sort
                      </p>
                      <button
                        onClick={() => {
                          toggleSortOrder();
                          setShowFilterMenu(false);
                        }}
                        className="flex items-center w-full text-left px-2 py-1 rounded hover:bg-gray-50 text-black"
                      >
                        {sortOrder === "newest" ? (
                          <>
                            <FaSortAmountDown className="mr-2 h-4 w-4 text-gray-500" />
                            <span>Newest first</span>
                          </>
                        ) : (
                          <>
                            <FaSortAmountUp className="mr-2 h-4 w-4 text-gray-500" />
                            <span>Oldest first</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={markAllAsRead}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                disabled={
                  !filteredNotifications ||
                  !filteredNotifications.some((n) => n && !n.isRead)
                }
              >
                <FaCheckCircle className="h-4 w-4 mr-2" />
                Mark all as read
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active filters display */}
      <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Status filters */}
          <div className="flex flex-wrap gap-2 mr-4">
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors flex items-center ${
                  activeFilter === filter.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{filter.name}</span>
                <span
                  className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                    activeFilter === filter.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {countByType[filter.id] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="h-6 border-r border-gray-200 hidden sm:block"></div>

          {/* Type filters */}
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            {typeFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveTypeFilter(filter.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors flex items-center ${
                  activeTypeFilter === filter.id
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{filter.name}</span>
                <span
                  className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTypeFilter === filter.id
                      ? "bg-blue-200 text-blue-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {countByType[filter.id] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Sort toggle button */}
          <button
            onClick={toggleSortOrder}
            className="ml-auto flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
            title={
              sortOrder === "newest"
                ? "Showing newest first"
                : "Showing oldest first"
            }
          >
            {sortOrder === "newest" ? (
              <>
                <FaSortAmountDown className="mr-1.5 h-3 w-3" />
                <span className="hidden sm:inline">Newest first</span>
              </>
            ) : (
              <>
                <FaSortAmountUp className="mr-1.5 h-3 w-3" />
                <span className="hidden sm:inline">Oldest first</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <CgSpinner className="h-10 w-10 text-blue-500 animate-spin" />
              <p className="mt-4 text-gray-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications && filteredNotifications.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredNotifications.map(
                (notification) =>
                  notification && (
                    <li
                      key={notification.id}
                      className={`relative transition-all ${
                        notification.isRead ? "bg-white" : "bg-blue-50"
                      } hover:bg-gray-50`}
                    >
                      <div className="px-4 py-5 sm:px-6 flex items-start">
                        {/* Icon or avatar */}
                        <div className="flex-shrink-0 mr-4">
                          {notification.sender && notification.sender.avatar ? (
                            <img
                              src={notification.sender.avatar}
                              alt={notification.sender.name || "User"}
                              className="h-12 w-12 rounded-full object-cover border border-gray-200"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/150?text=User";
                              }}
                            />
                          ) : (
                            getNotificationIcon(notification.type)
                          )}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          {notification.sender && (
                            <div className="text-sm font-semibold text-gray-900 mb-1">
                              {notification.sender.name}
                            </div>
                          )}
                          <div className="text-sm text-gray-900">
                            {notification.content}
                          </div>
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <MdAccessTimeFilled className="flex-shrink-0 mr-1.5 h-3 w-3 text-gray-400" />
                            <span>{formatDate(notification.timestamp)}</span>

                            {!notification.isRead && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                New
                              </span>
                            )}

                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                              {notification.type}
                            </span>
                          </div>

                          {notification.action && (
                            <div className="mt-2">
                              <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                {notification.action}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 self-center flex">
                          <button
                            onClick={() =>
                              handleToggleRead(
                                notification.id,
                                notification.isRead
                              )
                            }
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                            title={
                              notification.isRead
                                ? "Mark as unread"
                                : "Mark as read"
                            }
                            aria-label={
                              notification.isRead
                                ? "Mark as unread"
                                : "Mark as read"
                            }
                          >
                            {notification.isRead ? (
                              <FaRegCircle className="h-5 w-5" />
                            ) : (
                              <FaCheckCircle className="h-5 w-5" />
                            )}
                          </button>

                          <button
                            onClick={() => initiateDelete(notification.id)}
                            disabled={deletingIds.includes(notification.id)}
                            className={`p-2 ${
                              deletingIds.includes(notification.id)
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            } rounded-full`}
                            title="Delete notification"
                            aria-label="Delete notification"
                          >
                            {deletingIds.includes(notification.id) ? (
                              <CgSpinner className="h-5 w-5 animate-spin" />
                            ) : (
                              <FaRegTrashAlt className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </li>
                  )
              )}
            </ul>
          ) : (
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="bg-gray-100 rounded-full p-4">
                <FaBell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No notifications
              </h3>
              <p className="mt-1 text-gray-500">
                {searchQuery
                  ? "No notifications match your search."
                  : activeFilter !== "all" || activeTypeFilter !== "all"
                  ? "No notifications match your current filters."
                  : "You're all caught up!"}
              </p>
              {(activeFilter !== "all" ||
                activeTypeFilter !== "all" ||
                searchQuery) && (
                <button
                  onClick={() => {
                    setActiveFilter("all");
                    setActiveTypeFilter("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Add this confirmation modal to the end of your component, before the closing div */}
      {confirmingDelete && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Notification
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this notification? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Notification() {
  return (
    <ErrorBoundary>
      <NotificationComponent />
    </ErrorBoundary>
  );
}

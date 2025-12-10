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
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'view' or 'review'
  const [startupDetails, setStartupDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
      entityId: item.startup?.id, // Keep this consistent
      timestamp: item.createdAt || new Date().toISOString(),
      sender: item.startup
        ? {
            id: item.startup.id,
            name: item.startup.companyName,
            avatar: item.startup.photo
              ? `data:image/jpeg;base64,${item.startup.photo}` // Direct base64 usage
              : null,
          }
        : null,
      rawData: item, // Store the raw data for reference if needed
    };
  };

  // Helper to determine action based on notification content
  // Helper to determine action based on notification content - update to always return an action
  const determineAction = (item) => {
    const message = item.remarks?.toLowerCase() || "";

    if (
      message.includes("application") ||
      message.includes("submitted") ||
      message.includes("approved") ||
      message.includes("rejected")
    ) {
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

        // Extract from paginated response if present
        const dataSource = result.data?.content || result.data || [];
        
        // Handle both array and single object responses
        if (Array.isArray(dataSource)) {
          notificationData = dataSource.map((item) =>
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

  // Add this function to your component
  const getNotificationContentClass = (notification) => {
    const content = notification.content?.toLowerCase() || "";

    if (content.includes("rejected") || content.includes("wasn't approved")) {
      return "px-3 py-2 border-l-4 border-red-500 bg-red-50 text-gray-900 rounded-r-md";
    } else if (content.includes("approved")) {
      return "px-3 py-2 border-l-4 border-green-500 bg-green-50 text-gray-900 rounded-r-md";
    } else if (
      content.includes("pending") ||
      content.includes("being reviewed")
    ) {
      return "px-3 py-2 border-l-4 border-yellow-500 bg-yellow-50 text-gray-900 rounded-r-md";
    } else {
      return "text-gray-900";
    }
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
  // Handle marking a notification as read only (no unread functionality)
  const handleToggleRead = async (id, currentReadStatus) => {
    try {
      // If already read, no need to call API again
      if (currentReadStatus) {
        toast.info("This notification has already been read");
        return true;
      }

      // For marking as viewed - only available for unread notifications
      const endpoint = `${
        import.meta.env.VITE_BACKEND_URL
      }/notifications/${id}/view`;

      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Log specific error details for debugging
        const errorText = await response.text().catch(() => "No error details");
        console.warn(`Server responded with ${response.status}: ${errorText}`);

        // Continue execution with local update only instead of throwing error
        console.log("Server update failed, applying local update only");
      }

      // Update local state regardless of server response
      // This ensures UI remains responsive even if the API fails
      const updatedNotifications = notifications.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      );

      setNotifications(updatedNotifications);
      toast.success("Notification marked as read");
      return true; // Return success for callers
    } catch (error) {
      console.error("Failed to update notification:", error);

      // Fallback to just updating UI for demo/resilience
      const updatedNotifications = notifications.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      );
      setNotifications(updatedNotifications);
      toast.success("Notification marked as read");
      return true; // Return success since we updated the UI
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

  // Handle notification action (View or Review)
  // Handle notification action (View or Review)
  const handleNotificationAction = async (notification, action) => {
    try {
      setActionType(action);
      setSelectedNotification(notification);
      setShowActionModal(true);
      setLoadingDetails(true);

      // Mark notification as read if it's not already
      if (!notification.isRead) {
        try {
          // Always mark as viewed when opening the notification
          const viewEndpoint = `${
            import.meta.env.VITE_BACKEND_URL
          }/notifications/${notification.id}/view`;

          console.log(`Marking notification ${notification.id} as viewed`);
          const viewResponse = await fetch(viewEndpoint, {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!viewResponse.ok) {
            console.warn(
              `Failed to mark notification as viewed: ${viewResponse.status}`
            );
          } else {
            console.log(
              `Successfully marked notification ${notification.id} as viewed`
            );
          }

          // Update local state regardless of server response to maintain UI consistency
          const updatedNotifications = notifications.map((notif) =>
            notif.id === notification.id ? { ...notif, isRead: true } : notif
          );
          setNotifications(updatedNotifications);
        } catch (err) {
          console.warn("Failed to mark notification as read:", err);
          // Continue execution despite this error to allow viewing the notification
        }
      }

      // Use the correct startup ID - first try entityId, then check notification.rawData
      let startupId = notification.entityId;

      // If entityId is not available, check the rawData
      if (!startupId && notification.rawData && notification.rawData.startup) {
        startupId = notification.rawData.startup.id;
      }

      // Fallback to sender id if still not available
      if (!startupId && notification.sender) {
        startupId = notification.sender.id;
      }

      if (startupId) {
        try {
          console.log(`Fetching startup details with ID: ${startupId}`);
          await fetchStartupDetails(startupId);
        } catch (err) {
          console.warn("Failed to fetch startup details:", err);
          setLoadingDetails(false);

          // Create a fallback from the notification's raw data if possible
          if (notification.rawData && notification.rawData.startup) {
            const startupData = notification.rawData.startup;
            setStartupDetails({
              id: startupId,
              companyName: startupData.companyName || "Unknown Startup",
              status: startupData.status || "Unknown",
              industry: startupData.industry || "Information not available",
              companyDescription:
                startupData.companyDescription || "No description available",
              city: startupData.city || "N/A",
              province: startupData.province || "N/A",
              photo: startupData.photo || null,
              contactEmail: startupData.contactEmail || "N/A",
              foundedDate: startupData.foundedDate || "N/A",
              numberOfEmployees: startupData.numberOfEmployees || "N/A",
              fundingStage: startupData.fundingStage || "N/A",
              comments: startupData.comments || notification.rawData.comments,
            });
          }
        }
      } else {
        setLoadingDetails(false);
      }
    } catch (error) {
      console.error(`Error handling ${action} action:`, error);
      toast.error(
        `Unable to process this ${action} request. Please try again.`
      );
      setLoadingDetails(false);
    }
  };

  // Fetch startup details for the modal
  const fetchStartupDetails = async (startupId) => {
    try {
      // First check if we already have these details cached
      if (startupDetails && startupDetails.id === parseInt(startupId)) {
        setLoadingDetails(false);
        return;
      }

      console.log(`Fetching details for startup ID: ${startupId}`);

      // Try to get the startup directly from the raw notification data first
      const notifWithStartup = notifications.find(
        (n) =>
          n.rawData &&
          n.rawData.startup &&
          n.rawData.startup.id === parseInt(startupId)
      );

      if (
        notifWithStartup &&
        notifWithStartup.rawData &&
        notifWithStartup.rawData.startup
      ) {
        console.log("Using startup data from notification");
        const startupData = notifWithStartup.rawData.startup;

        setStartupDetails({
          id: startupId,
          companyName: startupData.companyName || "Unknown Startup",
          status: startupData.status || "Unknown",
          industry: startupData.industry || "Information not available",
          companyDescription:
            startupData.companyDescription || "No description available",
          city: startupData.city || "N/A",
          province: startupData.province || "N/A",
          photo: startupData.photo || null,
          contactEmail: startupData.contactEmail || "N/A",
          foundedDate: startupData.foundedDate || "N/A",
          numberOfEmployees: startupData.numberOfEmployees || "N/A",
          fundingStage: startupData.fundingStage || "N/A",
          comments: startupData.comments || notifWithStartup.rawData.comments,
        });

        setLoadingDetails(false);
        return;
      }

      // If we don't have the data in notifications, make an API call
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/${startupId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "No error details");
        console.warn(`Server responded with ${response.status}: ${errorText}`);
        throw new Error(`Failed to fetch startup details (${response.status})`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        console.log("Successfully loaded startup details:", result.data.id);
        setStartupDetails({
          ...result.data,
          // Make sure comments are included if they exist
          comments:
            result.data.comments || selectedNotification?.rawData?.comments,
        });
      } else if (result.data) {
        console.log("Loaded startup details from direct data:", result.data.id);
        setStartupDetails({
          ...result.data,
          comments:
            result.data.comments || selectedNotification?.rawData?.comments,
        });
      } else {
        console.warn("API returned success but no data");
        throw new Error(
          result.message || "Failed to fetch startup details - no data returned"
        );
      }
    } catch (error) {
      console.error("Error fetching startup details:", error);

      // Create fallback from selected notification if possible
      if (
        selectedNotification &&
        selectedNotification.rawData &&
        selectedNotification.rawData.startup
      ) {
        const startupData = selectedNotification.rawData.startup;
        setStartupDetails({
          id: startupId,
          companyName: startupData.companyName || "Unknown Startup",
          status: startupData.status || "Unknown",
          industry: startupData.industry || "Information not available",
          companyDescription:
            startupData.companyDescription || "No description available",
          city: startupData.city || "N/A",
          province: startupData.province || "N/A",
          photo: startupData.photo || null,
        });
      } else {
        // Ultimate fallback
        const emergencyFallback = {
          id: startupId || "unknown",
          companyName:
            selectedNotification?.sender?.name || "Startup Information",
          status: "Unknown",
          industry: "Information not available",
          companyDescription: "We encountered an issue loading the details.",
          city: "N/A",
          province: "N/A",
        };

        setStartupDetails(emergencyFallback);
      }

      toast.error(
        "Unable to load complete startup details. Showing limited information.",
        {
          autoClose: 3000,
        }
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  // Close the action modal
  const closeActionModal = () => {
    setShowActionModal(false);
    setSelectedNotification(null);
    setStartupDetails(null);
    setActionType(null);
  };

  // Navigate to startup profile (for "View" actions)
  const navigateToStartupProfile = (startupId) => {
    // This would typically be done with React Router
    // But for now we'll just redirect with window.location
    window.location.href = `/startups/${startupId}`;
  };

  // Update the submitReview function to handle view-only access
  const submitReview = async () => {
    // Close the modal - no actual submission needed since users can only view
    closeActionModal();
  };

  // Update the modal footer section
  <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
    {!loadingDetails && startupDetails && (
      <button
        onClick={() => navigateToStartupProfile(startupDetails.id)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        View Full Profile
      </button>
    )}
    <button
      onClick={closeActionModal}
      className="px-4 py-2 ml-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
    >
      Close
    </button>
  </div>;

  // Function to determine notification action type based on content
  const getActionType = (notification) => {
    // Always return the action type regardless of read status
    // If there's no action defined, default to "View"
    return (
      notification.action ||
      // Determine action based on content for notifications without explicit action
      (notification.content?.toLowerCase().includes("application")
        ? "Review"
        : "View")
    );
  };

  // Action button renderer with proper click handlers
  const renderActionButton = (notification) => {
    const actionType = getActionType(notification);
    if (!actionType) return null;

    return (
      <button
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={() =>
          handleNotificationAction(notification, actionType.toLowerCase())
        }
      >
        {actionType}
      </button>
    );
  };

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

                          {/* Enhanced notification content with status-based styling */}
                          <div
                            className={`text-sm ${getNotificationContentClass(
                              notification
                            )}`}
                          >
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

                          {getActionType(notification) && (
                            <div className="mt-2">
                              {renderActionButton(notification)}
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
                                ? "Already read"
                                : "Mark as read"
                            }
                            aria-label={
                              notification.isRead
                                ? "Already read"
                                : "Mark as read"
                            }
                          >
                            {notification.isRead ? (
                              <FaCheckCircle className="h-5 w-5" />
                            ) : (
                              <FaRegCircle className="h-5 w-5" />
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

      {/* Add new Action Modals */}
      {showActionModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-lg w-full max-w-3xl overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionType === "review"
                  ? "Your Startup Application"
                  : "Startup Details"}
              </h3>
              <button
                onClick={closeActionModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <CgSpinner className="h-10 w-10 text-blue-500 animate-spin" />
                  <p className="mt-4 text-gray-500">Loading details...</p>
                </div>
              ) : startupDetails ? (
                <div>
                  {/* Startup Details */}
                  <div className="flex items-start">
                    {startupDetails.photo ? (
                      <img
                        src={
                          typeof startupDetails.photo === "string" &&
                          startupDetails.photo.startsWith("/9j")
                            ? `data:image/jpeg;base64,${startupDetails.photo}`
                            : `${import.meta.env.VITE_BACKEND_URL}/startups/${
                                startupDetails.id
                              }/photo`
                        }
                        alt={startupDetails.companyName}
                        className="h-24 w-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                    )}

                    <div className="ml-6">
                      <h4 className="text-xl font-bold text-gray-900">
                        {startupDetails.companyName}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {startupDetails.industry &&
                          startupDetails.industry.charAt(0).toUpperCase() +
                            startupDetails.industry.slice(1).replace("_", " ")}
                      </p>
                      <div className="mt-2 flex items-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            startupDetails.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : startupDetails.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {startupDetails.status}
                        </span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-sm text-gray-500">
                          {startupDetails.city}, {startupDetails.province}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Startup Description */}
                  <div className="mt-6">
                    <h5 className="font-medium text-gray-900">About</h5>
                    <p className="mt-2 text-gray-600">
                      {startupDetails.companyDescription ||
                        "No description provided."}
                    </p>
                  </div>

                  {/* Basic Details */}
                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                      <h5 className="font-medium text-gray-900">Founded</h5>
                      <p className="mt-1 text-gray-600">
                        {startupDetails.foundedDate || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Employees</h5>
                      <p className="mt-1 text-gray-600">
                        {startupDetails.numberOfEmployees || "N/A"}
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">
                        Funding Stage
                      </h5>
                      <p className="mt-1 text-gray-600">
                        {startupDetails.fundingStage
                          ? startupDetails.fundingStage
                              .charAt(0)
                              .toUpperCase() +
                            startupDetails.fundingStage
                              .slice(1)
                              .replace("_", " ")
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">
                        Contact Email
                      </h5>
                      <p className="mt-1 text-gray-600">
                        {startupDetails.contactEmail || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Review Form - Only for review action */}
                  {actionType === "review" && (
                    <ReviewForm
                      startupId={startupDetails.id}
                      onSubmit={submitReview}
                      currentStatus={startupDetails.status}
                      rejectionComment={
                        startupDetails.comments ||
                        selectedNotification?.rawData?.comments
                      }
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">
                    No additional details are available for this notification.
                  </p>
                  <div
                    className={`inline-block text-sm ${getNotificationContentClass(
                      selectedNotification
                    )}`}
                  >
                    {selectedNotification.content}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              {!loadingDetails && startupDetails && actionType === "view" && (
                <button
                  onClick={() => navigateToStartupProfile(startupDetails.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  View Full Profile
                </button>
              )}
              {!loadingDetails && actionType !== "review" && (
                <button
                  onClick={closeActionModal}
                  className="px-4 py-2 ml-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Replace the ReviewForm component with this enhanced version
function ReviewForm({ startupId, onSubmit, currentStatus, rejectionComment }) {
  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h5 className="font-medium text-gray-900 mb-4">Application Status</h5>

      <div className="mb-6">
        {currentStatus === "Approved" ? (
          <div className="bg-green-50 border border-green-200 rounded-md overflow-hidden">
            <div className="bg-green-100 px-4 py-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium text-green-800">Approved</span>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-gray-600">
                Congratulations! Your startup application has been approved and
                is now visible on our platform. You can now access all the
                features available to startups.
              </p>
              <div className="mt-3 flex">
                <button
                  onClick={() =>
                    (window.location.href = `/startups/${startupId}`)
                  }
                  className="text-sm text-green-700 hover:text-green-900 font-medium flex items-center"
                >
                  View your startup profile
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : currentStatus === "Pending" || currentStatus === "In Review" ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md overflow-hidden">
            <div className="bg-yellow-100 px-4 py-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium text-yellow-800">Under Review</span>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-gray-600">
                We're currently reviewing your startup application. This process
                typically takes 2-3 business days. You'll receive a notification
                once the review is complete.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-md overflow-hidden">
            <div className="bg-red-100 px-4 py-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium text-red-800">Not Approved</span>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-gray-600">
                Thank you for your submission. Unfortunately, your startup
                application wasn't approved at this time.
              </p>

              {/* Display rejection comment if available */}
              {rejectionComment && (
                <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-md">
                  <h6 className="text-sm font-medium text-red-800 mb-1">
                    Reason for rejection:
                  </h6>
                  <p className="text-sm text-gray-700">{rejectionComment}</p>
                </div>
              )}

              <p className="text-sm text-gray-600 mt-3">
                You may submit a new application with updated information that
                addresses the feedback provided.
              </p>

              <div className="mt-3 flex">
                <button
                  onClick={() => (window.location.href = "/startup-dashboard")}
                  className="text-sm text-red-700 hover:text-red-900 font-medium flex items-center"
                >
                  Create a new application
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
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

import { useState, useEffect, memo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Login from "../modals/Login";
import Signup from "../modals/Signup";
import { CiLocationOn } from "react-icons/ci";
import { FaGlobe } from "react-icons/fa";
import { FaBookmark } from "react-icons/fa6";
import { MdKeyboardReturn } from "react-icons/md";
import Bookmarks from "./Bookmarks"; // Import the Bookmarks component
import { FaHeart } from "react-icons/fa";
import { RiLoginBoxFill } from "react-icons/ri";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaRegEye } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Award } from "lucide-react";
import { MdClose, MdOutlineLink, MdLocationOn } from "react-icons/md";
import { FaRegHeart, FaRegBookmark, FaPhone } from "react-icons/fa";
import { BsCalendarEvent, BsPeople, BsBriefcase } from "react-icons/bs";
import { HiOutlineMail } from "react-icons/hi";
import { FaBell } from "react-icons/fa";

// Memoized StakeholderCard component for better performance
const StakeholderCard = memo(({ stakeholder, onClick }) => {
  // Extract first letter of first and last name for avatar
  const getInitials = (name) => {
    if (!name) return "S";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0);
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`;
  };

  // Format location with fallbacks
  const getLocation = () => {
    if (stakeholder.region) return stakeholder.region;

    const city = stakeholder.city || "";
    const province = stakeholder.province || "";

    if (city && province) return `${city}, ${province}`;
    if (city) return city;
    if (province) return province;
    return "Location N/A";
  };

  return (
    <div
      onClick={() => onClick(stakeholder)}
      className="bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 p-4 cursor-pointer group"
    >
      <div className="flex items-start space-x-3">
        {/* Stakeholder Avatar with optimized initials */}
        <div className="flex-shrink-0">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center border border-gray-100 text-blue-700 font-semibold uppercase shadow-sm">
            {getInitials(stakeholder.name)}
          </div>
        </div>

        {/* Stakeholder Details with improved layout */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate pr-2">
              {stakeholder.name || "Unnamed Stakeholder"}
            </h3>
            {stakeholder.organization && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-full whitespace-nowrap">
                {stakeholder.organization}
              </span>
            )}
          </div>

          {/* Email with fallback */}
          <p className="text-xs text-gray-600 mb-2 truncate flex items-center">
            <HiOutlineMail className="mr-1 h-3.5 w-3.5 text-gray-400" />
            {stakeholder.email || "Email not provided"}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            {/* Location with enhanced formatting */}
            <div className="flex items-center">
              <MdLocationOn className="mr-1 h-3.5 w-3.5 text-gray-400" />
              <span className="truncate max-w-[150px]">{getLocation()}</span>
            </div>

            {/* Phone with proper icon and fallback handling */}
            {stakeholder.phoneNumber && (
              <div className="flex items-center">
                <FaPhone className="mr-1 h-3 w-3 text-gray-400" />
                <span className="truncate max-w-[80px]">
                  {stakeholder.phoneNumber}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default function Sidebar({ mapInstanceRef, setUserDetails, highlightStakeholderRef }) {
  const navigate = useNavigate();
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSearchContainer, setShowSearchContainer] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showRecents, setShowRecents] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [notificationActiveIndex, setNotificationActiveIndex] = useState("All");
  const [filters, setFilters] = useState({
    startups: {
      query: "",
      industry: "",
      customIndustry: "",
      foundedDate: "",
      teamSize: "",
      fundingStage: "",
    },
    stakeholders: {
      query: "",
      region: "",
      sector: "",
      organization: "",
      location: "",
    },
  });
  const [startups, setStartups] = useState([]);
  const [notificationsCount, setNotificationsCount] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startup, setStartup] = useState(null);
  const [stakeholders, setStakeholders] = useState([]);
  const [newNotifications, setNewNotifications] = useState([]);
  const [stakeholder, setStakeholder] = useState(null); // For viewing a stakeholder
  const [viewingType, setViewingType] = useState("startups"); // Toggle between startups and stakeholders
  const [viewingStartup, setViewingStartup] = useState(null); // New state for viewing mode
  const [viewingStakeholder, setViewingStakeholder] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
  const [containerMode, setContainerMode] = useState(null); // "search" or "recents"
  const [bookmarkedStartups, setBookmarkedStartups] = useState([]); // For bookmarked startups
  const [bookmarkedStakeholders, setBookmarkedStakeholders] = useState([]);
  const [likedStakeholders, setLikedStakeholders] = useState([]);
  const [likedStartups, setLikedStartups] = useState([]); // For liked startups
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false); // New state for image loading
  const [isCurrentItemBookmarked, setIsCurrentItemBookmarked] = useState(false);
  const [notificationTooltip, setNotificationTooltip] = useState(false);
  const notificationTabs = ["All", "New"];
  const [loadingNotification, setLoadingNotification] = useState(false);
  const [adminSubmissions, setAdminSubmissions] = useState([]);
  const [adminSubmissionsCount, setAdminSubmissionsCount] = useState(0);
  const [notificationAdminTab, setNotificationAdminTab] = useState(false);
  const [searchInputLoading, setSearchInputLoading] = useState(false);

  const markAsViewed = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/notifications/${id}/view`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("marked as viewed: ", data.data);
      } else {
        console.log(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // First, update the fetchAdminSubmissions function to properly check for ROLE_ADMIN
  const fetchAdminSubmissions = async () => {
    if (!currentUser || currentUser.role !== "ROLE_ADMIN") return;

    try {
      setLoadingNotification(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/submitted`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAdminSubmissions(data);
        setAdminSubmissionsCount(data.length);
      } else {
        console.error("Failed to fetch admin submissions");
      }
    } catch (error) {
      console.error("Error fetching admin submissions:", error);
    } finally {
      setLoadingNotification(false);
    }
  };

  // Update the useEffect to check for ROLE_ADMIN
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchNotificationsCount();

      // Only fetch admin submissions if the user is an admin
      if (currentUser && currentUser.role === "ROLE_ADMIN") {
        fetchAdminSubmissions();
      }
    }
  }, [isAuthenticated, currentUser?.role]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNewNotifications();
      fetchNotificationsCount();
      fetchNotifications();

      // Add admin submissions fetch if user is admin
      if (currentUser && currentUser.role === "ADMIN") {
        fetchAdminSubmissions();
      }
    }
  }, [isAuthenticated, currentUser?.role]);

  const fetchNewNotifications = async () => {
    setLoadingNotification(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/notifications/my/new`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log(data.data);
        setNewNotifications(data.data);
      } else {
        console.log(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingNotification(false);
    }
  };

  const fetchNotificationsCount = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/notifications/new/count`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotificationsCount(data.data);
        console.log(data.data);
      } else {
        console.log("Failed fetching notifications count");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {}, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/notifications/my`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("Notifications: ", data);
        setNotifications(data.data);
      } else {
        console.log(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/users/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Current user:", data);
          setCurrentUser(data);
          setUserDetails(data); // Update parent state
          localStorage.setItem("user", JSON.stringify(data)); // Persist user details
          setIsAuthenticated(true);
        } else {
          console.error("Failed to fetch current user");
          setCurrentUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser)); // Restore user details
        setIsAuthenticated(true); // Set authentication state
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const addToRecents = (item, type) => {
    const key = type === "startups" ? "recentStartups" : "recentStakeholders";
    const existingRecents = JSON.parse(localStorage.getItem(key)) || [];
    const updatedRecents = [
      item,
      ...existingRecents.filter((i) => i.id !== item.id),
    ].slice(0, 10); // Limit to 10 items
    localStorage.setItem(key, JSON.stringify(updatedRecents));
  };

  const getRecents = (type) => {
    const key = type === "startups" ? "recentStartups" : "recentStakeholders";
    return JSON.parse(localStorage.getItem(key)) || [];
  };

  const [recentStartups, setRecentStartups] = useState([]);
  const [recentStakeholders, setRecentStakeholders] = useState([]);

  const logout = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        console.log("Logout successful");
        setIsAuthenticated(false);
        setUser(null);
        setCurrentUser(null);
        setLikedStartups([]);
        setLikedStakeholders([]);

        localStorage.removeItem("likedStartups");
        localStorage.removeItem("likedStakeholders");
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
        document.cookie =
          "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setUserDetails(null);
        navigate("/");
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const checkAuthentication = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/check`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok && data) {
        console.log("User is authenticated: ", data);
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true"); // Persist state
      } else {
        console.log("User is not authenticated");
        setIsAuthenticated(false);
        localStorage.removeItem("isAuthenticated"); // Clear state
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
      localStorage.removeItem("isAuthenticated"); // Clear state
    }
  };

  const fetchStartups = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/approved`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error("Network response was not ok: ", data);
      }

      console.log("Fetched startups:", data); // Debug log
      setStartups(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch startups");
    } finally {
      setLoading(false);
    }
  };

  const fetchStakeholders = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/stakeholders`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      console.log("Fetched stakeholders:", data);

      // Set the stakeholders data
      setStakeholders(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const currentQuery = viewingType === "startups" 
      ? filters.startups.query 
      : filters.stakeholders.query;
      
    if (!currentQuery.trim()) return; // Do nothing if the search query is empty

    setSearchInputLoading(true); // Show the loading animation in input
    setLoading(true);
    try {
      const endpoint =
        viewingType === "startups"
          ? `${import.meta.env.VITE_BACKEND_URL}/startups/search`
          : `${import.meta.env.VITE_BACKEND_URL}/stakeholders/search`;

      const response = await fetch(`${endpoint}?query=${encodeURIComponent(currentQuery)}`, {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error("Network response was not ok: ", data);
      }

      if (viewingType === "startups") {
        setStartups(data);
      } else {
        setStakeholders(data);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search. Please try again.");
    } finally {
      setLoading(false);
      setSearchInputLoading(false); // Hide the loading animation
    }
  };

  // Fetch the bookmarked items from localStorage
  useEffect(() => {
    const storedBookmarkedStartups =
      JSON.parse(localStorage.getItem("bookmarkedStartups")) || [];
    const storedBookmarkedStakeholders =
      JSON.parse(localStorage.getItem("bookmarkedStakeholders")) || [];
    setBookmarkedStartups(storedBookmarkedStartups);
    setBookmarkedStakeholders(storedBookmarkedStakeholders);
  }, []);

  useEffect(() => {
    const storedAuthState = localStorage.getItem("isAuthenticated");
    if (storedAuthState === "true") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setLikedStartups([]); // Clear likes
      setLikedStakeholders([]); // Clear likes
    }
    checkAuthentication();
  }, []);

  const toggleTooltip = () => {
    setShowTooltip((prev) => !prev);
  };

  const addView = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/views`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: id }),
          credentials: "include",
        }
      );

      if (response.ok) {
        console.log("View added successfully");
      } else if (response.status === 400) {
        // Handle 400 Bad Request
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          console.log("Bad Request (JSON): ", errorData.message);
        } else {
          const errorText = await response.text();
          console.log("Bad Request (Text): ", errorText);
        }
      } else {
        const errorData = await response.json().catch(() => null); // Handle non-JSON responses
        console.log("Error adding view: ", errorData || response.statusText);
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const handleStartupClick = (startup) => {
    setStakeholder(null);
    setViewingStartup(null);
    setViewingStakeholder(null);
    setContainerMode(null);
    addView(startup.id);

    setLoadingImage(true); // Start loading animation

    // Fetch the startup image
    fetch(`${import.meta.env.VITE_BACKEND_URL}/startups/${startup.id}/photo`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          return response.blob(); // Convert the response to a Blob
        } else {
          console.error("Failed to fetch startup image");
          return null;
        }
      })
      .then((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob); // Create a URL for the image
          setStartup((prevStartup) => ({
            ...prevStartup,
            imageUrl, // Add the image URL to the startup object
          }));
        } else {
          setStartup((prevStartup) => ({
            ...prevStartup,
            imageUrl: null, // Set to null if no image is available
          }));
        }
      })
      .catch((error) => {
        console.error("Error fetching startup image:", error);
        setStartup((prevStartup) => ({
          ...prevStartup,
          imageUrl: null, // Set to null if an error occurs
        }));
      })
      .finally(() => {
        setLoadingImage(false); // Stop loading animation
      });

    // Increment views and other logic
    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/startups/${
        startup.id
      }/increment-views`,
      {
        method: "PUT",
        credentials: "include",
      }
    )
      .then((response) => {
        if (response.ok) {
          console.log("Views incremented successfully");
        } else {
          console.error("Failed to increment views");
        }
      })
      .catch((error) => {
        console.error("Error incrementing views:", error);
      });

    // Zoom into the startup's location on the map if valid location data exists
    if (startup.locationLng && startup.locationLat) {
      mapInstanceRef.current.flyTo({
        center: [
          parseFloat(startup.locationLng),
          parseFloat(startup.locationLat),
        ],
        zoom: 18,
        essential: true,
      });
    }

    // Add the startup to recents and update the UI
    addToRecents(startup, "startups");
    setStartup(startup);
    setShowSearchContainer(false);
  };

  const handleStakeholderClick = (stakeholder) => {
    if (!stakeholder || !stakeholder.id) {
      console.error("Invalid stakeholder object:", stakeholder);
      return;
    }

    // Close other sidebars
    setStartup(null);
    setViewingStartup(null);
    setViewingStakeholder(null);
    setContainerMode(null);

    // Increment views on the backend by sending a PUT request
    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/stakeholders/${
        stakeholder.id
      }/increment-views`,
      {
        method: "PUT",
        credentials: "include",
      }
    )
      .then((response) => {
        if (response.ok) {
          console.log("Views incremented successfully");
        } else {
          console.error("Failed to increment views");
        }
      })
      .catch((error) => {
        console.error("Error incrementing views:", error);
      });

    // Check for location data and handle map centering
    const hasLocationData = stakeholder.locationLat && stakeholder.locationLng;
    
    // Zoom into the stakeholder's location on the map if valid location data exists
    if (hasLocationData) {
      // First highlight the stakeholder before moving the map
      // This ensures the marker is created before any animation starts
      if (highlightStakeholderRef && highlightStakeholderRef.current) {
        console.log("Highlighting stakeholder before map movement:", stakeholder.id);
        highlightStakeholderRef.current(stakeholder.id);
      }
      
      // Then fly to the stakeholder's location
      mapInstanceRef.current.flyTo({
        center: [
          parseFloat(stakeholder.locationLng),
          parseFloat(stakeholder.locationLat),
        ],
        zoom: 14,
        essential: true,
      });
      
      // After map movement completes, highlight again to ensure visibility
      mapInstanceRef.current.once('moveend', () => {
        if (highlightStakeholderRef && highlightStakeholderRef.current) {
          console.log("Re-highlighting stakeholder after map movement:", stakeholder.id);
          highlightStakeholderRef.current(stakeholder.id);
        }
      });
      
      toast.success(`Centered map on ${stakeholder.name}'s location`);
    } else {
      // Notify the user that location data is missing
      toast.info(`${stakeholder.name} doesn't have location data on the map`, {
        position: "bottom-right",
      });
    }

    // Add the stakeholder to recents and update the UI
    addToRecents(stakeholder, "stakeholders");
    setStakeholder(stakeholder);
    setShowSearchContainer(false);
  };

  useEffect(() => {
    if (containerMode === "recents") {
      setRecentStartups(getRecents("startups"));
      setRecentStakeholders(getRecents("stakeholders"));
    }
  }, [containerMode]);

  useEffect(() => {
    const fetchLikesOnLoad = async () => {
      console.log("useEffect triggered for fetchUserLikes"); // Debugging log
      if (user && user.id) {
        await fetchUserLikes();
      } else {
        console.log("User is not authenticated or does not have an ID");
      }
    };

    fetchLikesOnLoad();
  }, [user?.id]);

  const fetchUserLikes = async () => {
    if (!user || !user.id) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/likes`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const likesData = await response.json();

        const userLikedStartups = likesData
          .filter((like) => like.startupId !== null && like.userId === user.id)
          .map((like) => like.startupId);

        const userLikedStakeholders = likesData
          .filter((like) => like.investorId !== null && like.userId === user.id)
          .map((like) => like.investorId);

        console.log("Updated liked startups:", userLikedStartups);
        console.log("Updated liked investors:", userLikedStakeholders);

        setLikedStartups(userLikedStartups);
        setLikedStakeholders(userLikedStakeholders);
      } else {
        console.error("Failed to fetch likes for the user");
      }
    } catch (error) {
      console.error("Error fetching user likes:", error);
    }
  };

  const toggleLike = async (userId, startupId, investorId) => {
    const payload = { userId, startupId, investorId };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/likes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const result = await response.json();

        if (result.message === "Like removed") {
          if (startupId) {
            setLikedStartups((prev) => prev.filter((id) => id !== startupId));
            setStartupLikeCounts((prev) => ({
              ...prev,
              [startupId]: Math.max((prev[startupId] || 1) - 1, 0),
            }));
          } else if (investorId) {
            setLikedStakeholders((prev) =>
              prev.filter((id) => id !== investorId)
            );
            setStakeholderLikeCounts((prev) => ({
              ...prev,
              [investorId]: Math.max((prev[investorId] || 1) - 1, 0),
            }));
          }
        } else {
          if (startupId) {
            setLikedStartups((prev) => [...prev, startupId]);
            setStartupLikeCounts((prev) => ({
              ...prev,
              [startupId]: (prev[startupId] || 0) + 1,
            }));
          } else if (investorId) {
            setLikedStakeholders((prev) => [...prev, investorId]);
            setStakeholderLikeCounts((prev) => ({
              ...prev,
              [investorId]: (prev[investorId] || 0) + 1,
            }));
          }
        }
      } else {
        console.error("Error toggling like");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const checkIfBookmarked = async () => {
    if (!user || (!startup && !stakeholder)) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/bookmarks`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const bookmarks = await response.json();
        const isBookmarked = bookmarks.some(
          (bookmark) =>
            (startup && bookmark.startup?.id === startup.id) ||
            (stakeholder && bookmark.investor?.id === stakeholder.id)
        );
        setIsCurrentItemBookmarked(isBookmarked);
      }
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };

  useEffect(() => {
    checkIfBookmarked();
  }, [startup, stakeholder]);

  const toggleBookmark = async () => {
    if (!user) {
      toast.error("Please log in to bookmark.");
      return;
    }

    const payload = {
      startupId: startup ? startup.id : null,
      investorId: stakeholder ? stakeholder.id : null,
    };

    try {
      if (isCurrentItemBookmarked) {
        // If already bookmarked, remove it
        const checkResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/bookmarks`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (checkResponse.ok) {
          const bookmarks = await checkResponse.json();
          const existingBookmark = bookmarks.find(
            (bookmark) =>
              (startup && bookmark.startup?.id === startup.id) ||
              (stakeholder && bookmark.investor?.id === stakeholder.id)
          );

          if (existingBookmark) {
            const deleteResponse = await fetch(
              `${import.meta.env.VITE_BACKEND_URL}/api/bookmarks/${
                existingBookmark.id
              }`,
              {
                method: "DELETE",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (deleteResponse.ok) {
              if (startup) {
                setBookmarkedStartups((prev) =>
                  prev.filter((id) => id !== startup.id)
                );
              } else if (stakeholder) {
                setBookmarkedStakeholders((prev) =>
                  prev.filter((id) => id !== stakeholder.id)
                );
              }
              setIsCurrentItemBookmarked(false);
              toast.success("Bookmark removed successfully!");
            } else {
              toast.error("Failed to remove bookmark");
            }
          }
        }
      } else {
        // If not bookmarked, add it
        const addResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/bookmarks`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );

        if (addResponse.ok) {
          const result = await addResponse.json();
          if (startup) {
            setBookmarkedStartups((prev) => [...prev, startup.id]);
          } else if (stakeholder) {
            setBookmarkedStakeholders((prev) => [...prev, stakeholder.id]);
          }
          setIsCurrentItemBookmarked(true);
          toast.success("Bookmark added successfully!");
        } else {
          toast.error("Failed to add bookmark");
        }
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error("An error occurred while toggling bookmark.");
    }
  };

  const [startupLikeCounts, setStartupLikeCounts] = useState({});
  const [stakeholderLikeCounts, setStakeholderLikeCounts] = useState({});

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/likes`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((likes) => {
        const startupCounts = {};
        const investorCounts = {};

        likes.forEach((like) => {
          if (like.startupId !== null) {
            startupCounts[like.startupId] =
              (startupCounts[like.startupId] || 0) + 1;
          }
          if (like.investorId !== null) {
            investorCounts[like.investorId] =
              (investorCounts[like.investorId] || 0) + 1;
          }
        });

        setStartupLikeCounts(startupCounts);
        setStakeholderLikeCounts(investorCounts);
      })
      .catch((err) => console.error("Failed to fetch likes:", err));
  }, []);

  // Add useEffect to fetch startups when component mounts
  useEffect(() => {
    fetchStartups();
  }, []);

  const applyFilters = (items) => {
    if (!items || items.length === 0) return items;

    const currentFilters =
      viewingType === "startups" ? filters.startups : filters.stakeholders;

    return items.filter((item) => {
      try {
        if (viewingType === "startups") {
          const textMatch =
            !currentFilters.query ||
            (item.companyName &&
              item.companyName
                .toLowerCase()
                .includes(currentFilters.query.toLowerCase())) ||
            (item.locationName &&
              item.locationName
                .toLowerCase()
                .includes(currentFilters.query.toLowerCase()));
          // Industry filter (with custom industry)
          const selectedIndustry =
            currentFilters.industry === "other"
              ? (currentFilters.customIndustry || "").toLowerCase()
              : currentFilters.industry;

          const industryMatch =
            !selectedIndustry ||
            (item.industry &&
              item.industry.localeCompare(selectedIndustry, undefined, {
                sensitivity: "base",
              }) === 0);

          // Founded date filter
          const foundedDateMatch =
            !currentFilters.foundedDate ||
            (item.foundedDate &&
              item.foundedDate
                .toString()
                .localeCompare(currentFilters.foundedDate, undefined, {
                  sensitivity: "base",
                }) !== -1);

          // Team size filter
          const teamSizeMatch =
            !currentFilters.teamSize ||
            (() => {
              const employeeCount = parseInt(item.numberOfEmployees);
              if (isNaN(employeeCount)) return false;

              switch (currentFilters.teamSize) {
                case "1-10":
                  return employeeCount >= 1 && employeeCount <= 10;
                case "11-50":
                  return employeeCount >= 11 && employeeCount <= 50;
                case "51-200":
                  return employeeCount >= 51 && employeeCount <= 200;
                case "201+":
                  return employeeCount >= 201;
                default:
                  return true;
              }
            })();

          // Funding stage filter
          const fundingStageMatch =
            !currentFilters.fundingStage ||
            (item.fundingStage &&
              item.fundingStage.localeCompare(
                currentFilters.fundingStage,
                undefined,
                { sensitivity: "base" }
              ) === 0);

          return (
            textMatch &&
            industryMatch &&
            foundedDateMatch &&
            teamSizeMatch &&
            fundingStageMatch
          );
        } else {
          // Stakeholder filters
          const textMatch =
            !currentFilters.query ||
            (item.name &&
              item.name
                .toLowerCase()
                .includes(currentFilters.query.toLowerCase())) ||
            (item.email &&
              item.email
                .toLowerCase()
                .includes(currentFilters.query.toLowerCase())) ||
            (item.region &&
              item.region
                .toLowerCase()
                .includes(currentFilters.query.toLowerCase()));

          const regionMatch =
            !currentFilters.region ||
            (item.region &&
              item.region.localeCompare(currentFilters.region, undefined, {
                sensitivity: "base",
              }) === 0);

          const sectorMatch =
            !currentFilters.sector ||
            (item.sector &&
              item.sector.localeCompare(currentFilters.sector, undefined, {
                sensitivity: "base",
              }) === 0);

          const organizationMatch =
            !currentFilters.organization ||
            (item.organization &&
              item.organization.localeCompare(
                currentFilters.organization,
                undefined,
                { sensitivity: "base" }
              ) === 0);

          const locationMatch =
            !currentFilters.location ||
            ((item.city || item.province || item.region) &&
              `${item.city || ""} ${item.province || ""} ${item.region || ""}`
                .toLowerCase()
                .includes(currentFilters.location.toLowerCase()));

          return (
            textMatch &&
            regionMatch &&
            sectorMatch &&
            organizationMatch &&
            locationMatch
          );
        }
      } catch (error) {
        console.error("Error applying filters:", error);
        return true; // Return true to show the item if there's an error in filtering
      }
    });
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-gray-50">
      <ToastContainer
        position="bottom-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* Viewing Mode Indicators */}
      {viewingStartup && (
        <div className="absolute w-fit top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg px-4 py-2 z-50 flex items-center space-x-2 border border-gray-100">
          <button
            className="text-blue-600 hover:text-blue-700 transition-colors flex items-center cursor-pointer"
            onClick={() => {
              setViewingStartup(null);
              setStartup(viewingStartup);
            }}
          >
            <MdKeyboardReturn className="mr-1 cursor-pointer text-xl" />
          </button>
          <span className="text-gray-700 text-sm flex items-center">
            Viewing{" "}
            <p className="font-semibold ml-2 text-gray-900">
              {viewingStartup.companyName}
            </p>
          </span>
        </div>
      )}

      {viewingStakeholder && (
        <div className="absolute w-fit top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg px-4 py-2 z-50 flex items-center space-x-2 border border-gray-100">
          <button
            className="text-blue-600 hover:text-blue-700 transition-colors flex items-center cursor-pointer"
            onClick={() => {
              setViewingStakeholder(null);
              setStakeholder(viewingStakeholder);
            }}
          >
            <MdKeyboardReturn className="mr-1 cursor-pointer text-xl" />
          </button>
          <span className="text-gray-700 text-sm flex items-center">
            Viewing{" "}
            <p className="font-semibold ml-2 text-gray-900">
              {viewingStakeholder.firstname} {viewingStakeholder.lastname}
            </p>
          </span>
        </div>
      )}

      {/* Sidebar */}
      <div className="flex h-screen w-20 flex-col justify-between border-r border-gray-200 bg-white shadow-sm z-2 sidebar-container">
        <div>
          {/* Logo */}
          <div className="flex justify-center items-center py-6 border-b border-gray-200">
            <button
              onClick={() => (window.location.href = "https://localhost:5173/")}
              className="group relative flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                src="/src/assets/StartUpSphere_logo.png"
                alt="StartUpSphere Logo"
                className="h-6 w-6 object-contain"
              />
              <span className="absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
                Home
              </span>
            </button>
          </div>
          <div className="border-b border-gray-200">
            <div className="px-2">
              <ul className="space-y-1 pt-4">
                {/* Browse Icon (replaces Filter) */}
                <li className="flex justify-center">
                  <button
                    className="group relative flex flex-col items-center justify-center rounded-lg p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      if (location.pathname !== "/") {
                        navigate("/");
                      }
                      fetchStartups();
                      fetchStakeholders();
                      fetchUserLikes();
                      setContainerMode("search");
                      setShowSearchContainer((prev) => !prev);
                      setViewingStartup(null);
                      setViewingStakeholder(null);
                    }}
                  >
                    <FaGlobe 
                      className="h-6 w-6 opacity-80 group-hover:opacity-100"
                    />
                    <span className="absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
                      Browse
                    </span>
                  </button>
                </li>

                {/* Recents and Bookmarks Icons (Only if Authenticated) */}
                {isAuthenticated && (
                  <>
                    {/* Recents Icon */}
                    <li className="flex justify-center">
                      <button
                        className="group relative flex flex-col items-center justify-center rounded-lg p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 cursor-pointer"
                        onClick={() => {
                          if (location.pathname !== "/") {
                            navigate("/");
                          }
                          setContainerMode("recents");
                          setShowRecents(!showRecents);
                          setShowSearchContainer(false);
                          setStartup(null);
                          setStakeholder(null);
                          setViewingStartup(null);
                          setViewingStakeholder(null);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 opacity-80 group-hover:opacity-100"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
                          Recents
                        </span>
                      </button>
                    </li>

                    {/* Bookmarks Icon */}
                    <li className="flex justify-center">
                      <button
                        className="group relative flex flex-col items-center justify-center rounded-lg p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 cursor-pointer"
                        onClick={() => {
                          if (location.pathname !== "/") {
                            navigate("/");
                          }
                          setContainerMode("bookmarks");
                          setShowBookmarks(!showBookmarks);
                          setShowSearchContainer(false);
                          setStartup(null);
                          setStakeholder(null);
                          setViewingStartup(null);
                          setViewingStakeholder(null);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 opacity-80 group-hover:opacity-100"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 3v18l7-5 7 5V3H5z"
                          />
                        </svg>
                        <span className="absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
                          Bookmarks
                        </span>
                      </button>
                    </li>

                    <li className="flex justify-center">
                      <button
                        onClick={() => {
                          setShowRecents(false);
                          setShowSearchContainer(false);
                          setShowBookmarks(false);
                          navigate("/startup-dashboard");
                        }}
                        className="group relative flex flex-col items-center justify-center rounded-lg p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 cursor-pointer"
                      >
                        <LuLayoutDashboard className="h-6 w-6 opacity-80 group-hover:opacity-100" />
                        <span className="absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
                          Dashboard
                        </span>
                      </button>
                    </li>

                    {/* All Startups Icon */}
                    <li className="flex justify-center">
                      <button
                        onClick={() => {
                          setShowRecents(false);
                          setShowSearchContainer(false);
                          setShowBookmarks(false);
                          navigate("/all-startup-dashboard");
                        }}
                        className="group relative flex flex-col items-center justify-center rounded-lg p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 cursor-pointer"
                      >
                        <Award className="h-6 w-6 opacity-80 group-hover:opacity-100" />
                        <span className="absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
                          All Startups
                        </span>
                      </button>
                    </li>

                    {/* Notifications Bell - Only show for non-admin users */}
                    {currentUser?.role !== "ROLE_ADMIN" && (
                      <li className="flex justify-center">
                        <button
                          className="group relative flex flex-col items-center justify-center rounded-lg p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 cursor-pointer"
                          onClick={() => navigate("/notifications")}
                        >
                          <div className="relative">
                            <FaBell className="h-6 w-6 opacity-80 group-hover:opacity-100" />
                            {notificationsCount > 0 && (
                              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-medium">
                                {notificationsCount}
                              </div>
                            )}
                          </div>
                          <span className="absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
                            Notifications
                          </span>
                        </button>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        {isAuthenticated ? (
          <div className="sticky inset-x-0 bottom-0 border-t border-gray-200 bg-white p-2">
            <div className="flex justify-center">
              <button
                className="group relative flex flex-col items-center justify-center rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer"
                onClick={logout}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 opacity-80 group-hover:opacity-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
                  Logout
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="sticky inset-x-0 bottom-0 border-t border-gray-200 bg-white p-2">
            <div className="flex justify-center">
              <button
                className="group relative flex flex-col items-center justify-center rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 cursor-pointer"
                onClick={() => setOpenLogin(true)}
              >
                <RiLoginBoxFill className="h-6 w-6 opacity-80 group-hover:opacity-100" />
                <span className="absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
                  Login
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {location.pathname === "/" && (
        <div className="absolute top-4 right-4 z-50">
          <div className="relative">
            <div
              className="avatar avatar-placeholder cursor-pointer rounded-full hover:ring-2 hover:ring-blue-900 transition-all duration-200"
              onClick={() => {
                setShowTooltip((prev) => !prev);
                setNotificationTooltip(false);
                setNotificationActiveIndex("All");
                fetchNotificationsCount();
              }}
            >
              <div className="bg-gradient-to-br from-blue-400 to-blue-700 text-white w-12 rounded-full flex items-center justify-center shadow-md">
                <span className="text-lg font-semibold">
                  {isAuthenticated === null
                    ? "?"
                    : isAuthenticated && currentUser
                    ? `${currentUser.firstname?.[0] ?? ""}${
                        currentUser.lastname?.[0] ?? ""
                      }`.toUpperCase()
                    : "G"}
                </span>
              </div>
            </div>

            {notificationTooltip && (
              <div className="absolute top-14 right-0 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                {/* Header - Different for admin vs regular users */}
                <div
                  className={`px-4 py-3 border-b border-gray-100 ${
                    currentUser?.role === "ROLE_ADMIN"
                      ? "bg-gradient-to-r from-amber-50 to-white"
                      : "bg-gradient-to-r from-blue-50 to-white"
                  } flex justify-between items-center`}
                >
                  <h3 className="text-sm font-semibold text-gray-900">
                    {currentUser?.role === "ROLE_ADMIN"
                      ? "Admin Dashboard"
                      : "Notifications"}
                  </h3>
                  <button
                    onClick={() =>
                      currentUser?.role === "ROLE_ADMIN"
                        ? navigate("/all-startup-dashboard", {
                            state: { activeTab: "review" },
                          })
                        : navigate("/notifications")
                    }
                    className={`text-xs ${
                      currentUser?.role === "ROLE_ADMIN"
                        ? "text-amber-600 hover:text-amber-800"
                        : "text-blue-600 hover:text-blue-800"
                    } hover:underline`}
                  >
                    {currentUser?.role === "ROLE_ADMIN"
                      ? "View all submissions"
                      : "View all notifications"}
                  </button>
                </div>

                {/* Content - Show different tabs based on role */}
                {currentUser?.role === "ROLE_ADMIN" ? (
                  /* Admin-only content */
                  <div className="max-h-[400px] overflow-y-auto">
                    {loadingNotification ? (
                      <div className="flex justify-center p-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600"></div>
                      </div>
                    ) : adminSubmissions && adminSubmissions.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {adminSubmissions.map((startup) => (
                          <div
                            key={startup.id}
                            className="p-4 flex items-start hover:bg-amber-50 transition-colors cursor-pointer"
                            onClick={() =>
                              navigate("/all-startup-dashboard", {
                                state: {
                                  activeTab: "review",
                                  reviewStartupId: startup.id,
                                  startupName: startup.companyName,
                                },
                              })
                            }
                          >
                            {/* Startup avatar */}
                            <div className="flex-shrink-0 mr-3">
                              <div className="relative">
                                {startup.photo ? (
                                  <img
                                    src={`${
                                      import.meta.env.VITE_BACKEND_URL
                                    }/startups/${startup.id}/photo`}
                                    alt={startup.companyName}
                                    className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = `https://ui-avatars.com/api/?name=${startup.companyName}&background=amber&color=fff`;
                                    }}
                                  />
                                ) : (
                                  <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 font-medium">
                                    {startup.companyName
                                      ?.charAt(0)
                                      ?.toUpperCase() || "?"}
                                  </div>
                                )}
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 rounded-full border-2 border-white"></span>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  {startup.companyName}
                                </p>
                                <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800">
                                  Review
                                </span>
                              </div>

                              <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                                {startup.companyDescription ||
                                  "New startup submission awaiting review"}
                              </p>

                              <div className="mt-2 flex items-center text-xs text-gray-500">
                                <div className="flex items-center">
                                  <svg
                                    className="mr-1 h-3 w-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  <span>
                                    {startup.locationName || "Unknown location"}
                                  </span>
                                </div>
                                <span className="mx-2">•</span>
                                <span className="flex items-center">
                                  <svg
                                    className="mr-1 h-3 w-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 012 2z"
                                    />
                                  </svg>
                                  {new Date(
                                    startup.createdAt
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 text-center">
                        <div className="mx-auto h-14 w-14 text-amber-400 mb-4 flex items-center justify-center rounded-full bg-amber-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-7 w-7"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <h3 className="text-sm font-medium text-gray-900">
                          No pending submissions
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          All startup submissions have been reviewed
                        </p>
                      </div>
                    )}

                    {/* Admin footer */}
                    <div className="border-t border-gray-100 p-3 bg-amber-50">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {adminSubmissionsCount > 0
                            ? `${adminSubmissionsCount} submission${
                                adminSubmissionsCount !== 1 ? "s" : ""
                              } awaiting review`
                            : "No pending submissions"}
                        </span>
                        <button
                          onClick={() =>
                            navigate("/all-startup-dashboard", {
                              state: { activeTab: "review" },
                            })
                          }
                          className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 rounded hover:bg-amber-700 transition-colors"
                        >
                          Review All
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Regular user content - Existing notification tabs and content */
                  <>
                    {/* Notification Tabs */}
                    <div className="flex border-b border-gray-100">
                      {notificationTabs.map((tab, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setNotificationActiveIndex(tab);
                            setNotificationAdminTab(false);
                            if (tab === "New") {
                              fetchNewNotifications();
                            }
                          }}
                          className={`flex-1 py-2 text-sm font-medium text-center ${
                            notificationActiveIndex === tab &&
                            !notificationAdminTab
                              ? "text-blue-600 border-b-2 border-blue-600"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {tab}
                          {tab === "New" && notificationsCount > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-600">
                              {notificationsCount}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Regular notification content - existing code */}
                    <div className="max-h-[400px] overflow-y-auto">
                      {/* Loading state */}
                      {loadingNotification && (
                        <div className="flex justify-center p-4">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        </div>
                      )}

                      {/* All Notifications Tab */}
                      {!loadingNotification &&
                        notificationActiveIndex === "All" && (
                          <>
                            {Array.isArray(notifications) &&
                            notifications.length > 0 ? (
                              <div className="divide-y divide-gray-100">
                                {/* Existing notification mapping code */}
                                {notifications.map((noti, index) => (
                                  // Existing notification items code...
                                  <div
                                    onClick={() => {
                                      fetchNotificationsCount();
                                      if (!noti.viewed) markAsViewed(noti.id);
                                    }}
                                    key={index}
                                    className={`p-3 flex items-start hover:bg-gray-50 transition-colors cursor-pointer ${
                                      !noti.viewed ? "bg-blue-50" : ""
                                    }`}
                                  >
                                    {/* Avatar/Icon */}
                                    <div className="flex-shrink-0 mr-3">
                                      {noti.startup?.photo ? (
                                        <div className="relative">
                                          <img
                                            src={`${
                                              import.meta.env.VITE_BACKEND_URL
                                            }/startups/${
                                              noti.startup.id
                                            }/photo`}
                                            alt={noti.startup.companyName}
                                            className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src = `https://ui-avatars.com/api/?name=${noti.startup.companyName}&background=random`;
                                            }}
                                          />
                                          {!noti.viewed && (
                                            <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-600 rounded-full border-2 border-white"></span>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="relative">
                                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                            <span className="text-sm font-medium">
                                              {noti.startup?.companyName
                                                ?.charAt(0)
                                                ?.toUpperCase() || "?"}
                                            </span>
                                          </div>
                                          {!noti.viewed && (
                                            <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-600 rounded-full border-2 border-white"></span>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-gray-900 font-medium mb-0.5">
                                        {noti.startup?.companyName || "Unknown"}
                                      </p>
                                      <p className="text-xs text-gray-600 line-clamp-2">
                                        {noti.remarks}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(
                                          noti.createdAt
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="py-8 text-center">
                                <div className="mx-auto h-12 w-12 text-gray-400 mb-3 flex items-center justify-center rounded-full bg-gray-100">
                                  <FaBell className="h-6 w-6" />
                                </div>
                                <p className="text-sm text-gray-500">
                                  No notifications
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  We'll notify you when something arrives
                                </p>
                              </div>
                            )}
                          </>
                        )}

                      {/* New Notifications Tab - existing code */}
                      {!loadingNotification &&
                        notificationActiveIndex === "New" && (
                          <>
                            {/* Existing new notifications code */}
                            {newNotifications.length > 0 ? (
                              <div className="divide-y divide-gray-100">
                                {newNotifications.map((noti, index) => (
                                  <div
                                    key={index}
                                    className="p-3 flex items-start hover:bg-gray-50 transition-colors cursor-pointer bg-blue-50"
                                    onClick={() => {
                                      markAsViewed(noti.id);
                                      fetchNotificationsCount();
                                    }}
                                  >
                                    {/* Avatar/Icon */}
                                    <div className="flex-shrink-0 mr-3">
                                      {noti.startup?.photo ? (
                                        <div className="relative">
                                          <img
                                            src={`${
                                              import.meta.env.VITE_BACKEND_URL
                                            }/startups/${
                                              noti.startup.id
                                            }/photo`}
                                            alt={noti.startup.companyName}
                                            className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src = `https://ui-avatars.com/api/?name=${noti.startup.companyName}&background=random`;
                                            }}
                                          />
                                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-600 rounded-full border-2 border-white"></span>
                                        </div>
                                      ) : (
                                        <div className="relative">
                                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                            <span className="text-sm font-medium">
                                              {noti.startup?.companyName
                                                ?.charAt(0)
                                                ?.toUpperCase() || "?"}
                                            </span>
                                          </div>
                                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-600 rounded-full border-2 border-white"></span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-gray-900 font-medium mb-0.5">
                                        {noti.startup?.companyName || "Unknown"}
                                      </p>
                                      <p className="text-xs text-gray-600 line-clamp-2">
                                        {noti.remarks}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(
                                          noti.createdAt
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="py-8 text-center">
                                <div className="mx-auto h-12 w-12 text-gray-400 mb-3 flex items-center justify-center rounded-full bg-gray-100">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
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
                                <p className="text-sm text-gray-500">
                                  You're all caught up!
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  No new notifications
                                </p>
                              </div>
                            )}
                          </>
                        )}
                    </div>

                    {/* Regular user footer */}
                    <div className="border-t border-gray-100 p-2 text-center">
                      <button
                        onClick={() => navigate("/notifications")}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        See all notifications
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {showTooltip && (
              <div className="absolute top-14 right-0 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {currentUser?.firstname} {currentUser?.lastname}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {currentUser?.email}
                        </div>
                      </div>
                      <div className="relative">
                        <FaBell
                          onClick={() => {
                            setNotificationTooltip((prev) => !prev);
                            setShowTooltip((prev) => !prev);
                          }}
                          className="text-black text-2xl cursor-pointer"
                        />
                        {notificationsCount > 0 && (
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                            {notificationsCount}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setShowTooltip(false);
                      }}
                      className="cursor-pointer block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowTooltip(false);
                        setOpenLogin(true);
                      }}
                      className="cursor-pointer block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setShowTooltip(false);
                        setOpenRegister(true);
                      }}
                      className="cursor-pointer block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showSearchContainer && (
        <div className="absolute left-20 top-0 h-screen w-96 bg-white shadow-lg z-5 transform transition-all duration-300 ease-in-out animate-slide-in">
          {/* Search Header */}
          <div className="p-5 bg-gradient-to-br from-blue-600 to-blue-700 relative">
            <button
              className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors focus:outline-none"
              onClick={() => {
                const container = document.querySelector(".animate-slide-in");
                if (container) {
                  container.classList.add("animate-slide-out");
                  setTimeout(() => setShowSearchContainer(false), 300);
                } else {
                  setShowSearchContainer(false);
                }
              }}
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-lg text-white font-medium mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 opacity-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Browse
            </h2>

            <form
              className="flex items-center mx-auto mb-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                
                <input
                  type="text"
                  value={
                    (viewingType === "startups"
                      ? filters.startups.query
                      : filters.stakeholders.query) || ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchInputLoading(true);
                    setFilters((prev) => ({
                      ...prev,
                      [viewingType]: { ...prev[viewingType], query: value },
                    }));
                    
                    // Simulate a loading effect for a brief moment
                    setTimeout(() => {
                      setSearchInputLoading(false);
                    }, 800); // Show loading for 800ms
                  }}
                  className="bg-white/95 border border-transparent text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent block w-full pl-10 pr-24 py-2.5 shadow-sm"
                  placeholder={
                    viewingType === "startups"
                      ? "Search startups by name or location"
                      : "Search stakeholders by name or location"
                  }
                />
                
                {/* Loading animation that shows when typing */}
                {searchInputLoading && !loading && (
                  <div className="absolute right-24 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
                
                {/* Submit button with loading state */}
                <button
                  type="submit"
                  className="absolute inset-y-0 right-12 flex items-center px-2.5 text-blue-600 hover:text-blue-800 transition-colors"
                  disabled={searchInputLoading || loading}
                  aria-label="Search"
                  title="Search"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  ) : (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-4 h-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                      />
                    </svg>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`absolute inset-y-0 right-0 flex items-center px-2.5 rounded-r-lg ${
                    showFilters
                      ? "bg-blue-800 text-white"
                      : "text-gray-600 hover:text-blue-700"
                  } transition-colors`}
                  aria-label="Toggle filters panel"
                  title="Toggle filters"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 transition-transform ${
                      showFilters ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </form>

            {/* Type Selector - redesigned with only Startups and Stakeholders */}
            <div className="flex gap-2 p-1 bg-blue-800/40 rounded-lg">
              <button
                onClick={() => setViewingType("startups")}
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                  viewingType === "startups"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-center">
                  <BsBriefcase
                    className={`mr-2 h-4 w-4 ${
                      viewingType === "startups"
                        ? "text-blue-600"
                        : "text-white/80"
                    }`}
                  />
                  Startups
                </div>
              </button>
              <button
                onClick={() => setViewingType("stakeholders")}
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                  viewingType === "stakeholders"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`mr-2 h-4 w-4 ${
                      viewingType === "stakeholders"
                        ? "text-blue-600"
                        : "text-white/80"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Stakeholders
                </div>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="px-4 py-3 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => {
                    const currentFilters =
                      viewingType === "startups"
                        ? {
                            query: filters.startups.query, // Preserve the search query
                            industry: "",
                            customIndustry: "",
                            foundedDate: "",
                            teamSize: "",
                            fundingStage: "",
                          }
                        : {
                            query: filters.stakeholders.query, // Preserve the search query
                            investmentStage: "",
                            investmentRange: "",
                            preferredIndustry: "",
                            customPreferredIndustry: "",
                            location: "",
                          };

                    setFilters((prev) => ({
                      ...prev,
                      [viewingType]: currentFilters,
                    }));
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Reset filters
                </button>
              </div>

              {viewingType === "startups" ? (
                <div className="space-y-3">
                  {/* Industry filter - enhanced */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Industry
                      </label>
                      <select
                        value={filters.startups.industry}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            startups: {
                              ...prev.startups,
                              industry: e.target.value,
                              customIndustry: "",
                            },
                          }))
                        }
                        className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
                      >
                        <option value="">All Industries</option>
                        <option value="technology">Technology</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="education">Education</option>
                        <option value="retail">Retail</option>
                        <option value="transportation">Transportation</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="other">Other (specify)</option>
                      </select>
                      {filters.startups.industry === "other" && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={filters.startups.customIndustry}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                startups: {
                                  ...prev.startups,
                                  customIndustry: e.target.value.toLowerCase(),
                                },
                              }))
                            }
                            placeholder="Type industry"
                            className="w-full text-sm rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 px-3 py-1.5 text-gray-700"
                          />
                        </div>
                      )}
                    </div>

                    {/* Team Size filter - enhanced */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Team Size
                      </label>
                      <select
                        value={filters.startups.teamSize}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            startups: {
                              ...prev.startups,
                              teamSize: e.target.value,
                            },
                          }))
                        }
                        className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
                      >
                        <option value="">Any Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201+">201+ employees</option>
                      </select>
                    </div>
                  </div>

                  {/* Funding Stage filter - enhanced */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Funding Stage
                    </label>
                    <select
                      value={filters.startups.fundingStage}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          startups: {
                            ...prev.startups,
                            fundingStage: e.target.value,
                          },
                        }))
                      }
                      className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
                    >
                      <option value="">Any Stage</option>
                      <option value="bootstrapped">Bootstrapped</option>
                      <option value="seed">Seed</option>
                      <option value="series_a">Series A</option>
                      <option value="series_b">Series B</option>
                      <option value="series_c">Series C</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {/* Change 'investors' to 'stakeholders' in the filter section */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Investment Stage
                    </label>
                    <select
                      value={filters.stakeholders.investmentStage}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          stakeholders: {
                            ...prev.stakeholders,
                            investmentStage: e.target.value,
                          },
                        }))
                      }
                      className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Any Stage</option>
                      <option value="seed">Seed</option>
                      <option value="series_a">Series A</option>
                      <option value="series_b">Series B</option>
                      <option value="series_c">Series C</option>
                      <option value="growth">Growth</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Industry Focus
                    </label>
                    <select
                      value={filters.stakeholders.preferredIndustry}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          stakeholders: {
                            ...prev.stakeholders,
                            preferredIndustry: e.target.value,
                            customPreferredIndustry: "",
                          },
                        }))
                      }
                      className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">All Industries</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="education">Education</option>
                      <option value="retail">Retail</option>
                      <option value="other">Other (specify)</option>
                    </select>
                    {filters.stakeholders.preferredIndustry === "other" && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={filters.stakeholders.customPreferredIndustry}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              stakeholders: {
                                ...prev.stakeholders,
                                customPreferredIndustry:
                                  e.target.value.toLowerCase(),
                              },
                            }))
                          }
                          placeholder="Type industry focus"
                          className="w-full text-sm text-gray-900 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                        />
                        <p className="mt-1 text-[11px] text-gray-500">
                          We'll match stakeholders whose preferred industry
                          equals your entry.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Applied Filters Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {(viewingType === "startups"
                  ? [
                      ...Object.entries(filters.startups).filter(
                        ([key, value]) =>
                          value && key !== "customIndustry" && key !== "query"
                      ),
                      ...(filters.startups.industry === "other" &&
                      filters.startups.customIndustry
                        ? [["industry", filters.startups.customIndustry]]
                        : []),
                    ]
                  : [
                      ...Object.entries(filters.stakeholders).filter(
                        ([key, value]) =>
                          value &&
                          key !== "customPreferredIndustry" &&
                          key !== "query"
                      ),
                      ...(filters.stakeholders.preferredIndustry === "other" &&
                      filters.stakeholders.customPreferredIndustry
                        ? [
                            [
                              "preferredIndustry",
                              filters.stakeholders.customPreferredIndustry,
                            ],
                          ]
                        : []),
                    ]
                ).map(([key, value]) => (
                  <div
                    key={key}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    <span className="capitalize mr-1">
                      {key === "teamSize"
                        ? "Team:"
                        : key === "industry" || key === "preferredIndustry"
                        ? "Industry:"
                        : key === "fundingStage" || key === "investmentStage"
                        ? "Stage:"
                        : key.replace(/([A-Z])/g, " $1").trim() + ":"}
                    </span>
                    <span className="font-medium">{value}</span>
                    <button
                      className="ml-1.5 text-blue-500 hover:text-blue-700 focus:outline-none"
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          [viewingType]: { ...prev[viewingType], [key]: "" },
                        }));
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="h-[calc(100vh-200px)] overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : viewingType === "startups" ? (
              startups && startups.length > 0 ? (
                applyFilters(startups).map((startup) => (
                  <div
                    key={startup.id}
                    onClick={() => handleStartupClick(startup)}
                    className="bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 p-4 cursor-pointer group"
                  >
                    <div className="flex items-start space-x-3">
                      {/* Startup Logo */}
                      <div className="flex-shrink-0">
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}/startups/${
                            startup.id
                          }/photo`}
                          alt={startup.companyName}
                          className="h-12 w-12 rounded-md object-cover border border-gray-100 shadow-sm group-hover:shadow transition-shadow"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              startup.companyName
                            )}&background=0D8ABC&color=fff&size=128&bold=true`;
                          }}
                        />
                      </div>

                      {/* Startup Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1.5">
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate pr-2">
                            {startup.companyName}
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-full whitespace-nowrap">
                            {startup.industry}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                          {startup.companyDescription ||
                            "No description available"}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center">
                            <MdLocationOn className="mr-1 h-3.5 w-3.5 text-gray-400" />
                            <span className="truncate max-w-[120px]">
                              {startup.locationName ||
                                startup.city ||
                                "Location not specified"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <BsCalendarEvent className="mr-1 h-3 w-3 text-gray-400" />
                            <span>
                              {new Date(startup.foundedDate).getFullYear()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : searchQuery ? (
                <div className="py-12 px-4 text-center">
                  <div className="mx-auto h-16 w-16 text-gray-300 mb-5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-full w-full"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-gray-700 font-medium text-lg mb-1">
                    No results found
                  </h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    Try adjusting your search terms or filters to find what
                    you're looking for.
                  </p>
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        [viewingType]: {
                          query: "",
                          industry: "",
                          customIndustry: "",
                          foundedDate: "",
                          teamSize: "",
                          fundingStage: "",
                          investmentStage: "",
                          investmentRange: "",
                          preferredIndustry: "",
                          customPreferredIndustry: "",
                          location: "",
                        },
                      }))
                    }
                    className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-full w-full"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-medium">
                    Search for startups
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Enter a search term to find startups
                  </p>
                </div>
              )
            ) : stakeholders && stakeholders.length > 0 ? (
              applyFilters(stakeholders).map((stakeholder) => (
                <StakeholderCard
                  key={stakeholder.id}
                  stakeholder={stakeholder}
                  onClick={handleStakeholderClick}
                />
              ))
            ) : (
              <div className="text-center py-12 px-4">
                <div className="mx-auto h-16 w-16 text-gray-300 mb-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-full"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-gray-700 font-medium text-lg mb-1">
                  No stakeholders found
                </h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                  Try adjusting your search terms or filters to find what you're
                  looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {containerMode === "recents" && showRecents && (
        <div className="absolute left-20 top-0 h-screen w-96 bg-white shadow-lg z-5 transform transition-all duration-300 ease-in-out animate-slide-in">
          <div className="p-4 bg-gradient-to-b from-blue-600 to-blue-500 relative">
            <button
              className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
              onClick={() => {
                const container = document.querySelector(".animate-slide-in");
                if (container) {
                  container.classList.add("animate-slide-out");
                  setTimeout(() => {
                    setContainerMode(null);
                  }, 300);
                } else {
                  setContainerMode(null);
                }
              }}
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-lg text-white font-semibold mb-4">
              Recent Activity
            </h2>

            <div className="flex gap-2">
              <button
                onClick={() => setViewingType("startups")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  viewingType === "startups"
                    ? "bg-white text-blue-600"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                Startups
              </button>
              <button
                onClick={() => setViewingType("stakeholders")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  viewingType === "stakeholders"
                    ? "bg-white text-blue-600"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                Stakeholders
              </button>
            </div>
          </div>

          <div className="h-[calc(100vh-200px)] overflow-y-auto p-4 space-y-4">
            {viewingType === "startups" ? (
              recentStartups.length > 0 ? (
                recentStartups.map((startup) => (
                  <div
                    key={startup.id}
                    onClick={() => handleStartupClick(startup)}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer border border-gray-100"
                  >
                    <div className="flex items-center mb-2">
                      {/* Add startup image */}
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}/startups/${
                          startup.id
                        }/photo`}
                        alt={startup.companyName}
                        className="h-10 w-10 rounded-lg object-cover border border-gray-200 mr-3"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            startup.companyName
                          )}&background=0D8ABC&color=fff`;
                        }}
                      />
                      <div>
                        <h3 className="text-md font-semibold text-gray-900">
                          {startup.companyName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {startup.locationName}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {startup.companyDescription}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 mt-4">
                  No recent startups found.
                </div>
              )
            ) : recentStakeholders.length > 0 ? (
              recentStakeholders.map((stakeholder) => (
                <div
                  key={stakeholder.id}
                  onClick={() => handleStakeholderClick(stakeholder)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer border border-gray-100"
                >
                  <div className="flex items-center mb-2">
                    {/* Stakeholder Avatar */}
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center border border-gray-100 text-blue-700 font-semibold uppercase shadow-sm mr-3">
                      {stakeholder.name ? stakeholder.name.charAt(0) : "S"}
                    </div>
                    <div>
                      <h3 className="text-md font-semibold text-gray-900">
                        {stakeholder.name || "Unnamed Stakeholder"}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {stakeholder.region ||
                          stakeholder.city ||
                          "Location N/A"}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {investor.biography}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 mt-4">
                No recent stakeholders found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookmarks Container */}
      {containerMode === "bookmarks" && showBookmarks && (
        <Bookmarks
          userId={user}
          mapInstanceRef={mapInstanceRef}
          setViewingStartup={setViewingStartup}
          setViewingStakeholder={setViewingStakeholder}
          setContainerMode={setContainerMode}
        />
      )}

      {/* Stakeholder Details Container */}
      {stakeholder && !viewingStartup && (
        <div className="absolute left-20 top-0 h-screen w-[420px] bg-white shadow-xl z-20 transform transition-all duration-300 ease-in-out animate-slide-in overflow-y-auto">
          {/* Header with Back Button and Actions */}
          <div className="sticky top-0 z-30 bg-white border-b border-gray-200 flex justify-between items-center px-4 py-3">
            <button
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              onClick={() => {
                const container = document.querySelector(".animate-slide-in");
                if (container) {
                  container.classList.add("animate-slide-out");
                  setTimeout(() => {
                    setStakeholder(null);
                    setShowSearchContainer(true);
                  }, 300);
                } else {
                  setStakeholder(null);
                  setShowSearchContainer(true);
                }
              }}
            >
              <MdKeyboardReturn className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Back to Search</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                  isCurrentItemBookmarked ? "text-blue-600" : "text-gray-500"
                }`}
                title={
                  isCurrentItemBookmarked ? "Remove Bookmark" : "Add Bookmark"
                }
              >
                {isCurrentItemBookmarked ? (
                  <FaBookmark className="h-5 w-5" />
                ) : (
                  <FaRegBookmark className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => toggleLike(user?.id, null, stakeholder.id)}
                className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                  likedStakeholders?.includes(stakeholder.id)
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
                title={
                  likedStakeholders?.includes(stakeholder.id)
                    ? "Unlike"
                    : "Like"
                }
              >
                {likedStakeholders?.includes(stakeholder.id) ? (
                  <FaHeart className="h-5 w-5" />
                ) : (
                  <FaRegHeart className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Stakeholder Header - Enhanced with modern design */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 px-6 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
              >
                <defs>
                  <pattern
                    id="dots"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="10" cy="10" r="2" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)" />
              </svg>
            </div>

            <div className="flex items-center mb-4 relative z-10">
              {/* Modern Avatar with first letter or first+last initial */}
              <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-medium mr-4 border-2 border-white/50 shadow-lg">
                {stakeholder.name
                  ? (() => {
                      const names = stakeholder.name.split(" ");
                      if (names.length === 1)
                        return names[0].charAt(0).toUpperCase();
                      return `${names[0].charAt(0)}${names[
                        names.length - 1
                      ].charAt(0)}`.toUpperCase();
                    })()
                  : "S"}
              </div>

              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  {stakeholder.name || "Unnamed Stakeholder"}
                </h1>
                {stakeholder.organization && (
                  <span className="inline-flex items-center px-2.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-sm mt-1 border border-white/30">
                    {stakeholder.organization}
                  </span>
                )}
                {stakeholder.region && (
                  <div className="flex items-center mt-1.5 text-white/80 text-sm">
                    <MdLocationOn className="mr-1 h-4 w-4" />
                    {stakeholder.region}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information Section - Enhanced UI */}
          <div className="px-6 py-6 border-b border-gray-200 bg-white">
            <h2 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
              Contact Information
            </h2>

            <div className="space-y-4 mt-4">
              {/* Email */}
              <div className="flex items-start">
                <div className="bg-blue-50 p-2 rounded-md mr-3">
                  <HiOutlineMail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-gray-500 mb-1">Email Address</p>
                  {stakeholder.email ? (
                    <a
                      href={`mailto:${stakeholder.email}`}
                      className="text-sm text-blue-600 hover:underline block truncate font-medium"
                    >
                      {stakeholder.email}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500 italic">
                      Not provided
                    </span>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start">
                <div className="bg-green-50 p-2 rounded-md mr-3">
                  <FaPhone className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                  {stakeholder.phoneNumber ? (
                    <a
                      href={`tel:${stakeholder.phoneNumber}`}
                      className="text-sm text-gray-800 hover:text-blue-600 transition-colors font-medium"
                    >
                      {stakeholder.phoneNumber}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500 italic">
                      Not provided
                    </span>
                  )}
                </div>
              </div>

              {/* Social Media Links - Enhanced with buttons */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-3">
                  Social Media
                </p>
                <div className="flex flex-wrap gap-3">
                  {stakeholder.linkedIn ? (
                    <a
                      href={
                        stakeholder.linkedIn.startsWith("http")
                          ? stakeholder.linkedIn
                          : `https://${stakeholder.linkedIn}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-1.5 bg-[#0A66C2] text-white rounded-md hover:bg-[#004182] transition-colors text-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="mr-2"
                      >
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                      LinkedIn
                    </a>
                  ) : null}

                  {stakeholder.facebook ? (
                    <a
                      href={
                        stakeholder.facebook.startsWith("http")
                          ? stakeholder.facebook
                          : `https://${stakeholder.facebook}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-1.5 bg-[#1877F2] text-white rounded-md hover:bg-[#0b5fcc] transition-colors text-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="mr-2"
                      >
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                      </svg>
                      Facebook
                    </a>
                  ) : null}

                  {!stakeholder.linkedIn && !stakeholder.facebook && (
                    <div className="flex items-center text-sm text-gray-500 italic">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      No social media profiles provided
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location Information - Enhanced UI */}
          <div className="px-6 py-6 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-red-500"
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
              Location Details
            </h2>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mt-2">
              <div className="flex items-start">
                <MdLocationOn className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  {/* Check if any location information exists */}
                  {[
                    stakeholder.street,
                    stakeholder.barangay,
                    stakeholder.city,
                    stakeholder.province,
                    stakeholder.region,
                    stakeholder.postalCode,
                  ].some(Boolean) ? (
                    <>
                      {/* Address Line 1 */}
                      {stakeholder.street && (
                        <p className="text-sm font-medium text-gray-800 mb-1">
                          {stakeholder.street}
                        </p>
                      )}

                      {/* Address Line 2 */}
                      {(stakeholder.barangay || stakeholder.city) && (
                        <p className="text-sm text-gray-700 mb-1">
                          {[stakeholder.barangay, stakeholder.city]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}

                      {/* Region and Postal */}
                      <p className="text-sm text-gray-600">
                        {[
                          stakeholder.province,
                          stakeholder.region,
                          stakeholder.postalCode &&
                            `Postal Code: ${stakeholder.postalCode}`,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>

                      {/* Map link */}
                      {(stakeholder.city || stakeholder.region) && (
                        <a
                          href={`https://www.google.com/maps/search/${encodeURIComponent(
                            [
                              stakeholder.street,
                              stakeholder.city,
                              stakeholder.region,
                            ]
                              .filter(Boolean)
                              .join(", ")
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center mt-2 text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          View on map
                        </a>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center text-sm text-gray-500 italic">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Location information not available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Information - Enhanced UI */}
          <div className="px-6 py-6">
            <h2 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Activity &amp; Engagement
            </h2>

            {/* Member Since Badge */}
            {stakeholder.createdAt ? (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">
                    MEMBER SINCE
                  </p>
                  <p className="text-sm text-gray-800 font-semibold">
                    {new Date(stakeholder.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4 flex items-center">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">
                    NEW MEMBER
                  </p>
                  <p className="text-sm text-gray-800 font-semibold">
                    Recently joined the platform
                  </p>
                </div>
              </div>
            )}

            {/* Stats with enhanced visuals */}
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Engagement Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Profile Views */}
              <div className="bg-white border border-gray-100 hover:shadow-sm transition-all duration-200 rounded-lg p-4 text-center">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-50 text-blue-500 mb-2">
                  <FaRegEye className="h-4 w-4" />
                </div>
                <p className="text-xl font-bold text-gray-800 mb-1">
                  {stakeholder.viewsCount || 0}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Profile Views
                </p>
              </div>

              {/* Likes */}
              <div className="bg-white border border-gray-100 hover:shadow-sm transition-all duration-200 rounded-lg p-4 text-center">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-50 text-red-500 mb-2">
                  <FaHeart className="h-4 w-4" />
                </div>
                <p className="text-xl font-bold text-gray-800 mb-1">
                  {stakeholderLikeCounts?.[stakeholder.id] || 0}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Likes
                </p>
              </div>

              {/* Organization Connections - If we have this data */}
              {stakeholder.connectionCount && (
                <div className="bg-white border border-gray-100 hover:shadow-sm transition-all duration-200 rounded-lg p-4 text-center col-span-2">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-green-50 text-green-500 mb-2">
                    <BsPeople className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-bold text-gray-800 mb-1">
                    {stakeholder.connectionCount}
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Organization Connections
                  </p>
                </div>
              )}
            </div>

            {/* Last Updated */}
            {stakeholder.updatedAt && (
              <p className="text-xs text-gray-400 text-center mt-6">
                Last profile update:{" "}
                {new Date(
                  stakeholder.updatedAt || stakeholder.createdAt
                ).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Startup Details Container */}
      {startup && !viewingStartup && (
        <div className="absolute left-20 top-0 h-screen w-[420px] bg-white shadow-xl z-20 transform transition-all duration-300 ease-in-out animate-slide-in overflow-y-auto">
          {/* Header with Back Button and Actions */}
          <div className="sticky top-0 z-30 bg-white border-b border-gray-200 flex justify-between items-center px-4 py-3">
            <button
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              onClick={() => {
                const container = document.querySelector(".animate-slide-in");
                if (container) {
                  container.classList.add("animate-slide-out");
                  setTimeout(() => {
                    setStartup(null);
                    setShowSearchContainer(true);
                  }, 300);
                } else {
                  setStartup(null);
                  setShowSearchContainer(true);
                }
              }}
            >
              <MdKeyboardReturn className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Back to Search</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                  isCurrentItemBookmarked ? "text-blue-600" : "text-gray-500"
                }`}
                title={
                  isCurrentItemBookmarked ? "Remove Bookmark" : "Add Bookmark"
                }
              >
                {isCurrentItemBookmarked ? (
                  <FaBookmark className="h-5 w-5" />
                ) : (
                  <FaRegBookmark className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => toggleLike(user?.id, startup.id, null)}
                className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                  likedStartups?.includes(startup.id)
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
                title={likedStartups?.includes(startup.id) ? "Unlike" : "Like"}
              >
                {likedStartups?.includes(startup.id) ? (
                  <FaHeart className="h-5 w-5" />
                ) : (
                  <FaRegHeart className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Company Banner and Logo - improved */}
          <div className="relative">
            <div className="h-36 bg-gradient-to-r from-blue-500 to-blue-700 overflow-hidden">
              {/* Abstract pattern background */}
              <div className="absolute inset-0 opacity-30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="100%"
                  height="100%"
                >
                  <defs>
                    <pattern
                      id="grid"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            </div>

            {/* Logo overlay - optimized */}
            <div className="absolute -bottom-12 left-6 h-24 w-24 bg-white rounded-lg shadow-md flex items-center justify-center p-1.5 border-4 border-white">
              {loadingImage ? (
                <div className="flex items-center justify-center h-full w-full bg-gray-100 rounded">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}/startups/${
                    startup.id
                  }/photo`}
                  alt={startup.companyName}
                  className="w-full h-full object-contain rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      startup.companyName
                    )}&background=0D8ABC&color=fff&size=128&bold=true`;
                  }}
                />
              )}
            </div>

            {/* Stats overlay - improved */}
            <div className="absolute -bottom-2 right-4 flex space-x-2">
              <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white">
                <FaRegEye className="h-3.5 w-3.5" />
                <span>{startup.viewsCount || 0}</span>
              </div>
              <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white">
                <FaHeart className="h-3.5 w-3.5" />
                <span>{startupLikeCounts?.[startup.id] || 0}</span>
              </div>
            </div>
          </div>

          {/* Company Info - improved */}
          <div className="mt-14 px-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              {startup.companyName}
            </h1>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {startup.industry && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100">
                  {startup.industry.charAt(0).toUpperCase() +
                    startup.industry.slice(1)}
                </span>
              )}
              {startup.fundingStage && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-800 border border-green-100">
                  {startup.fundingStage.charAt(0).toUpperCase() +
                    startup.fundingStage.slice(1)}
                </span>
              )}
              {startup.typeOfCompany && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100">
                  {startup.typeOfCompany.charAt(0).toUpperCase() +
                    startup.typeOfCompany.slice(1)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              {startup.locationName && (
                <div className="flex items-center">
                  <MdLocationOn className="h-4 w-4 text-gray-500 mr-1" />
                  <span>
                    {startup.locationName ||
                      `${startup.city || ""}, ${startup.province || ""}`}
                  </span>
                </div>
              )}
              {startup.foundedDate && (
                <div className="flex items-center">
                  <BsCalendarEvent className="h-3.5 w-3.5 text-gray-500 mr-1" />
                  <span>
                    Est.{" "}
                    {new Date(startup.foundedDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Key Metrics - improved */}
            <div className="grid grid-cols-3 gap-4 py-3 border-t border-b border-gray-200 my-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Team Size</p>
                <div className="flex items-center justify-center gap-1">
                  <BsPeople className="h-4 w-4 text-blue-500" />
                  <p className="font-medium text-gray-900">
                    {startup.numberOfEmployees || "N/A"}
                  </p>
                </div>
              </div>
              <div className="text-center border-x border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Hours</p>
                <div className="flex items-center justify-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-500"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <p className="font-medium text-gray-900">
                    {startup.operatingHours || "N/A"}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <p className="font-medium text-gray-900">
                    {startup.status || "Active"}
                  </p>
                </div>
              </div>
            </div>

            {/* About Section - improved */}
            <div className="space-y-2 mb-6">
              <h2 className="text-base font-medium text-gray-900">About</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {startup.companyDescription || "No description provided."}
              </p>
            </div>

            {/* Contact and Links Section - optional content */}
            {(startup.website || startup.email) && (
              <div className="space-y-2 mb-6 border-t border-gray-200 pt-4">
                <h2 className="text-base font-medium text-gray-900">Contact</h2>
                <div className="space-y-2">
                  {startup.website && (
                    <a
                      href={
                        startup.website.startsWith("http")
                          ? startup.website
                          : `https://${startup.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <MdOutlineLink className="h-4 w-4 mr-2" />
                      {startup.website}
                    </a>
                  )}
                  {startup.email && (
                    <a
                      href={`mailto:${startup.email}`}
                      className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <HiOutlineMail className="h-4 w-4 mr-2" />
                      {startup.email}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {/* Modals */}
      {openLogin && (
        <Login
          closeModal={() => setOpenLogin(false)}
          openRegister={() => {
            setOpenLogin(false);
            setOpenRegister(true);
          }}
          onLoginSuccess={async (userData) => {
            setIsAuthenticated(true);
            setOpenLogin(false);
            setCurrentUser(userData);
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            setUserDetails(userData);
            await fetchUserLikes();
            await fetchNotificationsCount();
            await fetchNotifications();
          }}
        />
      )}

      {openRegister && (
        <Signup
          closeModal={() => setOpenRegister(false)}
          openLogin={() => {
            setOpenRegister(false);
            setOpenLogin(true);
          }}
        />
      )}
    </div>
  );
}

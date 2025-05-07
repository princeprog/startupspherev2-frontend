import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Login from "../modals/Login";
import Signup from "../modals/Signup";
import { CiLocationOn } from "react-icons/ci";
import { CiGlobe } from "react-icons/ci";
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
import { FaRegHeart, FaRegBookmark } from "react-icons/fa";
import { BsCalendarEvent, BsPeople, BsBriefcase } from "react-icons/bs";
import { HiOutlineMail } from "react-icons/hi";

export default function Sidebar({ mapInstanceRef, setUserDetails }) {
  const navigate = useNavigate();
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSearchContainer, setShowSearchContainer] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startups: {
      industry: '',
      foundedDate: '',
      teamSize: '',
      fundingStage: ''
    },
    investors: {
      investmentStage: '',
      investmentRange: '',
      preferredIndustry: '',
      location: ''
    }
  });
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startup, setStartup] = useState(null);
  const [investors, setInvestors] = useState([]);
  const [investor, setInvestor] = useState(null); // New state for viewing an investor
  const [viewingType, setViewingType] = useState("startups"); // Toggle between startups and investors
  const [viewingStartup, setViewingStartup] = useState(null); // New state for viewing mode
  const [viewingInvestor, setViewingInvestor] = useState(null); // New state for viewing an investor
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
  const [containerMode, setContainerMode] = useState(null); // "search" or "recents"
  const [bookmarkedStartups, setBookmarkedStartups] = useState([]); // For bookmarked startups
  const [bookmarkedInvestors, setBookmarkedInvestors] = useState([]); // For bookmarked investors
  const [likedInvestors, setLikedInvestors] = useState([]);
  const [likedStartups, setLikedStartups] = useState([]); // For liked startups
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false); // New state for image loading
  const [isCurrentItemBookmarked, setIsCurrentItemBookmarked] = useState(false);

  // Fetch user on mount or when user details are updated
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("http://localhost:8080/users/me", {
          method: "GET",
          credentials: "include",
        });

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
    const key = type === "startups" ? "recentStartups" : "recentInvestors";
    const existingRecents = JSON.parse(localStorage.getItem(key)) || [];
    const updatedRecents = [
      item,
      ...existingRecents.filter((i) => i.id !== item.id),
    ].slice(0, 10); // Limit to 10 items
    localStorage.setItem(key, JSON.stringify(updatedRecents));
  };

  const getRecents = (type) => {
    const key = type === "startups" ? "recentStartups" : "recentInvestors";
    return JSON.parse(localStorage.getItem(key)) || [];
  };

  const [recentStartups, setRecentStartups] = useState([]);
  const [recentInvestors, setRecentInvestors] = useState([]);

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        console.log("Logout successful");
        setIsAuthenticated(false);
        setUser(null); // Clear user state
        setCurrentUser(null); // Clear current user state
        setLikedStartups([]); // Clear likes
        setLikedInvestors([]); // Clear likes
        localStorage.removeItem("likedStartups");
        localStorage.removeItem("likedInvestors");
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
        document.cookie =
          "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setUserDetails(null); // Clear parent state
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const checkAuthentication = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/check", {
        method: "GET",
        credentials: "include",
      });
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
      const response = await fetch("http://localhost:8080/startups/approved", {
        credentials: "include",
      });
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

  const fetchInvestors = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/investors", {
        credentials: "include",
      });
      const data = await response.json();
      console.log("Fetched investors:", data); // Verify the `investorId` field is present

      // Map investorId to id for consistency
      const mappedInvestors = data.map((investor) => ({
        ...investor,
        id: investor.investorId, // Map investorId to id
      }));

      setInvestors(mappedInvestors);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return; // Do nothing if the search query is empty

    setLoading(true);
    try {
      const endpoint =
        viewingType === "startups"
          ? `http://localhost:8080/startups/search`
          : `http://localhost:8080/investors/search`;

      const response = await fetch(`${endpoint}?query=${searchQuery}`, {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error("Network response was not ok: ", data);
      }

      if (viewingType === "startups") {
        setStartups(data);
      } else {
        setInvestors(data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch the bookmarked items from localStorage
  useEffect(() => {
    const storedBookmarkedStartups =
      JSON.parse(localStorage.getItem("bookmarkedStartups")) || [];
    const storedBookmarkedInvestors =
      JSON.parse(localStorage.getItem("bookmarkedInvestors")) || [];
    setBookmarkedStartups(storedBookmarkedStartups);
    setBookmarkedInvestors(storedBookmarkedInvestors);
  }, []);

  useEffect(() => {
    const storedAuthState = localStorage.getItem("isAuthenticated");
    if (storedAuthState === "true") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setLikedStartups([]); // Clear likes
      setLikedInvestors([]); // Clear likes
    }
    checkAuthentication();
  }, []);

  const toggleTooltip = () => {
    setShowTooltip((prev) => !prev);
  };

  const addView = async (id) => {
    try {
      const response = await fetch("http://localhost:8080/api/views", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
        credentials: "include",
      });

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
    setInvestor(null);
    setViewingStartup(null);
    setViewingInvestor(null);
    setContainerMode(null);
    addView(startup.id);

    setLoadingImage(true); // Start loading animation

    // Fetch the startup image
    fetch(`http://localhost:8080/startups/${startup.id}/photo`, {
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
    fetch(`http://localhost:8080/startups/${startup.id}/increment-views`, {
      method: "PUT",
      credentials: "include",
    })
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

  const handleInvestorClick = (investor) => {
    if (!investor || !investor.id) {
      console.error("Invalid investor object:", investor);
      return;
    }

    // Close other sidebars
    setStartup(null);
    setViewingStartup(null);
    setViewingInvestor(null);
    setContainerMode(null);

    // Increment views on the backend by sending a PUT request
    fetch(`http://localhost:8080/investors/${investor.id}/increment-views`, {
      method: "PUT",
      credentials: "include", // Include credentials to support session cookies
    })
      .then((response) => {
        if (response.ok) {
          console.log("Views incremented successfully");

          // After incrementing views, fetch the updated view count
          fetch(`http://localhost:8080/investors/${investor.id}/views`, {
            method: "GET",
            credentials: "include", // Include credentials to support session cookies
          })
            .then((response) => response.json())
            .then((views) => {
              console.log("Updated views count:", views);
              // Optionally, update the UI with the new view count
              setInvestor((prevInvestor) => ({
                ...prevInvestor,
                views: views, // Assuming views is the response object
              }));
            })
            .catch((error) => {
              console.error("Error fetching updated view count:", error);
            });
        } else {
          console.error("Failed to increment views");
        }
      })
      .catch((error) => {
        console.error("Error incrementing views:", error);
      });

    // Zoom into the investor's location on the map if valid location data exists
    if (investor.locationLang && investor.locationLat) {
      mapInstanceRef.current.flyTo({
        center: [
          parseFloat(investor.locationLang),
          parseFloat(investor.locationLat),
        ],
        zoom: 14,
        essential: true,
      });
    }

    // Add the investor to recents and update the UI
    addToRecents(investor, "investors"); // Add to recents
    setInvestor(investor); // Set the investor object
    setShowSearchContainer(false); // Close the search container
  };

  useEffect(() => {
    if (containerMode === "recents") {
      setRecentStartups(getRecents("startups"));
      setRecentInvestors(getRecents("investors"));
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
      const response = await fetch("http://localhost:8080/api/likes", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const likesData = await response.json();

        const userLikedStartups = likesData
          .filter((like) => like.startupId !== null && like.userId === user.id)
          .map((like) => like.startupId);

        const userLikedInvestors = likesData
          .filter((like) => like.investorId !== null && like.userId === user.id)
          .map((like) => like.investorId);

        console.log("Updated liked startups:", userLikedStartups);
        console.log("Updated liked investors:", userLikedInvestors);

        setLikedStartups(userLikedStartups);
        setLikedInvestors(userLikedInvestors);
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
      const response = await fetch("http://localhost:8080/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

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
            setLikedInvestors((prev) => prev.filter((id) => id !== investorId));
            setInvestorLikeCounts((prev) => ({
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
            setLikedInvestors((prev) => [...prev, investorId]);
            setInvestorLikeCounts((prev) => ({
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
    if (!user || (!startup && !investor)) return;

    try {
      const response = await fetch("http://localhost:8080/api/bookmarks", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const bookmarks = await response.json();
        const isBookmarked = bookmarks.some(
          (bookmark) =>
            (startup && bookmark.startup?.id === startup.id) ||
            (investor && bookmark.investor?.id === investor.id)
        );
        setIsCurrentItemBookmarked(isBookmarked);
      }
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };

  useEffect(() => {
    checkIfBookmarked();
  }, [startup, investor]);

  const toggleBookmark = async () => {
    if (!user) {
      toast.error("Please log in to bookmark.");
      return;
    }

    const payload = {
      startupId: startup ? startup.id : null,
      investorId: investor ? investor.id : null,
    };

    try {
      if (isCurrentItemBookmarked) {
        // If already bookmarked, remove it
        const checkResponse = await fetch(
          "http://localhost:8080/api/bookmarks",
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
              (investor && bookmark.investor?.id === investor.id)
          );

          if (existingBookmark) {
            const deleteResponse = await fetch(
              `http://localhost:8080/api/bookmarks/${existingBookmark.id}`,
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
              } else if (investor) {
                setBookmarkedInvestors((prev) =>
                  prev.filter((id) => id !== investor.id)
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
        const addResponse = await fetch("http://localhost:8080/api/bookmarks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (addResponse.ok) {
          const result = await addResponse.json();
          if (startup) {
            setBookmarkedStartups((prev) => [...prev, startup.id]);
          } else if (investor) {
            setBookmarkedInvestors((prev) => [...prev, investor.id]);
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
  const [investorLikeCounts, setInvestorLikeCounts] = useState({});

  useEffect(() => {
    fetch("http://localhost:8080/api/likes", {
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
        setInvestorLikeCounts(investorCounts);
      })
      .catch((err) => console.error("Failed to fetch likes:", err));
  }, []);

  // Add useEffect to fetch startups when component mounts
  useEffect(() => {
    fetchStartups();
  }, []);

  const applyFilters = (items) => {
    if (!items || items.length === 0) return items;

    const currentFilters = viewingType === 'startups' ? filters.startups : filters.investors;

    return items.filter(item => {
      if (viewingType === 'startups') {
        // Industry filter
        const industryMatch = !currentFilters.industry || item.industry === currentFilters.industry;

        // Founded date filter
        const foundedDateMatch = !currentFilters.foundedDate || 
          (item.foundedDate && item.foundedDate.includes(currentFilters.foundedDate));

        // Team size filter
        const teamSizeMatch = !currentFilters.teamSize || (() => {
          const employeeCount = parseInt(item.numberOfEmployees);
          if (isNaN(employeeCount)) return false;
          
          switch (currentFilters.teamSize) {
            case '1-10':
              return employeeCount >= 1 && employeeCount <= 10;
            case '11-50':
              return employeeCount >= 11 && employeeCount <= 50;
            case '51-200':
              return employeeCount >= 51 && employeeCount <= 200;
            case '201+':
              return employeeCount >= 201;
            default:
              return true;
          }
        })();

        // Funding stage filter
        const fundingStageMatch = !currentFilters.fundingStage || 
          item.fundingStage === currentFilters.fundingStage;

        return industryMatch && foundedDateMatch && teamSizeMatch && fundingStageMatch;
      } else {
        return (
          (!currentFilters.investmentStage || item.investmentStage === currentFilters.investmentStage) &&
          (!currentFilters.investmentRange || item.investmentRange === currentFilters.investmentRange) &&
          (!currentFilters.preferredIndustry || item.preferredIndustry === currentFilters.preferredIndustry) &&
          (!currentFilters.location || item.locationName === currentFilters.location)
        );
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

      {location.pathname === "/" && (
        <div className="absolute p-4 rounded bg-white bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 z-50 shadow-lg">
          <div className="flex items-center">
            <div
              aria-label="status"
              className="mr-2 status status-lg bg-red-600"
            ></div>
            <h1 className="text-black">Startups</h1>
          </div>
          <div className="flex items-center">
            <div
              aria-label="status"
              className="mr-2 status status-lg bg-blue-600"
            ></div>
            <h1 className="text-black">Investors</h1>
          </div>
        </div>
      )}

      {viewingInvestor && (
        <div className="absolute w-fit top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg px-4 py-2 z-50 flex items-center space-x-2 border border-gray-100">
          <button
            className="text-blue-600 hover:text-blue-700 transition-colors flex items-center cursor-pointer"
            onClick={() => {
              setViewingInvestor(null);
              setInvestor(viewingInvestor);
            }}
          >
            <MdKeyboardReturn className="mr-1 cursor-pointer text-xl" />
          </button>
          <span className="text-gray-700 text-sm flex items-center">
            Viewing{" "}
            <p className="font-semibold ml-2 text-gray-900">
              {viewingInvestor.firstname} {viewingInvestor.lastname}
            </p>
          </span>
        </div>
      )}

      {/* Sidebar */}
      <div className="flex h-screen w-20 flex-col justify-between border-r border-gray-200 bg-white shadow-sm z-10">
        <div>
          {/* Logo */}
          <div className="flex justify-center items-center py-6 border-b border-gray-200">
            <button
              onClick={() => (window.location.href = "http://localhost:5173/")}
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
                {/* Search Icon */}
                <li className="flex justify-center">
                  <button
                    className="group relative flex flex-col items-center justify-center rounded-lg p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      fetchStartups();
                      fetchInvestors();
                      fetchUserLikes();
                      setContainerMode("search");
                      setShowSearchContainer((prev) => !prev);
                      setViewingStartup(null);
                      setViewingInvestor(null);
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
                        d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                      />
                    </svg>
                    <span className="absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
                      Search
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
                          setContainerMode("recents");
                          setShowSearchContainer(false);
                          setStartup(null);
                          setInvestor(null);
                          setViewingStartup(null);
                          setViewingInvestor(null);
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
                          setContainerMode("bookmarks");
                          setShowSearchContainer(false);
                          setStartup(null);
                          setInvestor(null);
                          setViewingStartup(null);
                          setViewingInvestor(null);
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

                    {/* Dashboard Icon */}
                    <li className="flex justify-center">
                      <button
                        onClick={() => navigate("/startup-dashboard")}
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
                        onClick={() => navigate("/all-startup-dashboard")}
                        className="group relative flex flex-col items-center justify-center rounded-lg p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 cursor-pointer"
                      >
                        <Award className="h-6 w-6 opacity-80 group-hover:opacity-100" />
                        <span className="absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
                          All Startups
                        </span>
                      </button>
                    </li>
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
              onClick={() => setShowTooltip((prev) => !prev)}
            >
              <div className="bg-gradient-to-br from-blue-400 to-blue-700 text-white w-12 rounded-full flex items-center justify-center shadow-md">
                <span className="text-lg font-semibold">
                  {isAuthenticated === null
                    ? "?"
                    : isAuthenticated && currentUser
                      ? `${currentUser.firstname?.[0] ?? ""}${currentUser.lastname?.[0] ?? ""
                        }`.toUpperCase()
                      : "G"}
                </span>
              </div>
            </div>

            {showTooltip && (
              <div className="cursor-pointer absolute top-14 right-0 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                      <div className="text-sm font-semibold text-gray-900">
                        {currentUser?.firstname} {currentUser?.lastname}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {currentUser?.email}
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
          <div className="p-4 bg-gradient-to-b from-blue-600 to-blue-500 relative">
            <button
              className="cursor-pointer absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
              onClick={() => {
                const container = document.querySelector(".animate-slide-in");
                if (container) {
                  container.classList.add("animate-slide-out");
                  setTimeout(() => {
                    setShowSearchContainer(false);
                  }, 300);
                } else {
                  setShowSearchContainer(false);
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

            <h2 className="text-lg text-white font-semibold mb-4">Search</h2>

            <form
              className="flex items-center max-w-sm mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <div className="relative w-full">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/90 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5"
                  placeholder={`Search ${viewingType}`}
                  required
                />
              </div>
              <button
                type="submit"
                className="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
                <span className="sr-only">Search</span>
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="p-2.5 ms-2 text-sm font-medium bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors"
              >
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </button>
            </form>

            {showFilters && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                  <button
                    onClick={() => {
                      setFilters({
                        startups: {
                          industry: '',
                          foundedDate: '',
                          teamSize: '',
                          fundingStage: ''
                        },
                        investors: {
                          investmentStage: '',
                          investmentRange: '',
                          preferredIndustry: '',
                          location: ''
                        }
                      });
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset All
                  </button>
                </div>

                {viewingType === 'startups' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                        <select
                          value={filters.startups.industry}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            startups: { ...prev.startups, industry: e.target.value }
                          }))}
                          className="mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">All Industries</option>
                          <optgroup label="Technology & Digital">
                            <option value="technology">Technology</option>
                            <option value="telecommunications">Telecommunications</option>
                            <option value="entertainment">Entertainment</option>
                          </optgroup>
                          <optgroup label="Business & Finance">
                            <option value="finance">Finance</option>
                            <option value="legal_services">Legal Services</option>
                            <option value="real_estate">Real Estate</option>
                          </optgroup>
                          <optgroup label="Healthcare & Education">
                            <option value="healthcare">Healthcare</option>
                            <option value="education">Education</option>
                          </optgroup>
                          <optgroup label="Industrial & Manufacturing">
                            <option value="manufacturing">Manufacturing</option>
                            <option value="construction">Construction</option>
                            <option value="energy">Energy</option>
                          </optgroup>
                          <optgroup label="Consumer & Services">
                            <option value="retail">Retail</option>
                            <option value="hospitality">Hospitality</option>
                            <option value="transportation">Transportation</option>
                          </optgroup>
                          <optgroup label="Other">
                            <option value="agriculture">Agriculture</option>
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Founded Date</label>
                        <select
                          value={filters.startups.foundedDate}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            startups: { ...prev.startups, foundedDate: e.target.value }
                          }))}
                          className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">Any Time</option>
                          <optgroup label="Recent (2020-Present)">
                            <option value="2027">2027</option>
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
                            <option value="2021">2021</option>
                            <option value="2020">2020</option>
                          </optgroup>
                          <optgroup label="Past Years">
                            <option value="2019">2019</option>
                            <option value="2018">2018</option>
                            <option value="2017">2017</option>
                            <option value="2016">2016</option>
                            <option value="2015">2015</option>
                            <option value="2014">2014</option>
                            <option value="2013">2013</option>
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
                        <select
                          value={filters.startups.teamSize}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            startups: { ...prev.startups, teamSize: e.target.value }
                          }))}
                          className="mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">Any Size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201+">201+ employees</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Funding Stage</label>
                        <select
                          value={filters.startups.fundingStage}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            startups: { ...prev.startups, fundingStage: e.target.value }
                          }))}
                          className="mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">Any Stage</option>
                          <option value="bootstrapped">Bootstrapped</option>
                          <option value="seed">Seed</option>
                          <option value="series_a">Series A</option>
                          <option value="series_b">Series B</option>
                          <option value="series_c">Series C</option>
                          <option value="public">Public</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Investment Stage</label>
                        <select
                          value={filters.investors.investmentStage}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            investors: { ...prev.investors, investmentStage: e.target.value }
                          }))}
                          className="mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">Any Stage</option>
                          <option value="bootstrapped">Bootstrapped</option>
                          <option value="seed">Seed</option>
                          <option value="series_a">Series A</option>
                          <option value="series_b">Series B</option>
                          <option value="series_c">Series C</option>
                          <option value="public">Public</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Investment Range</label>
                        <select
                          value={filters.investors.investmentRange}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            investors: { ...prev.investors, investmentRange: e.target.value }
                          }))}
                          className="mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">Any Range</option>
                          <option value="0-100k">$0 - $100k</option>
                          <option value="100k-1M">$100k - $1M</option>
                          <option value="1M-10M">$1M - $10M</option>
                          <option value="10M+">$10M+</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Industry</label>
                        <select
                          value={filters.investors.preferredIndustry}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            investors: { ...prev.investors, preferredIndustry: e.target.value }
                          }))}
                          className="mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">All Industries</option>
                          <optgroup label="Technology & Digital">
                            <option value="technology">Technology</option>
                            <option value="telecommunications">Telecommunications</option>
                            <option value="entertainment">Entertainment</option>
                          </optgroup>
                          <optgroup label="Business & Finance">
                            <option value="finance">Finance</option>
                            <option value="legal_services">Legal Services</option>
                            <option value="real_estate">Real Estate</option>
                          </optgroup>
                          <optgroup label="Healthcare & Education">
                            <option value="healthcare">Healthcare</option>
                            <option value="education">Education</option>
                          </optgroup>
                          <optgroup label="Industrial & Manufacturing">
                            <option value="manufacturing">Manufacturing</option>
                            <option value="construction">Construction</option>
                            <option value="energy">Energy</option>
                          </optgroup>
                          <optgroup label="Consumer & Services">
                            <option value="retail">Retail</option>
                            <option value="hospitality">Hospitality</option>
                            <option value="transportation">Transportation</option>
                          </optgroup>
                          <optgroup label="Other">
                            <option value="agriculture">Agriculture</option>
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <select
                          value={filters.investors.location}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            investors: { ...prev.investors, location: e.target.value }
                          }))}
                          className="mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">Any Location</option>
                          <optgroup label="North America">
                            <option value="New York">New York</option>
                            <option value="San Francisco">San Francisco</option>
                            <option value="Los Angeles">Los Angeles</option>
                            <option value="Boston">Boston</option>
                          </optgroup>
                          <optgroup label="Europe">
                            <option value="London">London</option>
                            <option value="Berlin">Berlin</option>
                            <option value="Paris">Paris</option>
                          </optgroup>
                          <optgroup label="Asia">
                            <option value="Singapore">Singapore</option>
                            <option value="Tokyo">Tokyo</option>
                            <option value="Hong Kong">Hong Kong</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleSearch();
                      setShowFilters(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Apply Filters
                  </button>
                </div>

                {/* Active Filters Display */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(viewingType === 'startups' ? filters.startups : filters.investors).map(([key, value]) => {
                      if (!value) return null;
                      return (
                        <div key={key} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          <span>{key.replace(/([A-Z])/g, ' $1').trim()}: {value}</span>
                          <button
                            onClick={() => {
                              if (viewingType === 'startups') {
                                setFilters(prev => ({
                                  ...prev,
                                  startups: { ...prev.startups, [key]: '' }
                                }));
                              } else {
                                setFilters(prev => ({
                                  ...prev,
                                  investors: { ...prev.investors, [key]: '' }
                                }));
                              }
                            }}
                            className="hover:text-blue-900"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setViewingType("startups")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${viewingType === "startups"
                  ? "bg-white text-blue-600"
                  : "bg-white/20 text-white hover:bg-white/30"
                  }`}
              >
                Startups
              </button>
              <button
                onClick={() => setViewingType("investors")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${viewingType === "investors"
                  ? "bg-white text-blue-600"
                  : "bg-white/20 text-white hover:bg-white/30"
                  }`}
              >
                Investors
              </button>
            </div>
          </div>

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
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">
                        {startup.locationName}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
                        {startup.industry}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {startup.companyName}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {startup.companyDescription}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 mt-4">
                  No startups available
                </div>
              )
            ) : investors.length > 0 ? (
              applyFilters(investors).map((investor) => (
                <div
                  key={investor.investorId}
                  onClick={() => handleInvestorClick(investor)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      {investor.locationName}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
                      {investor.gender}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {investor.firstname} {investor.lastname}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {investor.biography}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 mt-4">
                No investors match your search.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recents Container */}
      {containerMode === "recents" && (
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
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${viewingType === "startups"
                  ? "bg-white text-blue-600"
                  : "bg-white/20 text-white hover:bg-white/30"
                  }`}
              >
                Startups
              </button>
              <button
                onClick={() => setViewingType("investors")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${viewingType === "investors"
                  ? "bg-white text-blue-600"
                  : "bg-white/20 text-white hover:bg-white/30"
                  }`}
              >
                Investors
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
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">
                        {startup.locationName}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
                        {startup.industry}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {startup.companyName}
                    </h3>
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
            ) : recentInvestors.length > 0 ? (
              recentInvestors.map((investor) => (
                <div
                  key={investor.investorId}
                  onClick={() => handleInvestorClick(investor)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      {investor.locationName}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
                      {investor.gender}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {investor.firstname} {investor.lastname}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {investor.biography}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 mt-4">
                No recent investors found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookmarks Container */}
      {containerMode === "bookmarks" && (
        <Bookmarks
          userId={user}
          mapInstanceRef={mapInstanceRef}
          setViewingStartup={setViewingStartup}
          setViewingInvestor={setViewingInvestor}
          setContainerMode={setContainerMode}
        />
      )}

      {/* Investor Details Container */}
      {investor && !viewingStartup && (
        <div className="absolute left-20 top-0 h-screen w-96 bg-white shadow-lg z-20 transform transition-all duration-300 ease-in-out animate-slide-in">
          <div className="flex justify-end p-4 border-b border-gray-200">
            <button
              className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => {
                const container = document.querySelector(".animate-slide-in");
                if (container) {
                  container.classList.add("animate-slide-out");
                  setTimeout(() => {
                    setInvestor(null);
                    setShowSearchContainer(true);
                  }, 300);
                } else {
                  setInvestor(null);
                  setShowSearchContainer(true);
                }
              }}
            >
              <MdKeyboardReturn className="h-6 w-6" />
            </button>
          </div>

          <div className="h-52 bg-gradient-to-br from-blue-500 to-blue-600"></div>

          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-gray-900">
                {investor.firstname} {investor.lastname}
              </h1>
              <p className="flex items-center text-gray-600 text-sm">
                <CiLocationOn className="mr-1" />
                {investor.locationName}
              </p>
              <a
                href={investor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 text-sm hover:underline"
              >
                <CiGlobe className="mr-1 text-gray-700" />
                {investor.website}
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => toggleLike(user.id, null, investor.id)}
                className={`text-2xl transition cursor-pointer ${likedInvestors.includes(investor.id)
                  ? "text-red-500"
                  : "text-gray-400 hover:text-red-400"
                  }`}
              >
                <FaHeart />
              </button>
              <span className="text-sm text-gray-700">
                {investorLikeCounts[investor.id] || 0}
              </span>
              <button
                onClick={toggleBookmark}
                className={`text-2xl transition cursor-pointer ${isCurrentItemBookmarked
                  ? "text-blue-500"
                  : "text-gray-400 hover:text-blue-400"
                  }`}
              >
                <FaBookmark />
              </button>
            </div>

            <div className="flex items-center text-gray-700">
              <FaRegEye className="mr-2 text-xl" />
              <span className="text-sm">{investor.views || 0} views</span>
            </div>

            <div className="pt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">About</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {investor.biography}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  className="cursor-pointer flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    if (
                      investor &&
                      investor.locationLang &&
                      investor.locationLat
                    ) {
                      mapInstanceRef.current.flyTo({
                        center: [
                          parseFloat(investor.locationLang),
                          parseFloat(investor.locationLat),
                        ],
                        zoom: 14,
                        essential: true,
                      });
                      setViewingInvestor(investor);
                      setInvestor(null);
                    }
                  }}
                >
                  Preview Location
                </button>
                <button className="cursor-pointer flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Update Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Startup Details Container */}
      {startup && !viewingStartup && (
        <div className="absolute left-20 top-0 h-screen w-96 bg-white shadow-lg z-20 transform transition-all duration-300 ease-in-out animate-slide-in overflow-y-auto">
          <div className="flex justify-end p-4 border-b border-gray-200">
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors"
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
              <MdKeyboardReturn className="h-6 w-6" />
            </button>
          </div>

          <div className="h-52 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            {loadingImage ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            ) : (
              <img
                src={
                  startup.imageUrl ||
                  "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={startup.companyName}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-gray-900">
                {startup.companyName}
              </h1>
              <p className="flex items-center text-gray-600 text-sm">
                <CiLocationOn className="mr-1" />
                {startup.locationName}
              </p>
              <a
                href={startup.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 text-sm hover:underline"
              >
                <CiGlobe className="mr-1 text-gray-700" />
                {startup.website}
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => toggleLike(user.id, startup.id, null)}
                className={`text-2xl transition cursor-pointer ${likedStartups.includes(startup.id)
                  ? "text-red-500"
                  : "text-gray-400 hover:text-red-400"
                  }`}
              >
                <FaHeart />
              </button>
              <span className="text-sm text-gray-700">
                {startupLikeCounts[startup.id] || 0}
              </span>
              <button
                onClick={toggleBookmark}
                className={`text-2xl transition cursor-pointer ${isCurrentItemBookmarked
                  ? "text-blue-500"
                  : "text-gray-400 hover:text-blue-400"
                  }`}
              >
                <FaBookmark />
              </button>
            </div>

            <div className="pt-4 space-y-4 text-sm text-gray-800">
              <div>
                <p className="font-semibold">{startup.foundedDate}</p>
                <p className="text-gray-500">Established</p>
              </div>

              <div>
                <p className="font-medium">About:</p>
                <p className="text-gray-600">{startup.companyDescription}</p>
              </div>

              <div>
                <p className="font-medium">Industry:</p>
                <p className="text-gray-600">{startup.industry}</p>
              </div>

              <div>
                <p className="font-medium">Contact Info:</p>
                <p className="text-gray-600">{startup.contactEmail}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Funds Raised:</p>
                  <p className="text-gray-600">None</p>
                </div>
                <div>
                  <p className="font-medium">Funding Rounds:</p>
                  <p className="text-gray-600">0</p>
                </div>
                <div>
                  <p className="font-medium">Investors:</p>
                  <p className="text-gray-600">0</p>
                </div>
                <div>
                  <p className="font-medium">Team Size:</p>
                  <p className="text-gray-600">{startup.numberOfEmployees}</p>
                </div>
              </div>
            </div>
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

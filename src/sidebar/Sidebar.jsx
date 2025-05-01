import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Login from "../modals/Login";
import Signup from "../modals/Signup";
import { CiLocationOn } from "react-icons/ci";
import { CiGlobe } from "react-icons/ci";
import { FaRegBookmark } from "react-icons/fa";
import { MdKeyboardReturn } from "react-icons/md";
import Bookmarks from "./Bookmarks"; // Import the Bookmarks component
import { FaHeart } from "react-icons/fa";
import { RiLoginBoxFill } from "react-icons/ri";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaRegEye } from "react-icons/fa";

export default function Sidebar({ mapInstanceRef }) {
  const navigate = useNavigate()
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSearchContainer, setShowSearchContainer] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
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

  // Fetch user on mount
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
        } else {
          console.error("Failed to fetch current user");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
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
        setLikedStartups([]); // Clear likes
        setLikedInvestors([]); // Clear likes
        localStorage.removeItem("likedStartups");
        localStorage.removeItem("likedInvestors");
        localStorage.removeItem("user");
        document.cookie =
          "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
      const response = await fetch("http://localhost:8080/startups", {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error("Network response was not ok: ", data);
      }

      setStartups(data);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
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
    const storedBookmarkedStartups = JSON.parse(localStorage.getItem("bookmarkedStartups")) || [];
    const storedBookmarkedInvestors = JSON.parse(localStorage.getItem("bookmarkedInvestors")) || [];
    setBookmarkedStartups(storedBookmarkedStartups);
    setBookmarkedInvestors(storedBookmarkedInvestors);
  }, []);



  // Function to remove an item from bookmarks
  const removeFromBookmarks = (item, type) => {
    const key = type === "startups" ? "bookmarkedStartups" : "bookmarkedInvestors";
    const updatedBookmarks = JSON.parse(localStorage.getItem(key)).filter((b) => b.id !== item.id);
    localStorage.setItem(key, JSON.stringify(updatedBookmarks));
    // Update state to reflect changes in UI
    if (type === "startups") {
      setBookmarkedStartups(updatedBookmarks);
    } else {
      setBookmarkedInvestors(updatedBookmarks);
    }
  };

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

  const handleStartupClick = (startup) => {
    fetch(`http://localhost:8080/startups/${startup.id}/increment-views`, {
      method: 'PUT',
      credentials: 'include', // Include credentials to support session cookies
    })
      .then((response) => {
        if (response.ok) {
          console.log('Views incremented successfully');

          // After incrementing views, fetch the updated view count
          fetch(`http://localhost:8080/startups/${startup.id}/views`, {
            method: 'GET',
            credentials: 'include', // Include credentials to support session cookies
          })
            .then((response) => response.json())
            .then((views) => {
              console.log('Updated views count:', views);

              // Optionally, update the UI with the new view count
              setStartup((prevStartup) => ({
                ...prevStartup,
                viewsCount: views, // Assuming views is the response object
              }));
            })
            .catch((error) => {
              console.error('Error fetching updated view count:', error);
            });
        } else {
          console.error('Failed to increment views');
        }
      })
      .catch((error) => {
        console.error('Error incrementing views:', error);
      });

    // Zoom into the startup's location on the map if valid location data exists
    if (startup.locationLng && startup.locationLat) {
      mapInstanceRef.current.flyTo({
        center: [
          parseFloat(startup.locationLng),
          parseFloat(startup.locationLat),
        ],
        zoom: 14,
        essential: true,
      });
    }

    // Add the startup to recents and update the UI
    addToRecents(startup, 'startups'); // Add to recents
    setStartup(startup); // Set the startup object
    setShowSearchContainer(false); // Close the search container
  };

  const handleInvestorClick = (investor) => {
    if (!investor || !investor.id) {
      console.error("Invalid investor object:", investor);
      return;
    }

    // Increment views on the backend by sending a PUT request
    fetch(`http://localhost:8080/investors/${investor.id}/increment-views`, {
      method: 'PUT',
      credentials: 'include', // Include credentials to support session cookies
    })
      .then((response) => {
        if (response.ok) {
          console.log('Views incremented successfully');

          // After incrementing views, fetch the updated view count
          fetch(`http://localhost:8080/investors/${investor.id}/views`, {
            method: 'GET',
            credentials: 'include', // Include credentials to support session cookies
          })
            .then((response) => response.json())
            .then((views) => {
              console.log('Updated views count:', views);
              // Optionally, update the UI with the new view count
              setInvestor((prevInvestor) => ({
                ...prevInvestor,
                views: views, // Assuming views is the response object
              }));
            })
            .catch((error) => {
              console.error('Error fetching updated view count:', error);
            });
        } else {
          console.error('Failed to increment views');
        }
      })
      .catch((error) => {
        console.error('Error incrementing views:', error);
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

  const toggleBookmark = async () => {
    if (!user) {
      alert("Please log in to bookmark.");
      return;
    }

    const payload = {
      startupId: startup ? startup.id : null,
      investorId: investor ? investor.id : null
    };

    try {
      const response = await fetch("http://localhost:8080/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Bookmark added successfully!");
      } else {
        const result = await response.json();
        alert(`Failed to add bookmark: ${result.message}`);
      }
    } catch (error) {
      console.error("Error adding bookmark:", error);
      alert("An error occurred.");
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
            startupCounts[like.startupId] = (startupCounts[like.startupId] || 0) + 1;
          }
          if (like.investorId !== null) {
            investorCounts[like.investorId] = (investorCounts[like.investorId] || 0) + 1;
          }
        });

        setStartupLikeCounts(startupCounts);
        setInvestorLikeCounts(investorCounts);
      })
      .catch((err) => console.error("Failed to fetch likes:", err));
  }, []);


  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      {viewingStartup && (
        <div className="absolute w-fit top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-lg px-4 py-2 z-50 flex items-center space-x-2">
          <button
            className="text-blue-500 hover:underline flex items-center"
            onClick={() => {
              setViewingStartup(null);
              setStartup(viewingStartup);
            }}
          >
            <MdKeyboardReturn className="mr-1 cursor-pointer text-xl" />
          </button>
          <span className="text-black text-sm flex items-center">
            Viewing{" "}
            <p className="font-semibold ml-2"> {viewingStartup.companyName}</p>
          </span>
        </div>
      )}
      {viewingInvestor && (
        <div className="absolute w-fit top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-lg px-4 py-2 z-50 flex items-center space-x-2">
          <button
            className="text-blue-500 hover:underline flex items-center"
            onClick={() => {
              setViewingInvestor(null);
              setInvestor(viewingInvestor);
            }}
          >
            <MdKeyboardReturn className="mr-1 cursor-pointer text-xl" />
          </button>
          <span className="text-black text-sm flex items-center">
            Viewing{" "}
            <p className="font-semibold ml-2">
              {viewingInvestor.firstname} {viewingInvestor.lastname}
            </p>
          </span>
        </div>
      )}
      {/* Sidebar */}
      <div className="flex h-screen w-20 flex-col justify-between border-e border-gray-100 bg-white/90 z-10">
        <div>
          <div className="border-t border-gray-100">
            <div className="px-2">
              <ul className="space-y-2 border-t border-gray-100 pt-6">
                {/* Search Icon */}
                <li>
                  <button
                    className="group relative flex flex-col items-center justify-center rounded-md p-3 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                    onClick={() => {
                      fetchStartups();
                      fetchInvestors();
                      fetchUserLikes();
                      setContainerMode("search");
                      setShowSearchContainer((prev) => !prev);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-7 opacity-80"
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
                    <span className="absolute left-full ml-3 whitespace-nowrap rounded bg-gray-900 px-2 py-1.5 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition">
                      Search
                    </span>
                  </button>
                </li>

                {/* Recents and Bookmarks Icons (Only if Authenticated) */}
                {isAuthenticated && (
                  <>
                    {/* Recents Icon */}
                    <li>
                      <button
                        className="group relative flex flex-col items-center justify-center rounded-md p-3 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                        onClick={() => {
                          setContainerMode("recents");
                          setShowSearchContainer(false); // Close the search container
                          setStartup(null)
                          setInvestor(null)
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-7 opacity-80"
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
                        <span className="absolute left-full ml-3 whitespace-nowrap rounded bg-gray-900 px-2 py-1.5 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition">
                          Recents
                        </span>
                      </button>
                    </li>
                    ; {/* Bookmarks Icon */}
                    <li>
                      <button
                        className="group relative flex flex-col items-center justify-center rounded-md p-3 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                        onClick={() => {
                          setContainerMode("bookmarks");
                          setShowSearchContainer(false); // Close the search container
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-7 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18l7-5 7 5V3H5z" />
                        </svg>
                        <span className="absolute left-full ml-3 whitespace-nowrap rounded bg-gray-900 px-2 py-1.5 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition">Bookmarks</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => navigate("/dashboard")}
                        className="group relative flex flex-col items-center justify-center rounded-md p-3 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition">
                        <span className="absolute left-full ml-3 whitespace-nowrap rounded bg-gray-900 px-2 py-1.5 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition">
                          Dashboard
                        </span>
                        <LuLayoutDashboard className="text-2xl" />
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {isAuthenticated ? (
          <div className="sticky inset-x-0 bottom-0 border-t border-gray-100 bg-white p-2">
            <button
              className="group relative flex w-full justify-center rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              onClick={logout}
            >
              Logout
              <span className="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded-sm bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible">
                Logout
              </span>
            </button>
          </div>
        ) : (
          <div className="sticky inset-x-0 bottom-0 border-t border-gray-100 bg-white p-2">
            <button
              className="group relative flex w-full justify-center rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              onClick={() => setOpenLogin(true)}
            >
              <RiLoginBoxFill className="text-3xl mb-4 mr-2 ml-2 text-blue-600" />
              <span className="invisible absolute start-full top-1/3 ms-4 -translate-y-1/2 rounded-sm bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible">
                Login
              </span>

            </button>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="absolute top-4 right-4 z-50">
        <div className="relative">
          <div
            className="avatar avatar-placeholder cursor-pointer"
            onClick={() => setShowTooltip((prev) => !prev)}
          >
            <div className="bg-neutral text-neutral-content w-12 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold">
                {isAuthenticated === null
                  ? "?"
                  : isAuthenticated && currentUser
                    ? `${currentUser.firstname?.[0] ?? ""}${currentUser.lastname?.[0] ?? ""}`.toUpperCase()
                    : "G"}
              </span>
            </div>

          </div>

          {showTooltip && (
            <div className="absolute top-14 right-0 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 border-b">
                    <div className="text-sm font-semibold text-gray-800">
                      {currentUser?.firstname} {currentUser?.lastname}
                    </div>
                    <div className="text-xs text-gray-500">
                      {currentUser?.email}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowTooltip(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
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
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setShowTooltip(false);
                      setOpenRegister(true);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>


      {containerMode === "recents" && (
        <div className="absolute left-19 top-0 h-screen w-90 bg-gray-100 shadow-lg z-5 search-container-animate">
          <div className="p-4 bg-gradient-to-b from-blue-500 to-white relative">
            <h2 className="text-lg text-black font-semibold">Recents</h2>
            <div className="join join-vertical lg:join-horizontal w-full mt-4">
              <button
                onClick={() => setViewingType("startups")}
                className="btn bg-white text-black join-item w-[50%] hover:bg-gray-200"
              >
                Startup
              </button>
              <button
                onClick={() => setViewingType("investors")}
                className="btn join-item w-[50%] bg-white text-black hover:bg-gray-200"
              >
                Investor
              </button>
            </div>
          </div>
          <div>
            {viewingType === "startups" ? (
              recentStartups.length > 0 ? (
                recentStartups.map((startup) => (
                  <div
                    key={startup.id}
                    onClick={() => handleStartupClick(startup)}
                    className="w-full max-w-sm px-4 py-3 bg-gray-300 shadow-md cursor-pointer hover:bg-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-800">
                        {startup.locationName}
                      </span>
                      <span className="px-3 py-1 text-xs text-blue-800 uppercase bg-blue-200 rounded-full dark:bg-blue-300 dark:text-blue-900">
                        {startup.industry}
                      </span>
                    </div>
                    <div>
                      <h1 className="mt-2 text-lg font-semibold text-gray-800">
                        {startup.companyName}
                      </h1>
                      <p className="mt-2 text-sm text-gray-600">
                        {startup.companyDescription}
                      </p>
                    </div>
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
                  className="w-full max-w-sm px-4 py-3 bg-gray-300 shadow-md cursor-pointer hover:bg-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-800">
                      {investor.locationName}
                    </span>
                    <span className="px-3 py-1 text-xs text-blue-800 uppercase bg-blue-200 rounded-full dark:bg-blue-300 dark:text-blue-900">
                      {investor.gender}
                    </span>
                  </div>
                  <div>
                    <h1 className="mt-2 text-lg font-semibold text-gray-800">
                      {investor.firstname} {investor.lastname}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                      {investor.biography}
                    </p>
                  </div>
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
      {showSearchContainer && (
        <div className="absolute left-19 top-0 h-screen w-90 bg-gray-100 shadow-lg z-5 search-container-animate">
          <div className="p-4 bg-gradient-to-b from-blue-500 to-white relative">
            <button
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
              onClick={() => setShowSearchContainer(false)}
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

            <h2 className="text-lg text-black font-semibold">Search</h2>

            <form
              className="flex items-center max-w-sm mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <label htmlFor="simple-search" className="sr-only">
                Search
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
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
                  id="simple-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-200 border border-gray-300 text-blue-900 text-sm rounded-lg focus:ring-blue-700 focus:border-blue-700 block w-full ps-10 p-2.5"
                  placeholder={`Search ${viewingType}`}
                  required
                />
              </div>
              <button
                type="submit"
                className="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
            </form>
            <div className="join join-vertical lg:join-horizontal w-full mt-4">
              <button
                onClick={() => setViewingType("startups")}
                className="btn bg-white text-black join-item w-[50%] hover:bg-gray-200"
              >
                Startup
              </button>
              <button
                onClick={() => setViewingType("investors")}
                className="btn join-item w-[50%] bg-white text-black hover:bg-gray-200"
              >
                Investor
              </button>
            </div>
          </div>
          <div>
            {loading ? (
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            ) : viewingType === "startups" ? (
              startups.length > 0 ? (
                startups.map((startup) => (
                  <div
                    key={startup.id}
                    onClick={() => handleStartupClick(startup)}
                    className="w-full max-w-sm px-4 py-3 bg-gray-300 shadow-md cursor-pointer hover:bg-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-light text-gray-800">
                        {startup.locationName}
                      </span>
                      <span className="px-3 py-1 text-xs text-blue-800 uppercase bg-blue-200 rounded-full dark:bg-blue-300 dark:text-blue-900">
                        {startup.industry}
                      </span>
                    </div>

                    <div>
                      <h1 className="mt-2 text-lg font-semibold text-gray-800">
                        {startup.companyName}
                      </h1>
                      <p className="mt-2 text-sm text-gray-600">
                        {startup.companyDescription}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 mt-4">
                  No startups match your search.
                </div>
              )
            ) : investors.length > 0 ? (
              investors.map((investor) => (
                <div
                  key={investor.investorId}
                  onClick={() => handleInvestorClick(investor)}
                  className="w-full max-w-sm px-4 py-3 bg-gray-300 shadow-md cursor-pointer hover:bg-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-800">
                      {investor.locationName}
                    </span>
                    <span className="px-3 py-1 text-xs text-blue-800 uppercase bg-blue-200 rounded-full dark:bg-blue-300 dark:text-blue-900">
                      {investor.gender}
                    </span>
                  </div>

                  <div>
                    <h1 className="mt-2 text-lg font-semibold text-gray-800">
                      {investor.firstname} {investor.lastname}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                      {investor.biography}
                    </p>
                  </div>
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

      {containerMode === "bookmarks" && (
        <Bookmarks
          userId={user}
          mapInstanceRef={mapInstanceRef}
          setViewingStartup={setViewingStartup}
          setViewingInvestor={setViewingInvestor}
          removeFromBookmarks={removeFromBookmarks}
          setContainerMode={setContainerMode}
        />

      )}

      {investor && !viewingStartup && (
        <div className="absolute left-16 top-0 h-screen w-90 bg-gray-100 shadow-lg z-20">
          <div className="absolute left-0 flex justify-end p-2">
            <MdKeyboardReturn
              className="text-black text-2xl cursor-pointer"
              onClick={() => {
                setInvestor(null);
                setShowSearchContainer(true);
              }}
            />
          </div>

          <div className="image bg-gray-400 h-[13rem]"></div>

          <div className="flex justify-between p-4 gap-4">
            {/* Text content area */}
            <div className="flex-1 min-w-0">
              <h1 className="text-black font-semibold text-lg truncate">
                {investor.firstname} {investor.lastname}
              </h1>
              <p className="text-black flex items-center space-x-1 truncate">
                <CiLocationOn />
                <span>{investor.locationName}</span>
              </p>
              <p className="text-blue-700 flex items-center space-x-1 break-words">
                <CiGlobe className="text-black" />
                <span className="break-words">{investor.website}</span>
              </p>
            </div>

            {/* Like button area */}
            <div className="flex flex-col items-center w-16 shrink-0">
              <button
                onClick={() => toggleLike(user.id, null, investor.id)}
                className={`cursor-pointer text-2xl ${likedInvestors.includes(investor.id) ? "text-red-500" : "text-gray-500"}`}
              >
                <FaHeart />
              </button>
              <p className="text-sm text-black text-center">
                {investorLikeCounts[investor.id] || 0}
              </p>
            </div>
          </div>

          {/* View count area */}
          <div className="flex justify-between p-4 gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-black text-1xl font-semibold flex items-center">
                <FaRegEye className="mr-1 text-2xl  text-gray-700" />
                {investor.views || 0}
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleBookmark(user.id, null, investor.id)}
            className="text-black flex items-center justify-center hover:underline cursor-pointer"
          >
            <FaRegBookmark className="mr-1" />
            {bookmarkedInvestors.includes(investor.id) ? "Bookmarked" : "Add bookmark"}
          </button>



          <div className="p-4">
            <button
              className="btn btn-outline btn-warning text-black mr-2"
              onClick={() => {
                if (investor && investor.locationLang && investor.locationLat) {
                  mapInstanceRef.current.flyTo({
                    center: [
                      parseFloat(investor.locationLang),
                      parseFloat(investor.locationLat),
                    ],
                    zoom: 14,
                    essential: true,
                  });
                  setViewingInvestor(investor); // Enter viewing mode
                  setInvestor(null);
                }
              }}
            >
              Preview
            </button>
            <button className="btn btn-warning">Update location</button>
          </div>
        </div>
      )}

      {startup && !viewingStartup && (
        <div className="absolute left-16 top-0 h-screen overflow-y-auto w-90 bg-gray-100 shadow-lg z-20">
          <div className="absolute left-0 flex justify-end p-2">
            <MdKeyboardReturn
              className="text-black text-2xl cursor-pointer"
              onClick={() => {
                setStartup(null);
                setShowSearchContainer(true);
              }}
            />
          </div>

          <div className="image bg-gray-400 h-[13rem]"></div>

          <div className="flex justify-between p-4">
            <div>
              <h1 className="text-black">{startup.companyName}</h1>
              <p className="text-black flex items-center">
                <CiLocationOn />
                {startup.locationName}
              </p>
              <p className="text-blue-700 flex items-center">
                <CiGlobe className="text-black" />
                {startup.website}
              </p>
            </div>

            {/* Like button area */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={() => toggleLike(user.id, startup.id, null)}
                className={`cursor-pointer text-2xl ${likedStartups.includes(startup.id) ? "text-red-500" : "text-gray-500"
                  }`}
              >
                <FaHeart />
              </button>
              <p className="text-sm text-black">{startupLikeCounts[startup.id] || 0}</p>
            </div>
          </div>
          {/* View count area */}
          <div className="flex justify-between p-4 gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-black text-1xl font-semibold flex items-center">
                <FaRegEye className="mr-1 text-2xl text-gray-700" />
                {startup.viewsCount || 0} {/* Displaying views count here */}
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleBookmark(user.id, startup.id, null)}
            className="text-black flex items-center justify-center hover:underline cursor-pointer"
          >
            <FaRegBookmark className="mr-1" />
            {bookmarkedStartups.includes(startup.id) ? "Bookmarked" : "Add bookmark"}
          </button>



          <div className="p-4">
            <button
              className="btn btn-outline btn-warning text-black mr-2"
              onClick={() => {
                if (startup && startup.locationLng && startup.locationLat) {
                  mapInstanceRef.current.flyTo({
                    center: [startup.locationLng, startup.locationLat],
                    zoom: 14,
                    essential: true,
                  });
                  setViewingStartup(startup);
                  setStartup(null);
                }
              }}
            >
              Preview
            </button>
            <button className="btn btn-warning">Update location</button>
          </div>
          <div className="p-4">
            <h1 className="text-black font-semibold">{startup.foundedDate}</h1>
            <p className="text-gray-400 font-semibold">Established</p>
            <p className="text-black">{startup.companyDescription}</p>
            <p className="text-black">Categories: </p>
            <p className="text-black">{startup.industry}</p>
            <p className="text-black">ContactInfo: </p>
            <p className="text-black">{startup.contactEmail}</p>
            <p className="text-black">Funds Raised: None</p>
            <p className="text-black">Funding Rounds: 0</p>
            <p className="text-black">Total Investors: 0</p>
            <p className="text-black">Team size: {startup.numberOfEmployees}</p>
          </div>
        </div>
      )}

      <div className={`flex-1`}>
        <Outlet />
      </div>

      {openLogin && (
        <Login
          closeModal={() => setOpenLogin(false)}
          openRegister={() => {
            setOpenLogin(false);
            setOpenRegister(true);
          }}
          onLoginSuccess={async () => {
            setIsAuthenticated(true);
            setOpenLogin(false);

            try {
              const response = await fetch("http://localhost:8080/users/me", {
                method: "GET",
                credentials: "include",
              });

              if (response.ok) {
                const userDetails = await response.json();
                setUser(userDetails);
                localStorage.setItem("user", JSON.stringify(userDetails));

                // Fetch user likes
                await fetchUserLikes();
              }
            } catch (error) {
              console.error("Error during login:", error);
            }
          }}
        />
      )}

      {openRegister && <Signup closeModal={() => setOpenRegister(false)} />}
    </div>
  );
}

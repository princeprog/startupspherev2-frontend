import React, { useState, useEffect } from 'react';
import { CiLocationOn, CiGlobe } from 'react-icons/ci';
import { FaBookmark } from 'react-icons/fa';

const Bookmarks = ({
  userId,
  mapInstanceRef,
  setViewingStartup,
  setViewingInvestor,
  setContainerMode
}) => {
  const [startups, setStartups] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("startups");

  const removeFromBookmarks = async (item, type) => {
    try {
      console.log("Removing bookmark:", item);
      const bookmarkId = item.id;
      console.log("Using bookmarkId:", bookmarkId);
      
      const response = await fetch(`http://localhost:8080/api/bookmarks/${bookmarkId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log(`${type} bookmark removed successfully!`);

        if (type === 'startups') {
          setStartups((prevStartups) =>
            prevStartups.filter((startup) => startup.id !== item.id)
          );
        } else if (type === 'investors') {
          setInvestors((prevInvestors) =>
            prevInvestors.filter((investor) => investor.id !== item.id)
          );
        }
      } else {
        console.error('Failed to remove bookmark:', await response.text());
      }
    } catch (error) {
      console.error('Error in removing bookmark:', error);
    }
  };

  const fetchBookmarks = async () => {
    console.log("Fetching bookmarks for user:", userId);
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/bookmarks', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }

      const data = await response.json();
      console.log("Bookmarks fetched:", data);

      const bookmarkedStartups = data
        .filter(item => item.startup !== null)
        .map(item => ({
          ...item.startup,
          id: item.id // Use the bookmark's ID
        }));

      const bookmarkedInvestors = data
        .filter(item => item.investor !== null)
        .map(item => ({
          ...item.investor,
          id: item.id // Use the bookmark's ID
        }));

      setStartups(bookmarkedStartups);
      setInvestors(bookmarkedInvestors);
    } catch (error) {
      console.error("Fetch bookmarks error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchBookmarks();
    }
  }, [userId]);

  const handleRemoveBookmark = (item, type) => {
    removeFromBookmarks(item, type);
  };

  const handlePreviewStartup = (startup) => {
    if (startup.locationLng && startup.locationLat) {
      mapInstanceRef.current.flyTo({
        center: [startup.locationLng, startup.locationLat],
        zoom: 14,
        essential: true,
      });
      setViewingStartup(startup);
      setContainerMode(null); // Close the bookmarks panel
    }
  };

  const handlePreviewInvestor = (investor) => {
    if (investor.locationLang && investor.locationLat) {
      mapInstanceRef.current.flyTo({
        center: [parseFloat(investor.locationLang), parseFloat(investor.locationLat)],
        zoom: 14,
        essential: true,
      });
      setViewingInvestor(investor);
      setContainerMode(null); // Close the bookmarks panel
    }
  };

  return (
    <div className="absolute left-20 top-0 h-screen w-96 bg-white shadow-lg z-5 transform transition-all duration-300 ease-in-out animate-slide-in">
      <div className="p-4 bg-gradient-to-b from-blue-600 to-blue-500 relative">
        <button
          className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
          onClick={() => {
            const container = document.querySelector('.animate-slide-in');
            if (container) {
              container.classList.add('animate-slide-out');
              setTimeout(() => {
                setContainerMode(null);
              }, 300); // Match the duration of the animation
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

        <h2 className="text-lg text-white font-semibold mb-4">My Bookmarks</h2>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("startups")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "startups"
                ? "bg-white text-blue-600"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Startups
          </button>
          <button
            onClick={() => setActiveTab("investors")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "investors"
                ? "bg-white text-blue-600"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Investors
          </button>
        </div>
      </div>

      <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === "startups" ? (
          startups.length > 0 ? (
            startups.map((startup) => (
              <div key={startup.id} className="mb-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <h1 className="text-lg font-semibold text-gray-900">{startup.companyName}</h1>
                    <p className="text-gray-600 flex items-center text-sm">
                      <CiLocationOn className="mr-1" />
                      {startup.locationName || "No location specified"}
                    </p>
                    {startup.website && (
                      <p className="text-blue-600 flex items-center text-sm hover:underline">
                        <CiGlobe className="mr-1 text-gray-700" />
                        {startup.website}
                      </p>
                    )}
                    <span className="inline-block px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
                      {startup.industry}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => handlePreviewStartup(startup)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => handleRemoveBookmark(startup, "startups")}
                    className="flex items-center text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
                  >
                    <FaBookmark className="mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FaBookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900">No bookmarked startups</p>
              <p className="text-sm text-gray-500 mt-1">Startups you bookmark will appear here</p>
            </div>
          )
        ) : investors.length > 0 ? (
          investors.map((investor) => (
            <div key={investor.id} className="mb-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <h1 className="text-lg font-semibold text-gray-900">
                    {investor.firstname} {investor.lastname}
                  </h1>
                  <p className="text-gray-600 flex items-center text-sm">
                    <CiLocationOn className="mr-1" />
                    {investor.locationName || "No location specified"}
                  </p>
                  {investor.website && (
                    <p className="text-blue-600 flex items-center text-sm hover:underline">
                      <CiGlobe className="mr-1 text-gray-700" />
                      {investor.website}
                    </p>
                  )}
                  {investor.gender && (
                    <span className="inline-block px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
                      {investor.gender}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => handlePreviewInvestor(investor)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Preview
                </button>
                <button
                  onClick={() => handleRemoveBookmark(investor, "investors")}
                  className="flex items-center text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
                >
                  <FaBookmark className="mr-1" />
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FaBookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900">No bookmarked investors</p>
            <p className="text-sm text-gray-500 mt-1">Investors you bookmark will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
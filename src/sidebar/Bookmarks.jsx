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
  const [activeTab, setActiveTab] = useState("startups"); // Default to startups tab

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
    <div className="absolute left-19 top-0 h-screen w-90 bg-gray-100 shadow-lg z-5 search-container-animate">
      <div className="p-4 bg-gradient-to-b from-blue-500 to-white relative">
        <button
          className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
          onClick={() => setContainerMode(null)}
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

        <h2 className="text-lg text-black font-semibold">My Bookmarks</h2>

        <div className="join join-vertical lg:join-horizontal w-full mt-4">
          <button
            onClick={() => setActiveTab("startups")}
            className={`btn ${activeTab === "startups" ? "bg-blue-700 text-white" : "bg-white text-black"} join-item w-[50%] hover:bg-gray-200`}
          >
            Startups
          </button>
          <button
            onClick={() => setActiveTab("investors")}
            className={`btn ${activeTab === "investors" ? "bg-blue-700 text-white" : "bg-white text-black"} join-item w-[50%] hover:bg-gray-200`}
          >
            Investors
          </button>
        </div>
      </div>

      <div className="p-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading...
          </div>
        ) : activeTab === "startups" ? (
          startups.length > 0 ? (
            startups.map((startup) => (
              <div key={startup.id} className="mb-4 bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between">
                  <div>
                    <h1 className="text-lg font-semibold text-black">{startup.companyName}</h1>
                    <p className="text-gray-600 flex items-center">
                      <CiLocationOn className="mr-1" />
                      {startup.locationName || "No location specified"}
                    </p>
                    {startup.website && (
                      <p className="text-blue-700 flex items-center">
                        <CiGlobe className="mr-1 text-black" />
                        {startup.website}
                      </p>
                    )}
                    <span className="inline-block px-2 py-1 mt-2 text-xs text-blue-800 bg-blue-200 rounded-full">
                      {startup.industry}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => handlePreviewStartup(startup)}
                    className="btn btn-sm btn-outline btn-primary"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => handleRemoveBookmark(startup, "startups")}
                    className="flex items-center text-red-500 hover:text-red-700"
                  >
                    <FaBookmark className="mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No bookmarked startups found
            </div>
          )
        ) : investors.length > 0 ? (
          investors.map((investor) => (
            <div key={investor.id} className="mb-4 bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between">
                <div>
                  <h1 className="text-lg font-semibold text-black">
                    {investor.firstname} {investor.lastname}
                  </h1>
                  <p className="text-gray-600 flex items-center">
                    <CiLocationOn className="mr-1" />
                    {investor.locationName || "No location specified"}
                  </p>
                  {investor.website && (
                    <p className="text-blue-700 flex items-center">
                      <CiGlobe className="mr-1 text-black" />
                      {investor.website}
                    </p>
                  )}
                  {investor.gender && (
                    <span className="inline-block px-2 py-1 mt-2 text-xs text-blue-800 bg-blue-200 rounded-full">
                      {investor.gender}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => handlePreviewInvestor(investor)}
                  className="btn btn-sm btn-outline btn-primary"
                >
                  Preview
                </button>
                <button
                  onClick={() => handleRemoveBookmark(investor, "investors")}
                  className="flex items-center text-red-500 hover:text-red-700"
                >
                  <FaBookmark className="mr-1" />
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No bookmarked investors found
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
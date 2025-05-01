import React, { useState, useEffect } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { CiLocationOn, CiGlobe } from "react-icons/ci";

const Bookmarks = ({
  startups,
  investors,
  mapInstanceRef,
  setViewingStartup,
  setViewingInvestor,
  removeFromBookmarks,
  addToBookmarks,
  setContainerMode,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState("startups");
  const [searchTerm, setSearchTerm] = useState("");
  const [localStartups, setLocalStartups] = useState(startups || []);
  const [localInvestors, setLocalInvestors] = useState(investors || []);

  // Update local state when props change
  useEffect(() => {
    setLocalStartups(startups || []);
    setLocalInvestors(investors || []);
  }, [startups, investors]);

  // Fetch bookmarks from API on initial load
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch(`http://localhost:8080/api/bookmarks/user/${userId}`, {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Process and set bookmarked startups
          if (data.startups && data.startups.length > 0) {
            setLocalStartups(data.startups);
            localStorage.setItem("bookmarkedStartups", JSON.stringify(data.startups));
          }
          
          // Process and set bookmarked investors
          if (data.investors && data.investors.length > 0) {
            setLocalInvestors(data.investors);
            localStorage.setItem("bookmarkedInvestors", JSON.stringify(data.investors));
          }
        }
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      }
    };
    
    fetchBookmarks();
  }, [userId]);

  const handlePreviewStartup = (startup) => {
    if (startup.locationLng && startup.locationLat) {
      mapInstanceRef.current.flyTo({
        center: [startup.locationLng, startup.locationLat],
        zoom: 14,
        essential: true,
      });
      setViewingStartup(startup);
      setContainerMode(null);
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
      setContainerMode(null);
    }
  };

  const handleRemoveBookmark = async (item, type) => {
    const bookmarkId = item.bookmarkId;
    if (!bookmarkId) {
      console.error("No bookmarkId found for item");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/bookmarks/${bookmarkId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        console.log("Bookmark removed successfully");
        
        // Update local state
        if (type === "startups") {
          setLocalStartups(prev => prev.filter(s => s.id !== item.id));
        } else {
          setLocalInvestors(prev => prev.filter(i => i.investorId !== item.investorId));
        }
        
        // Update parent component state through props
        removeFromBookmarks(item, type);
      } else {
        console.error("Failed to remove bookmark");
      }
    } catch (error) {
      console.error("Error during bookmark removal:", error);
    }
  };

  const handleAddBookmark = async (item, type) => {
    try {
      const bookmarkData = {
        startupId: type === "startups" ? item.id : null,
        investorId: type === "investors" ? item.investorId : null,
      };

      const response = await fetch(`http://localhost:8080/api/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bookmarkData),
      });

      if (response.ok) {
        const createdBookmark = await response.json();
        
        // Add bookmarkId to the item
        const itemWithBookmarkId = { ...item, bookmarkId: createdBookmark.id };
        
        // Update local state
        if (type === "startups") {
          setLocalStartups(prev => [...prev, itemWithBookmarkId]);
        } else {
          setLocalInvestors(prev => [...prev, itemWithBookmarkId]);
        }
        
        // Update parent component state through props
        addToBookmarks(itemWithBookmarkId, type);
        
        console.log("Bookmark added successfully");
      } else {
        console.error("Failed to add bookmark");
      }
    } catch (error) {
      console.error("Error adding bookmark:", error);
    }
  };

  const filteredStartups = localStartups.filter((startup) =>
    startup.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (startup.locationName && startup.locationName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (startup.website && startup.website.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredInvestors = localInvestors.filter((investor) =>
    `${investor.firstname || ''} ${investor.lastname || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (investor.locationName && investor.locationName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (investor.website && investor.website.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="absolute left-19 top-0 h-screen w-90 bg-gray-100 shadow-lg z-5 search-container-animate">
      <div className="p-4 bg-gradient-to-b from-blue-500 to-white relative">
        <button
          className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
          onClick={() => setContainerMode(null)}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-lg text-black font-semibold">My Bookmarks</h2>

        <div className="mt-4">
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div className="join join-vertical lg:join-horizontal w-full mt-4">
          <button
            onClick={() => setActiveTab("startups")}
            className={`btn ${activeTab === "startups" ? "bg-blue-700 text-white" : "bg-white text-black"} join-item w-[50%] hover:bg-gray-200`}
          >
            Startups ({filteredStartups.length})
          </button>
          <button
            onClick={() => setActiveTab("investors")}
            className={`btn ${activeTab === "investors" ? "bg-blue-700 text-white" : "bg-white text-black"} join-item w-[50%] hover:bg-gray-200`}
          >
            Investors ({filteredInvestors.length})
          </button>
        </div>
      </div>

      <div className="p-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
        {activeTab === "startups" ? (
          filteredStartups.length > 0 ? (
            filteredStartups.map((startup) => (
              <div key={startup.id || Math.random()} className="mb-4 bg-white rounded-lg shadow-md p-4">
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
        ) : filteredInvestors.length > 0 ? (
          filteredInvestors.map((investor) => (
            <div key={investor.investorId || Math.random()} className="mb-4 bg-white rounded-lg shadow-md p-4">
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
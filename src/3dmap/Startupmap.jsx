import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  X,
  MapPin,
  Loader2,
  Clock,
  Building,
  Map as MapIcon,
  User,
  Filter,
  Check,
} from "lucide-react";
import debounce from "lodash/debounce";
import Login from "../modals/Login";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "../App.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYWxwcmluY2VsbGF2YW4iLCJhIjoiY204djkydXNoMGZsdjJvc2RnN3B5NTdxZCJ9.wGaWS8KJXPBYUzpXh91Dww";

export default function Startupmap({
  mapInstanceRef,
  onMapClick,
  onLoginSuccess,
  onHighlightStakeholder,
}) {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderContainerRef = useRef(null);
  const [is3DActive, setIs3DActive] = useState(true);
  const [startupMarkers, setStartupMarkers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filteredStartups, setFilteredStartups] = useState([]);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [currentGeojsonBoundary, setCurrentGeojsonBoundary] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);
  const suggestionsRef = useRef(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchCategory, setSearchCategory] = useState("all"); // all, startup, stakeholder, place
  const [activeStakeholderId, setActiveStakeholderId] = useState(null);
  const [searchHistory, setSearchHistory] = useState(
    JSON.parse(localStorage.getItem("mapSearchHistory") || "[]")
  );
  const [stakeholderConnections, setStakeholderConnections] = useState([]);
  const [showConnections, setShowConnections] = useState(true);
  const [connectionLines, setConnectionLines] = useState([]);
  const [stakeholderMarkers, setStakeholderMarkers] = useState([]);
  const [filteredStakeholders, setFilteredStakeholders] = useState([]);

  // Modify loadStartupMarkers to remove industry filtering
  const loadStartupMarkers = async (map) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/approved`,
        {
          credentials: "include",
        }
      );
      const startups = await response.json();
      setStartupMarkers(startups);
      setFilteredStartups(startups);

      // Render all startup markers (no filtering)
      renderStartupMarkers(map, startups);

      return startups;
    } catch (error) {
      console.error("Failed to load startups:", error);
      return [];
    }
  };

  const renderStartupMarkers = (map, startups) => {
    // Clear existing markers if needed
    if (window.startupMarkersArray) {
      window.startupMarkersArray.forEach((marker) => marker.remove());
    }
    window.startupMarkersArray = [];

    startups.forEach((startup) => {
      if (
        typeof startup.locationLng === "number" &&
        typeof startup.locationLat === "number" &&
        startup.locationLat >= -90 &&
        startup.locationLat <= 90 &&
        startup.locationLng >= -180 &&
        startup.locationLng <= 180
      ) {
        // Create a DOM element for the marker
        const el = document.createElement("div");
        el.className = "marker-3d";
        el.style.width = "40px"; // Increased width
        el.style.height = "40px"; // Increased height
        el.style.backgroundImage = `url(/location.png)`; // Use relative URL
        el.style.backgroundSize = "cover";
        el.style.borderRadius = "50%";
        el.style.cursor = "pointer";

        // Add 3D marker effect using CSS transform
        el.style.transform = "translate(-50%, -50%)";
        el.style.willChange = "transform";

        // Create a popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="color: black; font-family: Arial, sans-serif;">
            <h3 style="margin: 0; color: black;">${startup.companyName}</h3>
            <p style="margin: 0; color: black;">${startup.locationName}</p>
          </div>`
        );

        // Add marker to the map
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: "bottom",
        })
          .setLngLat([startup.locationLng, startup.locationLat])
          .setPopup(popup)
          .addTo(map);

        window.startupMarkersArray = window.startupMarkersArray || [];
        window.startupMarkersArray.push(marker);
      } else {
        console.warn(
          `Invalid location for startup: ${startup.companyName}`,
          startup
        );
      }
    });
  };

  // Add this function near the top of your component
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#10B981"; // Green
      case "pending":
        return "#F59E0B"; // Amber
      case "declined":
        return "#EF4444"; // Red
      default:
        return "#6B7280"; // Gray for unknown status
    }
  };

  // Enhanced renderStakeholderMarkers function with better visibility
  const renderStakeholderMarkers = (map, items) => {
    console.log("Rendering stakeholder markers, count:", items?.length);
    
    // Clear existing stakeholder markers if needed
    if (window.stakeholderMarkersArray && Array.isArray(window.stakeholderMarkersArray)) {
      console.log("Removing existing stakeholder markers:", window.stakeholderMarkersArray.length);
      window.stakeholderMarkersArray.forEach((marker) => {
        if (marker && typeof marker.remove === 'function') {
          marker.remove();
        }
      });
    }
    window.stakeholderMarkersArray = [];

    // Keep track of stakeholders we've already rendered to avoid duplicates
    const renderedStakeholderIds = new Set();

    // Process each item - could be a connection object or a stakeholder directly
    items?.forEach((item) => {
      // Determine if we're dealing with a connection or direct stakeholder
      const stakeholder = item.stakeholder || item;
      const connection = item.stakeholder ? item : null;

      if (!stakeholder || !stakeholder.id) {  
        console.warn("Invalid stakeholder data:", item);
        return;
      }

      // Skip if already rendered or missing location data
      if (
        renderedStakeholderIds.has(stakeholder.id) ||
        !stakeholder.locationLat ||
        !stakeholder.locationLng
      ) {
        if (!stakeholder.locationLat || !stakeholder.locationLng) {
          console.log(`Skipping stakeholder ${stakeholder.id} (${stakeholder.name}) - missing location data`);
        }
        return;
      }

      renderedStakeholderIds.add(stakeholder.id);
      console.log(`Adding marker for stakeholder ${stakeholder.id} (${stakeholder.name})`);

      // Create a DOM element for the stakeholder marker
      const el = document.createElement("div");
      el.className = "stakeholder-marker";
      el.setAttribute("data-stakeholder-id", stakeholder.id); // Add data attribute for easy identification
      
      // Check if this stakeholder is active/selected
      const isActive = stakeholder.id === activeStakeholderId;
      console.log(`Stakeholder ${stakeholder.id} active status:`, isActive);
      
      // Enhanced size for professional look
      el.style.width = isActive ? "56px" : "44px";
      el.style.height = isActive ? "56px" : "44px";
      
      // Create a more elegant gradient background with subtle shine effect
      const gradientColor = isActive 
        ? "linear-gradient(135deg, #3B82F6, #1E40AF)" 
        : "linear-gradient(135deg, #4F46E5 10%, #3730A3 100%)";
      el.style.background = gradientColor;
      
      el.style.borderRadius = "50%";
      el.style.border = isActive 
        ? "3px solid rgba(251, 191, 36, 0.9)" 
        : "2px solid rgba(255, 255, 255, 0.9)";
      el.style.backdropFilter = "blur(5px)"; // Subtle glass effect
      el.style.cursor = "pointer";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.zIndex = isActive ? 99999 : 9999;
      el.style.willChange = "transform"; // Optimize performance
      el.style.pointerEvents = "all"; // Ensure marker captures pointer events
      el.style.position = "relative"; // Ensure proper stacking context
      
      // Add more professional user icon with initials if available
      const iconDiv = document.createElement("div");
      iconDiv.style.display = "flex";
      iconDiv.style.alignItems = "center";
      iconDiv.style.justifyContent = "center";
      iconDiv.style.width = "100%";
      iconDiv.style.height = "100%";
      iconDiv.style.position = "relative";
      
      // Inner circle for visual enhancement
      const innerCircle = document.createElement("div");
      innerCircle.style.position = "absolute";
      innerCircle.style.width = isActive ? "70%" : "75%";
      innerCircle.style.height = isActive ? "70%" : "75%";
      innerCircle.style.borderRadius = "50%";
      innerCircle.style.background = "rgba(255, 255, 255, 0.15)";
      iconDiv.appendChild(innerCircle);
      
      // Get initials from stakeholder name if available
      let initials = "";
      if (stakeholder.name) {
        const nameParts = stakeholder.name.split(" ");
        if (nameParts.length >= 2) {
          initials = `${nameParts[0].charAt(0)}${nameParts[nameParts.length-1].charAt(0)}`;
        } else if (nameParts.length === 1) {
          initials = nameParts[0].substring(0, 2);
        }
      }
      
      // If we have initials, show them, otherwise use icon
      const textElement = document.createElement("div");
      textElement.style.position = "relative";
      textElement.style.zIndex = "2";
      
      if (initials) {
        textElement.style.color = "white";
        textElement.style.fontFamily = "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif";
        textElement.style.fontSize = isActive ? "18px" : "15px";
        textElement.style.fontWeight = "600";
        textElement.style.letterSpacing = "0.5px";
        textElement.style.textShadow = "0 1px 2px rgba(0, 0, 0, 0.1)";
        textElement.textContent = initials.toUpperCase();
      } else {
        textElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${isActive ? '24' : '20'}" height="${isActive ? '24' : '20'}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>`;
      }
      iconDiv.appendChild(textElement);
      el.appendChild(iconDiv);

      // Refined subtle shadow for professional look
      el.style.boxShadow = isActive 
        ? "0 0 15px rgba(251, 191, 36, 0.6), 0 0 30px rgba(37, 99, 235, 0.5), 0 6px 12px rgba(0, 0, 0, 0.25)" 
        : "0 0 10px rgba(79, 70, 229, 0.5), 0 4px 8px rgba(0, 0, 0, 0.2)";
      
      // Apply translate transform with hardware acceleration
      el.style.transform = "translate(-50%, -50%) translateZ(0)";
      
      // Add refined animation keyframes for professional effects if they don't exist
      if (!document.getElementById('stakeholder-marker-keyframes')) {
        const style = document.createElement('style');
        style.id = 'stakeholder-marker-keyframes';
        style.innerHTML = `
          @keyframes subtle-pulse {
            0% { 
              box-shadow: 0 0 10px rgba(79, 70, 229, 0.5), 0 4px 8px rgba(0, 0, 0, 0.2);
              transform: translate(-50%, -50%) scale(1) translateZ(0);
            }
            50% { 
              box-shadow: 0 0 15px rgba(79, 70, 229, 0.6), 0 5px 10px rgba(0, 0, 0, 0.25);
              transform: translate(-50%, -50%) scale(1.03) translateZ(0);
            }
            100% { 
              box-shadow: 0 0 10px rgba(79, 70, 229, 0.5), 0 4px 8px rgba(0, 0, 0, 0.2);
              transform: translate(-50%, -50%) scale(1) translateZ(0);
            }
          }
          @keyframes highlight-pulse {
            0% { 
              box-shadow: 0 0 15px rgba(251, 191, 36, 0.6), 0 0 30px rgba(37, 99, 235, 0.5), 0 6px 12px rgba(0, 0, 0, 0.25);
              border-color: rgba(251, 191, 36, 0.85);
            }
            50% { 
              box-shadow: 0 0 20px rgba(251, 191, 36, 0.8), 0 0 35px rgba(37, 99, 235, 0.6), 0 8px 16px rgba(0, 0, 0, 0.3);
              border-color: rgba(251, 191, 36, 1);
            }
            100% { 
              box-shadow: 0 0 15px rgba(251, 191, 36, 0.6), 0 0 30px rgba(37, 99, 235, 0.5), 0 6px 12px rgba(0, 0, 0, 0.25);
              border-color: rgba(251, 191, 36, 0.85);
            }
          }
          @keyframes float {
            0% { transform: translate(-50%, -50%) translateY(0) translateZ(0); }
            50% { transform: translate(-50%, -50%) translateY(-3px) translateZ(0); }
            100% { transform: translate(-50%, -50%) translateY(0) translateZ(0); }
          }
          @keyframes popup-appear {
            0% { opacity: 0; transform: translateY(10px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          /* Fixed marker positioning */
          .mapboxgl-marker {
            z-index: 9999 !important; 
          }
          
          /* Apply fixed positioning to marker containers to prevent movement */
          .marker-container {
            position: relative !important;
            z-index: 9999 !important;
            transform: none !important;
          }
          
          .marker-container.active {
            z-index: 99999 !important;
          }
          
          /* Professional popup styling */
          .mapboxgl-popup.stakeholder-popup {
            z-index: 100000 !important;
          }
          
          .mapboxgl-popup.stakeholder-popup .mapboxgl-popup-content {
            animation: popup-appear 0.25s ease-out forwards;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.08);
            border-radius: 12px;
            border: 1px solid rgba(226, 232, 240, 0.9);
            overflow: hidden;
            padding: 0;
            max-width: 340px;
          }
          
          /* Improved popup tip styling */
          .mapboxgl-popup.stakeholder-popup .mapboxgl-popup-tip {
            border-top-color: #fff;
            border-bottom-color: #4338CA;
            filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07));
          }
          
          .mapboxgl-popup.stakeholder-popup.mapboxgl-popup-anchor-top .mapboxgl-popup-tip {
            border-bottom-color: #4338CA;
          }
          
          .mapboxgl-popup.stakeholder-popup.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
            border-top-color: #fff;
          }
          
          /* Professional close button */
          .mapboxgl-popup.stakeholder-popup .mapboxgl-popup-close-button {
            position: absolute;
            top: 8px;
            right: 8px;
            font-size: 18px;
            color: rgba(255, 255, 255, 0.8);
            padding: 3px 8px;
            background: rgba(0, 0, 0, 0.1);
            border: none;
            border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
            z-index: 999;
          }
          
          .mapboxgl-popup.stakeholder-popup .mapboxgl-popup-close-button:hover {
            color: #fff;
            background: rgba(0, 0, 0, 0.25);
            transform: scale(1.1);
          }
        `;
        document.head.appendChild(style);
      }
      
      // Add refined animations for professional look
      if (!isActive) {
        el.style.animation = "subtle-pulse 3s infinite ease-in-out";
      } else {
        // Add a combination of highlight and float for the active marker
        el.style.animation = "highlight-pulse 2s infinite ease-in-out, float 2s infinite alternate ease-in-out";
      }
      
      // Apply CSS to ensure marker stays above other elements
      el.style.position = "relative"; // Helps with stacking context

      // Create a popup with stakeholder information - enhanced professional design
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        className: 'stakeholder-popup',
        maxWidth: '340px',
        anchor: 'bottom'
      }).setHTML(`
      <div style="color: #1F2937; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif; width: 100%; padding: 0; overflow: hidden; border-radius: 12px;">
        <!-- Header with enhanced professional gradient background -->
        <div style="background: linear-gradient(135deg, #4F46E5, #3B82F6); padding: 20px; position: relative; border-bottom: 1px solid rgba(255,255,255,0.1); box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <!-- Floating badge for organization if available -->
          ${stakeholder.organization ? 
            `<div style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.15); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.2); border-radius: 30px; padding: 4px 12px; font-size: 12px; color: white; font-weight: 500; letter-spacing: 0.3px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
              ${stakeholder.organization}
            </div>` : ``
          }
          
          <!-- Stakeholder avatar with initials - enhanced professional design -->
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <div style="width: 48px; height: 48px; min-width: 48px; background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1)); border: 2px solid rgba(255,255,255,0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; color: white; font-size: 18px; margin-right: 16px; box-shadow: 0 3px 8px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.15);">
              ${stakeholder.name ? stakeholder.name.split(' ').map(part => part.charAt(0)).slice(0, 2).join('').toUpperCase() : '?'}
            </div>
            
            <!-- Name and title with enhanced typography -->
            <div>
              <h3 style="margin: 0; color: white; font-weight: 600; font-size: 18px; line-height: 1.3; letter-spacing: 0.2px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">${stakeholder.name || "Unknown Stakeholder"}</h3>
              ${
                connection
                  ? `<p style="margin: 4px 0 0; color: rgba(255, 255, 255, 0.9); font-weight: 500; font-size: 14px; display: flex; align-items: center;">
                      <span style="display: inline-block; width: 8px; height: 8px; background: rgba(255,255,255,0.6); border-radius: 50%; margin-right: 6px;"></span>
                      ${connection.role || "Stakeholder"}
                    </p>`
                  : `<p style="margin: 4px 0 0; color: rgba(255, 255, 255, 0.9); font-weight: 500; font-size: 14px; display: flex; align-items: center;">
                      <span style="display: inline-block; width: 8px; height: 8px; background: rgba(255,255,255,0.6); border-radius: 50%; margin-right: 6px;"></span>
                      Stakeholder
                    </p>`
              }
            </div>
          </div>
        </div>
        
        <!-- Content area with clean layout -->
        <div style="padding: 16px 20px; background: white;">
          <!-- Location with icon -->
          ${stakeholder.locationName ? 
            `<div style="display: flex; align-items: center; margin-bottom: 12px;">
              <div style="min-width: 22px; width: 22px; height: 22px; background: rgba(59, 130, 246, 0.08); border-radius: 50%; color: #3B82F6; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <p style="margin: 0; color: #4B5563; font-size: 14px; flex: 1; font-weight: 400;">${stakeholder.locationName}</p>
            </div>` : ""
          }
          
          <!-- Email with icon -->
          ${stakeholder.email ? 
            `<div style="display: flex; align-items: center; margin-bottom: 12px;">
              <div style="min-width: 22px; width: 22px; height: 22px; background: rgba(59, 130, 246, 0.08); border-radius: 50%; color: #3B82F6; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <p style="margin: 0; color: #4B5563; font-size: 14px; flex: 1; overflow: hidden; text-overflow: ellipsis;">
                <a href="mailto:${stakeholder.email}" style="color: #4F46E5; text-decoration: none; font-weight: 400;">${stakeholder.email}</a>
              </p>
            </div>` : ""
          }
          
          <!-- Phone with icon -->
          ${stakeholder.phoneNumber ? 
            `<div style="display: flex; align-items: center; margin-bottom: ${connection ? '12px' : '0px'};">
              <div style="min-width: 22px; width: 22px; height: 22px; background: rgba(59, 130, 246, 0.08); border-radius: 50%; color: #3B82F6; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <p style="margin: 0; color: #4B5563; font-size: 14px; flex: 1;">
                <a href="tel:${stakeholder.phoneNumber}" style="color: #4F46E5; text-decoration: none; font-weight: 400;">${stakeholder.phoneNumber}</a>
              </p>
            </div>` : ""
          }
          
          <!-- Connection details in a elegant card-like section -->
          ${connection ? 
            `<div style="margin-top: ${stakeholder.email || stakeholder.phoneNumber || stakeholder.locationName ? '16px' : '0'}; padding: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 13px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${connection.dateJoined ? '8px' : '0px'};">
                <span style="color: #64748B; font-weight: 500;">Status</span>
                <span style="color: ${getStatusColor(connection.status)}; font-weight: 600; background: ${getStatusColor(connection.status)}15; padding: 3px 10px; border-radius: 20px; font-size: 12px; letter-spacing: 0.2px;">
                  ${connection.status || "Unknown"}
                </span>
              </div>
              ${connection.dateJoined ? 
                `<div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #64748B; font-weight: 500;">Joined</span>
                  <span style="color: #334155; font-weight: 500; font-size: 12px;">${new Date(connection.dateJoined).toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'})}</span>
                </div>` : ""
              }
            </div>` : ""
          }
          
          <!-- Enhanced footer with professional action buttons -->
          <div style="margin-top: ${(connection || stakeholder.phoneNumber || stakeholder.email || stakeholder.locationName) ? '18px' : '12px'}; padding: 16px 0 12px; border-top: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <button onclick="window.open('${stakeholder.website || '#'}')" 
                style="background: #F1F5F9; color: #4B5563; border: none; border-radius: 6px; padding: 8px 12px; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s ease; margin-right: 8px; ${!stakeholder.website ? 'opacity: 0.5; pointer-events: none;' : ''}">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                Website
              </button>
            </div>
            <button onclick="map.flyTo({center: [${stakeholder.locationLng}, ${stakeholder.locationLat}], zoom: 16, essential: true})" 
              style="background: #4F46E5; color: white; border: none; border-radius: 6px; padding: 8px 14px; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2); transition: all 0.2s ease; background-image: linear-gradient(135deg, #4F46E5, #6366F1);">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
              </svg>
              Center on Map
            </button>
          </div>
        </div>
      </div>
    `);

      try {
        // Parse coordinates correctly - ensure we have numeric values
        let lng = stakeholder.locationLng;
        let lat = stakeholder.locationLat;
        
        // Convert to numbers if they're strings
        if (typeof lng === "string") lng = parseFloat(lng);
        if (typeof lat === "string") lat = parseFloat(lat);
        
        // Debug coordinates
        console.log(`Processing stakeholder ${stakeholder.id} coordinates:`, {
          originalLng: stakeholder.locationLng,
          originalLat: stakeholder.locationLat,
          parsedLng: lng,
          parsedLat: lat
        });

        if (
          isNaN(lng) ||
          isNaN(lat) ||
          lng < -180 ||
          lng > 180 ||
          lat < -90 ||
          lat > 90
        ) {
          console.warn(
            `Invalid coordinates for stakeholder ${stakeholder.id}:`,
            lng,
            lat
          );
          return;
        }

        console.log(`Adding marker at coordinates [${lng}, ${lat}] for stakeholder ${stakeholder.id}`);
        
        // Ensure the coordinates are in the correct order: [longitude, latitude]
        // MapboxGL requires this specific order
        const coordinates = [lng, lat];
        
        // Create a container for the marker to ensure proper z-index and positioning
        const markerContainer = document.createElement("div");
        markerContainer.className = "marker-container";
        markerContainer.classList.add(isActive ? "active" : "");
        markerContainer.style.zIndex = isActive ? "99999" : "9999";
        // Don't set position absolute - this is what's causing the movement to top-left
        markerContainer.style.pointerEvents = "all";
        markerContainer.style.willChange = "transform";
        markerContainer.style.cursor = "pointer";
        markerContainer.style.transition = "transform 0.2s ease-out, z-index 0.1s";
        markerContainer.appendChild(el);
        
        // Add hover effect to the container - fix the transform to not affect positioning
        markerContainer.addEventListener('mouseenter', () => {
          // Use scale on the inner element to avoid position shifts
          el.style.transform = 'translate(-50%, -50%) scale(1.05) translateZ(0)';
          markerContainer.style.zIndex = "99999";
        });
        
        markerContainer.addEventListener('mouseleave', () => {
          // Restore original transform
          el.style.transform = 'translate(-50%, -50%) translateZ(0)';
          markerContainer.style.zIndex = isActive ? "99999" : "9999";
        });

        // Add marker to the map with improved configuration
        const marker = new mapboxgl.Marker({
          element: markerContainer,
          anchor: "center",
          // Increase the priority of the marker and fix positioning
          pitchAlignment: 'map', // Keep marker flat against the map
          rotation: 0, // Keep marker oriented upright
          rotationAlignment: 'viewport', // Align marker to viewport for better visibility
          offset: [0, 0], // No offset to prevent position shifting
          draggable: false, // Not draggable for stability
        })
          .setLngLat(coordinates)
          .setPopup(popup)
          .addTo(map);
        
        // Store original lngLat to restore position if needed
        marker._originalLngLat = coordinates;
        
        // Fix position monitoring - restore if position is lost
        const checkAndRestorePosition = () => {
          const currentCoords = marker.getLngLat();
          // If position is invalid or changed unexpectedly, restore it
          if (!currentCoords || 
              (Math.abs(currentCoords.lng - coordinates[0]) > 0.0001) || 
              (Math.abs(currentCoords.lat - coordinates[1]) > 0.0001)) {
            console.log("Restoring marker position for stakeholder", stakeholder.id);
            marker.setLngLat(coordinates);
          }
        };
        
        // Monitor map events to ensure marker stays in position
        map.on('move', checkAndRestorePosition);
        map.on('zoom', checkAndRestorePosition);
        
        // If this is the active stakeholder, open the popup automatically for better visibility
        if (isActive) {
          marker.togglePopup(); // Show popup for active stakeholder
          
          // Ensure the popup is visible and properly positioned
          setTimeout(() => {
            const popupEl = document.querySelector('.stakeholder-popup');
            if (popupEl) {
              popupEl.style.zIndex = "100000";
            }
          }, 100);
        }

        // Add click event to the marker for highlighting
        markerContainer.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent event bubbling
          e.preventDefault(); // Prevent default behavior
          console.log(`Marker clicked for stakeholder ${stakeholder.id}`);
          
          // Ensure this marker appears on top of everything when clicked
          markerContainer.style.zIndex = "99999";
          markerContainer.classList.add("active");
          
          // Handle highlighting - first remove highlight from all markers
          setActiveStakeholderId(stakeholder.id);
          
          // If using Sidebar, also notify it about the highlighted stakeholder
          if (onHighlightStakeholder && typeof onHighlightStakeholder === 'function') {
            try {
              // This will call back to the Sidebar component if it's registered for notifications
              highlightStakeholder(stakeholder.id);
            } catch (error) {
              console.error("Error notifying highlight stakeholder:", error);
            }
          }
          
          // Center the map on the marker to ensure visibility - smoother animation
          map.flyTo({
            center: coordinates,
            zoom: Math.max(map.getZoom(), 14.5),
            essential: true,
            speed: 0.8, // Slightly slower for better UX
            curve: 1.2, // Smoother curve
            padding: {top: 100, bottom: 100, left: 100, right: 100} // Add padding to avoid popup being cut off
          });
          
          // Show popup immediately for better UX
          marker.togglePopup();
          
          // Apply enhanced styling to popup
          const popupElement = document.querySelector('.stakeholder-popup');
          if (popupElement) {
            popupElement.style.zIndex = "100000";
          }
          
          // Don't re-render all markers as this is causing the positioning issue
          // Instead, apply active styles directly to this marker
          el.style.width = "56px";
          el.style.height = "56px";
          el.style.border = "3px solid rgba(251, 191, 36, 0.9)";
          el.style.boxShadow = "0 0 15px rgba(251, 191, 36, 0.6), 0 0 30px rgba(37, 99, 235, 0.5), 0 6px 12px rgba(0, 0, 0, 0.25)";
          el.style.background = "linear-gradient(135deg, #3B82F6, #1E40AF)";
          el.style.animation = "highlight-pulse 2s infinite ease-in-out, float 2s infinite alternate ease-in-out";
          
          // Update text size if using initials
          const textElement = el.querySelector('div > div');
          if (textElement && initials) {
            textElement.style.fontSize = "18px";
          }
        });

        window.stakeholderMarkersArray = window.stakeholderMarkersArray || [];
        window.stakeholderMarkersArray.push(marker);
      } catch (error) {
        console.error(
          `Error adding marker for stakeholder ${stakeholder.id}:`,
          error
        );
      }
    });
    
    console.log("Finished rendering stakeholder markers, count:", window.stakeholderMarkersArray?.length);
  };

  const highlightStakeholder = useCallback((stakeholderId) => {
    console.log("Highlighting stakeholder:", stakeholderId);
    
    // Update the active stakeholder ID
    setActiveStakeholderId(stakeholderId);
    
    // Re-render markers to reflect the highlighted state
    if (mapInstanceRef.current) {
      // First, find the stakeholder in the markers array to ensure it exists
      const stakeholder = stakeholderMarkers.find(s => s.id === stakeholderId);
      
      if (stakeholder) {
        console.log("Found stakeholder to highlight:", stakeholder.name);
        
        // Immediate render to make sure marker is visible before any map movement
        renderStakeholderMarkers(mapInstanceRef.current, stakeholderMarkers);
        
        // Use multiple timeouts to ensure markers are consistently rendered during and after animations
        const rerenderMarkers = () => {
          console.log("Re-rendering stakeholder markers (timeout)");
          if (mapInstanceRef.current) {
            renderStakeholderMarkers(mapInstanceRef.current, stakeholderMarkers);
          }
        };
        
        // Add permanent map event listeners to ensure markers always reappear
        if (!mapInstanceRef.current._stakeholderMarkersListener) {
          // Add persistent event listeners for continuous visibility
          mapInstanceRef.current.on('moveend', rerenderMarkers);
          mapInstanceRef.current.on('zoomend', rerenderMarkers);
          mapInstanceRef.current.on('render', () => {
            // Check if markers are visible, if not re-render them
            if (!window.stakeholderMarkersArray || window.stakeholderMarkersArray.length === 0) {
              rerenderMarkers();
            }
          });
          
          // Flag to prevent adding multiple listeners
          mapInstanceRef.current._stakeholderMarkersListener = true;
        }
        
        // Schedule multiple redraws to ensure visibility during and after animations
        setTimeout(rerenderMarkers, 100);
        setTimeout(rerenderMarkers, 500);
        setTimeout(rerenderMarkers, 1000);
        setTimeout(rerenderMarkers, 2000); // Extended timeout for slower connections
        
        // Also add one-time event listeners for this specific movement
        mapInstanceRef.current.once('moveend', () => {
          console.log("Map movement ended, re-rendering stakeholder markers");
          renderStakeholderMarkers(mapInstanceRef.current, stakeholderMarkers);
          
          // Additional render after a short delay to ensure markers appear after map settles
          setTimeout(() => {
            console.log("Final re-rendering after map movement");
            renderStakeholderMarkers(mapInstanceRef.current, stakeholderMarkers);
          }, 200);
        });
        
        // Also listen for zoom changes
        mapInstanceRef.current.once('zoomend', () => {
          console.log("Map zoom ended, re-rendering stakeholder markers");
          renderStakeholderMarkers(mapInstanceRef.current, stakeholderMarkers);
        });
      } else {
        console.warn(`Stakeholder with ID ${stakeholderId} not found for highlighting`);
      }
    }
  }, [stakeholderMarkers]);
  
  // Handle external highlight stakeholder requests
  useEffect(() => {
    if (onHighlightStakeholder && typeof onHighlightStakeholder === 'function') {
      console.log("Setting up highlightStakeholder ref callback");
      onHighlightStakeholder(highlightStakeholder);
    }
  }, [onHighlightStakeholder, highlightStakeholder]);

  const loadStakeholders = async (map) => {
    try {
      console.log("Loading stakeholders...");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/stakeholders`,
        { credentials: "include" }
      );
      if (!response.ok) {
        console.error("Failed to load stakeholders:", response.status);
        return [];
      }
      const stakeholders = await response.json();
      console.log("Stakeholders loaded:", stakeholders.length);
      
      // Filter out stakeholders without location data and ensure coordinates are valid
      const stakeholdersWithLocation = stakeholders.filter(stakeholder => {
        // Check if location data exists
        if (!stakeholder.locationLat || !stakeholder.locationLng) return false;
        
        // Parse coordinates if they're stored as strings
        const lat = typeof stakeholder.locationLat === "string" ? parseFloat(stakeholder.locationLat) : stakeholder.locationLat;
        const lng = typeof stakeholder.locationLng === "string" ? parseFloat(stakeholder.locationLng) : stakeholder.locationLng;
        
        // Validate coordinates are within valid ranges
        return !isNaN(lat) && !isNaN(lng) && 
               lat >= -90 && lat <= 90 && 
               lng >= -180 && lng <= 180;
      });
      
      console.log("Stakeholders with valid location data:", stakeholdersWithLocation.length);
      stakeholdersWithLocation.forEach(s => {
        console.log(`Stakeholder ${s.id} (${s.name}) has location: [${s.locationLng}, ${s.locationLat}]`);
      });
      
      // Set all stakeholders for filtering purposes
      setStakeholderMarkers(stakeholders);
      setFilteredStakeholders(stakeholders);

      // Render only stakeholders with location data
      console.log("Rendering stakeholders with location data...");
      // Initial render of stakeholder markers
      renderStakeholderMarkers(map, stakeholdersWithLocation);
      
      // Ensure markers are properly positioned when the map is fully loaded
      map.once('idle', () => {
        console.log("Map idle - re-rendering stakeholders to ensure proper positioning");
        renderStakeholderMarkers(map, stakeholdersWithLocation);
      });
      
      // Set a timeout to re-render markers after a moment, as a fallback
      setTimeout(() => {
        if (map) {
          console.log("Re-rendering stakeholders after timeout");
          renderStakeholderMarkers(map, stakeholdersWithLocation);
        }
      }, 1500);

      return stakeholders;
    } catch (error) {
      console.error("Failed to load stakeholders:", error);
      return [];
    }
  };

  const renderInvestorMarkers = (map, investors) => {
    // Clear existing markers if needed
    if (window.investorMarkersArray) {
      window.investorMarkersArray.forEach((marker) => marker.remove());
    }
    window.investorMarkersArray = [];

    investors.forEach((investor) => {
      if (
        typeof investor.locationLang === "string" &&
        typeof investor.locationLat === "string" &&
        parseFloat(investor.locationLat) >= -90 &&
        parseFloat(investor.locationLat) <= 90 &&
        parseFloat(investor.locationLang) >= -180 &&
        parseFloat(investor.locationLang) <= 180
      ) {
        // Create a DOM element for the investor 3D marker
        const el = document.createElement("div");
        el.className = "investor-marker-3d";
        el.style.width = "20px";
        el.style.height = "20px";
        el.style.backgroundColor = "blue";
        el.style.borderRadius = "50%";
        el.style.cursor = "pointer";

        // Add 3D marker effect using CSS transform
        el.style.transform = "translate(-50%, -50%)";
        el.style.willChange = "transform";
        el.style.boxShadow = "0 0 10px rgba(0, 0, 255, 0.5)";

        // Create a popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="color: black; font-family: Arial, sans-serif;">
              <h3 style="margin: 0; color: black;">${investor.firstname} ${investor.lastname}</h3>
              <p style="margin: 0; color: black;">${investor.locationName}</p>
            </div>`
        );

        const marker = new mapboxgl.Marker({
          element: el,
          anchor: "bottom",
          offset: [0, -10],
        })
          .setLngLat([
            parseFloat(investor.locationLang),
            parseFloat(investor.locationLat),
          ])
          .setPopup(popup)
          .addTo(map);

        window.investorMarkersArray = window.investorMarkersArray || [];
        window.investorMarkersArray.push(marker);
      } else {
        console.warn(
          `Invalid location for investor: ${investor.firstname} ${investor.lastname}`,
          investor
        );
      }
    });
  };

  // Add default startup marker for Cebu
  const addDefaultStartupMarker = (map) => {
    // Cebu City coordinates (approximate center)
    const cebuCoordinates = [123.8854, 10.3157];

    // Create a DOM element for the startup marker
    const el = document.createElement("div");
    el.className = "default-startup-marker";
    el.style.width = "40px";
    el.style.height = "40px";
    el.style.backgroundImage = "url(/startup-icon.png)"; // Custom startup icon
    el.style.backgroundSize = "contain";
    el.style.backgroundRepeat = "no-repeat";
    el.style.cursor = "pointer";

    // Add 3D effect and glow
    el.style.filter = "drop-shadow(0 0 10px rgba(255, 165, 0, 0.8))";
    el.style.transform = "translate(-50%, -100%)";

    // Create a popup for the default marker
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<div style="color: black; font-family: Arial, sans-serif;">
          <h3 style="margin: 0; color: black;">Cebu Startup Hub</h3>
          <p style="margin: 0; color: black;">Your Startup Location</p>
        </div>`
    );

    // Add marker to map
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(cebuCoordinates)
      .setPopup(popup)
      .addTo(map);
  };

  const toggleConnectionsVisibility = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setShowConnections((prev) => {
      const next = !prev;

      // If we already have rendered line layers, just toggle their visibility
      if (
        window.connectionLinesArray &&
        window.connectionLinesArray.length > 0
      ) {
        window.connectionLinesArray.forEach((id) => {
          try {
            if (map.getLayer(id)) {
              map.setLayoutProperty(
                id,
                "visibility",
                next ? "visible" : "none"
              );
            }
            if (map.getLayer(`${id}-glow`)) {
              map.setLayoutProperty(
                `${id}-glow`,
                "visibility",
                next ? "visible" : "none"
              );
            }
            if (map.getLayer(`${id}-shadow`)) {
              map.setLayoutProperty(
                `${id}-shadow`,
                "visibility",
                next ? "visible" : "none"
              );
            }
          } catch (e) {
            // noop
          }
        });
      } else if (next && stakeholderConnections?.length) {
        // If showing but nothing rendered yet, render now
        renderConnectionLines(map, stakeholderConnections);
      }

      return next;
    });
  };

  // First, create and add the window pattern image
  const createBuildingPattern = (map) => {
    const patternSize = 32;
    const canvas = document.createElement("canvas");
    canvas.width = patternSize;
    canvas.height = patternSize;
    const ctx = canvas.getContext("2d");

    // Fill background
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(0, 0, patternSize, patternSize);

    // Draw window pattern
    ctx.fillStyle = "rgba(200, 220, 255, 0.8)";
    const windowSize = 4;
    const gap = 4;

    for (let y = gap; y < patternSize - windowSize; y += windowSize + gap) {
      for (let x = gap; x < patternSize - windowSize; x += windowSize + gap) {
        ctx.fillRect(x, y, windowSize, windowSize);
      }
    }

    // Add the pattern to the map
    map.addImage("building-windows", {
      width: patternSize,
      height: patternSize,
      data: new Uint8Array(
        ctx.getImageData(0, 0, patternSize, patternSize).data
      ),
    });
  };

  // Add 3D buildings to the map - Fixed filter expressions
  const add3DBuildings = (map) => {
    // First add ambient occlusion shadow layer for depth
    createBuildingPattern(map);

    map.addLayer({
      id: "building-ambient-shadows",
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: "fill-extrusion",
      minzoom: 12,
      layout: {
        visibility: "visible",
      },
      paint: {
        "fill-extrusion-color": "#000000",
        "fill-extrusion-height": ["*", ["to-number", ["get", "height"]], 1.02],
        "fill-extrusion-base": ["to-number", ["get", "min_height"]],
        "fill-extrusion-opacity": 0.12,
        "fill-extrusion-translate": [3, 3],
        "fill-extrusion-vertical-gradient": false,
      },
    });

    // Main building layer with enhanced detail
    map.addLayer(
      {
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 11,
        paint: {
          // Enhanced color gradient based on building height and zoom level
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["to-number", ["get", "height"]],
            0,
            "#e6f2ff", // Light blue-white for smallest buildings
            25,
            "#d9edff", // Very light blue
            50,
            "#cce7ff", // Light blue
            100,
            "#b3d9ff", // Moderate blue
            200,
            "#99ccff", // Medium blue
            300,
            "#80bfff", // Stronger blue
            400,
            "#66b3ff", // Deep blue for tall skyscrapers
            500,
            "#4da6ff", // Vivid blue for very tall buildings
          ],
          // Dynamic height based on zoom level for better visualization
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            11,
            ["*", ["to-number", ["get", "height"]], 0.7], // Shorter from far away
            14,
            ["*", ["to-number", ["get", "height"]], 0.9],
            16,
            ["*", ["to-number", ["get", "height"]], 1.0],
            18,
            ["to-number", ["get", "height"]], // Actual height when zoomed in
          ],
          "fill-extrusion-base": ["to-number", ["get", "min_height"]],
          "fill-extrusion-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            11,
            0.75,
            14,
            0.85,
            16,
            0.9,
          ],
          "fill-extrusion-vertical-gradient": true,
        },
      },
      "building-ambient-shadows"
    );

    // Add window patterns for more building detail
    map.addLayer({
      id: "building-windows-pattern",
      source: "composite",
      "source-layer": "building",
      filter: [
        "all",
        ["==", "extrude", "true"],
        [">=", ["to-number", ["get", "height"]], 20],
      ],
      type: "fill-extrusion",
      minzoom: 15,
      paint: {
        "fill-extrusion-pattern": "building-windows",
        "fill-extrusion-height": ["*", ["to-number", ["get", "height"]], 0.99],
        "fill-extrusion-base": ["to-number", ["get", "min_height"]],
        "fill-extrusion-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0.3,
          18,
          0.6,
        ],
      },
    });

    // Glass windows effect with enhanced reflection
    map.addLayer(
      {
        id: "3d-buildings-windows",
        source: "composite",
        "source-layer": "building",
        filter: [
          "all",
          ["==", "extrude", "true"],
          [">", ["to-number", ["get", "height"]], 30],
        ],
        type: "fill-extrusion",
        minzoom: 14,
        paint: {
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            "rgba(200, 230, 255, 0.8)",
            18,
            "rgba(220, 240, 255, 0.9)",
          ],
          "fill-extrusion-height": [
            "*",
            ["to-number", ["get", "height"]],
            0.98,
          ],
          "fill-extrusion-base": [
            "*",
            ["to-number", ["get", "min_height"]],
            1.01,
          ],
          "fill-extrusion-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            0.4,
            18,
            0.6,
          ],
          "fill-extrusion-vertical-gradient": true,
        },
      },
      "building-windows-pattern"
    );

    // Add detailed rooftops with texture
    map.addLayer(
      {
        id: "building-rooftops",
        source: "composite",
        "source-layer": "building",
        filter: [
          "all",
          ["==", "extrude", "true"],
          [">", ["to-number", ["get", "height"]], 30],
        ],
        type: "fill-extrusion",
        minzoom: 14,
        paint: {
          "fill-extrusion-color": "#ffffff",
          "fill-extrusion-height": [
            "*",
            ["to-number", ["get", "height"]],
            1.005,
          ],
          "fill-extrusion-base": ["*", ["to-number", ["get", "height"]], 0.995],
          "fill-extrusion-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            0.4,
            18,
            0.7,
          ],
          "fill-extrusion-vertical-gradient": false,
        },
      },
      "3d-buildings"
    );

    // Add rooftop structures (like water tanks, AC units) to larger buildings
    map.addLayer(
      {
        id: "building-rooftop-structures",
        source: "composite",
        "source-layer": "building",
        filter: [
          "all",
          ["==", "extrude", "true"],
          [">", ["to-number", ["get", "height"]], 50], // Only for taller buildings
        ],
        type: "fill-extrusion",
        minzoom: 16, // Only visible when zoomed in closely
        paint: {
          "fill-extrusion-color": "#d9d9d9", // Light gray for rooftop structures
          "fill-extrusion-height": [
            "*",
            ["to-number", ["get", "height"]],
            1.08,
          ], // 8% taller than the building
          "fill-extrusion-base": ["*", ["to-number", ["get", "height"]], 1.005], // Start just above the roof
          "fill-extrusion-opacity": 0.9,
          "fill-extrusion-vertical-gradient": true,
        },
      },
      "building-rooftops"
    );

    // Enhanced landmark buildings with more detail
    map.addLayer(
      {
        id: "landmark-buildings",
        source: "composite",
        "source-layer": "building",
        filter: [
          "all",
          ["==", "extrude", "true"],
          [">", ["to-number", ["get", "height"]], 80], // Only the tallest buildings
        ],
        type: "fill-extrusion",
        minzoom: 12,
        paint: {
          "fill-extrusion-color": "#4da6ff", // Special blue color for landmarks
          "fill-extrusion-height": [
            "*",
            ["to-number", ["get", "height"]],
            1.02,
          ], // Slightly taller
          "fill-extrusion-base": ["to-number", ["get", "min_height"]],
          "fill-extrusion-opacity": 0.9,
          "fill-extrusion-vertical-gradient": true,
        },
      },
      "building-rooftop-structures"
    );

    // Add glow effect for landmark buildings
    map.addLayer(
      {
        id: "building-glow",
        source: "composite",
        "source-layer": "building",
        filter: [
          "all",
          ["==", "extrude", "true"],
          [">", ["to-number", ["get", "height"]], 100], // Only the tallest buildings get a glow
        ],
        type: "fill-extrusion",
        minzoom: 14,
        paint: {
          "fill-extrusion-color": "#99ccff", // Light blue glow
          "fill-extrusion-height": [
            "*",
            ["to-number", ["get", "height"]],
            1.01,
          ],
          "fill-extrusion-base": [
            "*",
            ["to-number", ["get", "min_height"]],
            0.99,
          ],
          "fill-extrusion-opacity": 0.15,
          "fill-extrusion-translate": [1, 1],
          "fill-extrusion-translate-anchor": "viewport",
          "fill-extrusion-vertical-gradient": true,
        },
      },
      "landmark-buildings"
    );
  };

  const addBuildingLabels = (map) => {
    // Add building labels layer (would require a data source with building names)
    // This is a placeholder - you would need actual building name data
    if (map.getLayer("poi-label")) {
      map.setLayoutProperty("poi-label", "visibility", "visible");
      map.setLayoutProperty("poi-label", "text-size", [
        "interpolate",
        ["linear"],
        ["zoom"],
        15,
        10,
        18,
        14,
      ]);
      map.setPaintProperty("poi-label", "text-color", "#333333");
      map.setPaintProperty("poi-label", "text-halo-color", "#ffffff");
      map.setPaintProperty("poi-label", "text-halo-width", 1.5);
    }
  };

  const addBuildingDetails = (map) => {
    // Add decorative elements around buildings when zoomed in
    map.addLayer({
      id: "building-details",
      source: "composite",
      "source-layer": "building",
      filter: ["all", ["==", "extrude", "true"], [">", ["get", "height"], 30]],
      type: "line",
      minzoom: 17,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#ffffff",
        "line-width": 1.5,
        "line-opacity": 0.7,
      },
    });

    // Add high-detail window patterns to buildings when very zoomed in
    map.addLayer({
      id: "building-high-detail-windows",
      source: "composite",
      "source-layer": "building",
      filter: ["all", ["==", "extrude", "true"], [">", ["get", "height"], 40]],
      type: "fill-extrusion",
      minzoom: 18,
      paint: {
        "fill-extrusion-pattern": "building-windows-highrise",
        "fill-extrusion-height": ["*", ["get", "height"], 0.999],
        "fill-extrusion-base": ["get", "min_height"],
        "fill-extrusion-opacity": 0.8,
      },
    });
  };

  const createBuildingWindowPatterns = (map) => {
    // Regular window pattern
    const regularWindowPattern = {
      width: 12,
      height: 12,
      data: new Uint8Array(12 * 12 * 4),
    };

    // Create a grid pattern for windows
    for (let y = 0; y < regularWindowPattern.height; y++) {
      for (let x = 0; x < regularWindowPattern.width; x++) {
        const idx = (y * regularWindowPattern.width + x) * 4;
        const isWindow = x % 3 == 1 && y % 3 == 1;

        regularWindowPattern.data[idx] = 255; // R
        regularWindowPattern.data[idx + 1] = 255; // G
        regularWindowPattern.data[idx + 2] = 255; // B
        regularWindowPattern.data[idx + 3] = isWindow ? 200 : 50; // Alpha
      }
    }

    // Add the window pattern to the map
    if (!map.hasImage("building-windows")) {
      map.addImage("building-windows", regularWindowPattern);
    }

    // Create high-rise window pattern (more dense)
    const highRiseWindowPattern = {
      width: 16,
      height: 16,
      data: new Uint8Array(16 * 16 * 4),
    };

    // Create a denser grid pattern for high-rise windows
    for (let y = 0; y < highRiseWindowPattern.height; y++) {
      for (let x = 0; x < highRiseWindowPattern.width; x++) {
        const idx = (y * highRiseWindowPattern.width + x) * 4;
        const isWindow = x % 2 == 0 && y % 2 == 0;

        highRiseWindowPattern.data[idx] = 255; // R
        highRiseWindowPattern.data[idx + 1] = 255; // G
        highRiseWindowPattern.data[idx + 2] = 255; // B
        highRiseWindowPattern.data[idx + 3] = isWindow ? 200 : 30; // Alpha
      }
    }

    // Add the high-rise window pattern to the map
    if (!map.hasImage("building-windows-highrise")) {
      map.addImage("building-windows-highrise", highRiseWindowPattern);
    }
  };

  // Add water features with enhanced blue color
  const enhanceWaterFeatures = (map) => {
    // Enhance water color to match the bright blue in the image
    map.setPaintProperty("water", "fill-color", "#4dabf7");

    // Add a slight reflection effect to water
    map.addLayer(
      {
        id: "water-reflection",
        type: "fill",
        source: "composite",
        "source-layer": "water",
        layout: {},
        paint: {
          "fill-color": "#72c3fc",
          "fill-opacity": 0.1,
        },
      },
      "waterway-label"
    );
  };

  // Enhance roads and road labels
  const enhanceRoadLabels = (map) => {
    // Check if the layer exists before modifying it
    if (map.getLayer("road-label")) {
      map.setLayoutProperty("road-label", "visibility", "visible");
      map.setLayoutProperty("road-label", "text-size", [
        "interpolate",
        ["linear"],
        ["zoom"],
        12,
        10,
        16,
        16,
        20,
        24,
      ]);
    }

    if (map.getLayer("road-major-label")) {
      map.setPaintProperty("road-major-label", "text-color", "#2b6cb0");
      map.setPaintProperty(
        "road-major-label",
        "text-halo-color",
        "rgba(255, 255, 255, 0.9)"
      );
      map.setPaintProperty("road-major-label", "text-halo-width", 2);
    }

    // Change road colors to dark gray
    if (map.getLayer("road")) {
      map.setPaintProperty("road", "line-color", "#333333");
    }
    if (map.getLayer("road-secondary-tertiary")) {
      map.setPaintProperty("road-secondary-tertiary", "line-color", "#444444");
    }
    if (map.getLayer("road-primary")) {
      map.setPaintProperty("road-primary", "line-color", "#333333");
    }
    if (map.getLayer("road-motorway-trunk")) {
      map.setPaintProperty("road-motorway-trunk", "line-color", "#222222");
    }

    // Increase road visibility
    if (map.getLayer("road")) {
      map.setPaintProperty("road", "line-width", [
        "interpolate",
        ["linear"],
        ["zoom"],
        12,
        1,
        16,
        3,
        20,
        6,
      ]);
    }
    if (map.getLayer("road-primary")) {
      map.setPaintProperty("road-primary", "line-width", [
        "interpolate",
        ["linear"],
        ["zoom"],
        12,
        2,
        16,
        4,
        20,
        8,
      ]);
    }
    if (map.getLayer("road-motorway-trunk")) {
      map.setPaintProperty("road-motorway-trunk", "line-width", [
        "interpolate",
        ["linear"],
        ["zoom"],
        12,
        3,
        16,
        6,
        20,
        10,
      ]);
    }
  };

  // Toggle between 3D and 2D view
  const toggle3DView = () => {
    const map = mapInstanceRef.current;
    setIs3DActive(!is3DActive);

    if (!is3DActive) {
      // Enable 3D
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });
      map.setLayoutProperty("3d-buildings", "visibility", "visible");
      map.easeTo({
        pitch: 55, // Adjusted pitch to match the image
        bearing: 15, // Slight rotation to match perspective in image
        duration: 1000,
      });
    } else {
      // Disable 3D
      map.setTerrain(null);
      map.setLayoutProperty("3d-buildings", "visibility", "none");
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000,
      });
    }
  };

  // Toggle search expanded state
  const toggleSearchExpanded = () => {
    setIsSearchExpanded(!isSearchExpanded);
    // Only hide suggestions when collapsing the search
    if (isSearchExpanded) {
      setShowSuggestions(false);
    }
  };

  // Fetch search suggestions from Mapbox
  // Update the fetchSearchSuggestions function
  const fetchSearchSuggestions = useCallback(
    async (query) => {
      if (!query || query.trim().length < 2) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        // Mapbox location suggestions
        const mapboxResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${
            mapboxgl.accessToken
          }&country=PH&types=place,locality,district,neighborhood,address,poi&proximity=123.8854,10.3157&limit=3&autocomplete=true&language=en`
        );

        const mapboxData = await mapboxResponse.json();
        let mapboxSuggestions = [];
        if (mapboxData.features) {
          mapboxSuggestions = mapboxData.features.map((feature) => ({
            id: feature.id,
            text: feature.text,
            name: feature.place_name,
            center: feature.center,
            type: "location",
            category: feature.place_type[0],
            context: feature.context,
          }));
        }

        const filteredStartups =
          searchCategory !== "stakeholder"
            ? startupMarkers
                .filter(
                  (startup) =>
                    startup.companyName
                      ?.toLowerCase()
                      .includes(query.toLowerCase()) ||
                    startup.locationName
                      ?.toLowerCase()
                      .includes(query.toLowerCase())
                )
                .slice(0, 3)
                .map((startup) => ({
                  id: `startup-${startup.id}`,
                  text: startup.companyName,
                  name: `${startup.companyName} (${
                    startup.locationName || "Unknown location"
                  })`,
                  center: [startup.locationLng, startup.locationLat],
                  type: "startup",
                  data: startup,
                }))
            : [];

        const filteredStakeholdersSug =
          searchCategory !== "startup"
            ? stakeholderMarkers
                .filter(
                  (s) =>
                    s.name?.toLowerCase().includes(query.toLowerCase()) ||
                    s.locationName?.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 3)
                .map((s) => ({
                  id: `stakeholder-${s.id}`,
                  text: s.name,
                  name: `${s.name} (${s.locationName || "Unknown location"})`,
                  center: [
                    parseFloat(s.locationLng),
                    parseFloat(s.locationLat),
                  ],
                  type: "stakeholder",
                  data: s,
                }))
            : [];

        let combinedSuggestions = [];
        if (searchCategory === "all") {
          combinedSuggestions = [
            ...filteredStartups,
            ...filteredStakeholdersSug,
            ...mapboxSuggestions,
          ];
        } else if (searchCategory === "startup") {
          combinedSuggestions = filteredStartups;
        } else if (searchCategory === "stakeholder") {
          combinedSuggestions = filteredStakeholdersSug;
        } else if (searchCategory === "place") {
          combinedSuggestions = mapboxSuggestions;
        }

        setSearchSuggestions(combinedSuggestions);
        setShowSuggestions(combinedSuggestions.length > 0);
      } catch (error) {
        console.error("Error fetching search suggestions:", error);
        setSearchSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    },
    [searchCategory, startupMarkers, stakeholderMarkers]
  );

  const debouncedFetchSuggestions = useCallback(
    debounce((query) => {
      fetchSearchSuggestions(query);
    }, 300),
    [fetchSearchSuggestions]
  );

  // Handle search input change
  const handleSearchInputChange = (event) => {
    const query = event.target.value;
    setSearchInput(query);

    if (!query || query.trim().length < 2) {
      setShowSuggestions(false);
      setSearchSuggestions([]);
      setIsLoading(false);
      return;
    }

    // Set loading state immediately
    setIsLoading(true);

    // Use debounced function
    debouncedFetchSuggestions(query);
  };

  // Enhanced suggestion click handler
  const handleSuggestionClick = (suggestion) => {
    setSearchInput(suggestion.name);
    setShowSuggestions(false);

    const map = mapInstanceRef.current;
    const [lng, lat] = suggestion.center;

    // Fly to the location
    map.flyTo({
      center: [lng, lat],
      zoom: suggestion.type === "location" ? 13 : 15, // Zoom closer for startups/investors
      pitch: is3DActive ? 55 : 0,
      bearing: is3DActive ? 15 : 0,
      duration: 2000,
    });

    // Save to search history
    saveToSearchHistory(searchInput, suggestion);

    // Add boundary if it's a location
    if (suggestion.type === "location") {
      addBoundaryToMap(map, suggestion.name);
    }

    // Remove existing search marker if any
    if (window.searchMarker) {
      window.searchMarker.remove();
    }

    // Create appropriate marker based on suggestion type
    const el = document.createElement("div");
    el.className = "search-marker";
    el.style.width = "24px";
    el.style.height = "24px";

    if (suggestion.type === "startup") {
      el.style.backgroundColor = "#22c55e"; // Green for startups
      el.style.borderRadius = "50%";
      el.style.border = "2px solid white";
    } else if (suggestion.type === "investor") {
      el.style.backgroundColor = "#3b82f6"; // Blue for investors
      el.style.borderRadius = "50%";
      el.style.border = "2px solid white";
    } else {
      el.style.backgroundColor = "#ef4444"; // Red for locations
      el.style.borderRadius = "50%";
      el.style.border = "2px solid white";
    }

    el.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
    el.style.transform = "translate(-50%, -50%)";

    // Add new search marker
    window.searchMarker = new mapboxgl.Marker({
      element: el,
    })
      .setLngLat([lng, lat])
      .addTo(map);

    // Add a popup with appropriate info
    let popupContent = "";

    if (suggestion.type === "startup") {
      popupContent = `
        <div style="color: black; font-family: Arial, sans-serif;">
          <h3 style="margin: 0; color: black; font-weight: bold;">${
            suggestion.data.companyName
          }</h3>
          <p style="margin: 0; color: black;">${
            suggestion.data.locationName || "Location not specified"
          }</p>
          ${
            suggestion.data.industry
              ? `<p style="margin: 0; color: #666; font-size: 12px;">${suggestion.data.industry}</p>`
              : ""
          }
        </div>
      `;
    } else if (suggestion.type === "stakeholder") {
      popupContent = `
        <div style="color: black; font-family: Arial, sans-serif;">
          <h3 style="margin: 0; color: black; font-weight: bold;">${
            suggestion.data.name
          }</h3>
          <p style="margin: 0; color: black;">${
            suggestion.data.locationName || "Location not specified"
          }</p>
          ${
            suggestion.data.email
              ? `<p style="margin: 0; color: #666; font-size: 12px;">${suggestion.data.email}</p>`
              : ""
          }
        </div>
      `;
    } else {
      popupContent = `
        <div style="color: black; font-family: Arial, sans-serif;">
          <h3 style="margin: 0; color: black; font-weight: bold;">${
            suggestion.text
          }</h3>
          <p style="margin: 0; color: black;">${suggestion.name.replace(
            `${suggestion.text}, `,
            ""
          )}</p>
        </div>
      `;
    }

    new mapboxgl.Popup({ offset: 25 })
      .setLngLat([lng, lat])
      .setHTML(popupContent)
      .addTo(map);
  };

  const saveToSearchHistory = (query, result) => {
    const newHistory = [
      {
        query,
        result: result.name || result.text,
        coordinates: result.center,
        timestamp: new Date().toISOString(),
        type: result.type || "place",
      },
      ...searchHistory.filter(
        (item) => item.query !== query && searchHistory.length < 5
      ),
    ].slice(0, 5);

    setSearchHistory(newHistory);
    localStorage.setItem("mapSearchHistory", JSON.stringify(newHistory));
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("mapSearchHistory");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error parsing search history:", e);
        localStorage.removeItem("mapSearchHistory");
      }
    }
  }, []);

  const SearchComponent = () => (
    <div
      className={`absolute top-4 left-4 z-0 transition-all duration-300 ease-in-out ${
        isSearchExpanded ? "w-96" : "w-12"
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transition-shadow duration-300 hover:shadow-xl">
        {isSearchExpanded ? (
          <div className="flex flex-col">
            <div className="flex items-center border-b border-gray-200">
              <div className="flex items-center flex-1 px-4 relative">
                <Search className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  placeholder="Search places, startups, or investors..."
                  className="px-3 py-3 w-full text-sm text-gray-800 search-input focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit(e);
                    }
                  }}
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center pr-2">
                <button
                  onClick={handleSearchSubmit}
                  className="p-2 text-blue-500 hover:text-blue-600 transition-colors duration-200"
                  title="Search"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={toggleSearchExpanded}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Search category filters */}
            <div className="flex border-b border-gray-200 px-2 py-1">
              <button
                onClick={() => setSearchCategory("all")}
                className={`px-3 py-1 text-xs rounded-md ${
                  searchCategory === "all"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSearchCategory("startup")}
                className={`px-3 py-1 text-xs rounded-md ${
                  searchCategory === "startup"
                    ? "bg-green-100 text-green-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Startups
              </button>
              <button
                onClick={() => setSearchCategory("stakeholder")}
                className={`px-3 py-1 text-xs rounded-md ${
                  searchCategory === "stakeholder"
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Stakeholders
              </button>
              <button
                onClick={() => setSearchCategory("place")}
                className={`px-3 py-1 text-xs rounded-md ${
                  searchCategory === "place"
                    ? "bg-orange-100 text-orange-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Places
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={toggleSearchExpanded}
            className="w-full h-full p-3 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
            title="Expand search"
          >
            <Search className="h-5 w-5" />
          </button>
        )}

        {/* Search suggestions dropdown */}
        {isSearchExpanded &&
          (showSuggestions || (searchHistory.length > 0 && !searchInput)) && (
            <div
              ref={suggestionsRef}
              className="bg-white border-t border-gray-100 rounded-b-lg shadow-inner max-h-96 overflow-y-auto"
            >
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full mr-2"></div>
                  Searching...
                </div>
              ) : searchSuggestions.length > 0 ? (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                    Search Results
                  </div>
                  {searchSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 group border-b border-gray-100 last:border-0"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.type === "startup" ? (
                        <Building className="h-4 w-4 text-green-500" />
                      ) : suggestion.type === "stakeholder" ? (
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
                          <circle cx="12" cy="8" r="5" />
                          <path d="M20 21v-2a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v2" />
                        </svg>
                      ) : (
                        <MapPin className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          {suggestion.text}
                        </div>
                        <div className="text-xs text-gray-500">
                          {suggestion.name.replace(`${suggestion.text}, `, "")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchInput.length >= 2 ? (
                <div className="p-4 text-center text-gray-500">
                  No results found
                </div>
              ) : searchHistory.length > 0 && !searchInput ? (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 flex justify-between items-center">
                    <span>Recent Searches</span>
                    <button
                      onClick={() => {
                        localStorage.removeItem("mapSearchHistory");
                        setSearchHistory([]);
                      }}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      Clear
                    </button>
                  </div>
                  {searchHistory.map((item, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 group border-b border-gray-100 last:border-0"
                      onClick={() => {
                        handleSuggestionClick({
                          text: item.result,
                          name: item.result,
                          center: item.coordinates,
                          type: item.type,
                        });
                      }}
                    >
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-700">
                          {item.result}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
      </div>
    </div>
  );

  // Add boundary for searched location
  const addBoundaryToMap = async (map, placeName) => {
    try {
      // Remove previous boundary if exists
      if (currentGeojsonBoundary) {
        if (map.getSource("searched-area-boundary")) {
          if (map.getLayer("boundary-layer")) {
            map.removeLayer("boundary-layer");
          }
          if (map.getLayer("boundary-fill")) {
            map.removeLayer("boundary-fill");
          }
          map.removeSource("searched-area-boundary");
        }
      }

      // Query Mapbox Geocoding API for the place data
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          placeName
        )}.json?access_token=${
          mapboxgl.accessToken
        }&types=place,locality,district,region,country`
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];

        if (feature.bbox) {
          // If bbox is available, use it to zoom to the area
          map.fitBounds(
            [
              [feature.bbox[0], feature.bbox[1]],
              [feature.bbox[2], feature.bbox[3]],
            ],
            {
              padding: 50,
              duration: 1000,
            }
          );
        }

        // If the feature has a polygon, use that for the boundary
        if (
          feature.geometry &&
          (feature.geometry.type === "Polygon" ||
            feature.geometry.type === "MultiPolygon")
        ) {
          const geojson = {
            type: "Feature",
            geometry: feature.geometry,
            properties: {},
          };

          setCurrentGeojsonBoundary(geojson);

          // Add source and layers for the boundary
          map.addSource("searched-area-boundary", {
            type: "geojson",
            data: geojson,
          });

          // Add fill layer with transparency
          map.addLayer({
            id: "boundary-fill",
            type: "fill",
            source: "searched-area-boundary",
            layout: {},
            paint: {
              "fill-color": "#4dabf7",
              "fill-opacity": 0.2,
            },
          });

          // Add outline layer
          map.addLayer({
            id: "boundary-layer",
            type: "line",
            source: "searched-area-boundary",
            layout: {},
            paint: {
              "line-color": "#4dabf7",
              "line-width": 3,
              "line-dasharray": [2, 1],
            },
          });
        } else {
          // For point features, create a circular boundary
          if (feature.center) {
            const [lng, lat] = feature.center;

            // Create a circular polygon using turf.js if available or approximate with a simpler approach
            // Here using a simpler approximation
            const radius = 0.05; // Roughly 5km in degrees
            const points = 64;
            const polygon = { type: "Polygon", coordinates: [[]] };

            for (let i = 0; i < points; i++) {
              const angle = (i / points) * (2 * Math.PI);
              const lat_offset = Math.sin(angle) * radius;
              const lng_offset = Math.cos(angle) * radius;
              polygon.coordinates[0].push([lng + lng_offset, lat + lat_offset]);
            }
            // Close the polygon
            polygon.coordinates[0].push(polygon.coordinates[0][0]);

            const geojson = {
              type: "Feature",
              geometry: polygon,
              properties: {},
            };

            setCurrentGeojsonBoundary(geojson);

            // Add source and layers for the circular boundary
            map.addSource("searched-area-boundary", {
              type: "geojson",
              data: geojson,
            });

            // Add fill layer with transparency
            map.addLayer({
              id: "boundary-fill",
              type: "fill",
              source: "searched-area-boundary",
              layout: {},
              paint: {
                "fill-color": "#4dabf7",
                "fill-opacity": 0.2,
              },
            });

            // Add outline layer
            map.addLayer({
              id: "boundary-layer",
              type: "line",
              source: "searched-area-boundary",
              layout: {},
              paint: {
                "line-color": "#4dabf7",
                "line-width": 3,
                "line-dasharray": [2, 1],
              },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error adding boundary:", error);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (event) => {
    event.preventDefault();

    // Clear any pending search timeouts
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const query = searchInput.trim();
    if (!query || query.length < 3) {
      setShowSuggestions(false);
      return;
    }

    const map = mapInstanceRef.current;

    // Use Mapbox Geocoding API directly
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${mapboxgl.accessToken}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          const placeName = data.features[0].place_name;

          // Fly to the location
          map.flyTo({
            center: [lng, lat],
            zoom: 12,
            duration: 2000,
          });

          // Add boundary of the searched place
          addBoundaryToMap(map, query);

          // Create a temporary marker at the searched location
          const el = document.createElement("div");
          el.className = "search-marker";
          el.style.width = "20px";
          el.style.height = "20px";
          el.style.backgroundColor = "#ff4136";
          el.style.borderRadius = "50%";
          el.style.boxShadow = "0 0 10px rgba(255, 65, 54, 0.7)";
          el.style.transform = "translate(-50%, -50%)";

          // Remove existing search marker if any
          if (window.searchMarker) {
            window.searchMarker.remove();
          }

          // Add new search marker
          window.searchMarker = new mapboxgl.Marker({
            element: el,
          })
            .setLngLat([lng, lat])
            .addTo(map);

          // Add a popup with place info
          new mapboxgl.Popup({ offset: 25 })
            .setLngLat([lng, lat])
            .setHTML(
              `<div style="color: black; font-weight: bold;">${placeName}</div>`
            )
            .addTo(map);
        }
      })
      .catch((error) => {
        console.error("Error searching for location:", error);
      });

    // Close expanded search and suggestions after submission
    setShowSuggestions(false);
    setIsLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !event.target.classList.contains("search-input")
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    console.log("Initializing map and stakeholder display...");
    
    // Add global CSS for stakeholder markers to ensure they're always visible
    if (!document.getElementById('stakeholder-marker-global-styles')) {
      const style = document.createElement('style');
      style.id = 'stakeholder-marker-global-styles';
      style.innerHTML = `
        .stakeholder-marker {
          z-index: 1000 !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: all !important;
        }
        .mapboxgl-popup.stakeholder-popup {
          z-index: 1001 !important;
        }
        .mapboxgl-popup.stakeholder-popup .mapboxgl-popup-content {
          box-shadow: 0 3px 14px rgba(0,0,0,0.4) !important;
          border: 1px solid rgba(0,0,0,0.1) !important;
        }
      `;
      document.head.appendChild(style);
    }
    
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12", // Changed to streets style for better landmark visibility
      center: [123.8854, 10.3157], // Cebu City coordinates
      zoom: 16, // Lowered zoom level for better overview
      pitch: 55, // Adjusted pitch to match image
      bearing: 15, // Slight bearing to match image perspective
      antialias: true, // Smoother edges for 3D buildings
      maxPitch: 70, // Limit maximum pitch
      fog: {
        color: "rgb(220, 230, 240)", // Light fog color
        "horizon-blend": 0.1, // How much the fog blends with the sky
      },
    });

    // Navigation controls with rotation
    const navControl = new mapboxgl.NavigationControl({
      visualizePitch: true,
      showCompass: true,
    });
    map.addControl(navControl, "bottom-right");

    // Full screen control
    map.addControl(new mapboxgl.FullscreenControl(), "bottom-right");

    // Enable 3D navigation
    map.dragRotate.enable();
    map.touchZoomRotate.enableRotation();
    mapInstanceRef.current = map;
    map.resize();

    // Add 3D terrain and buildings
    map.on("load", () => {
      console.log("Map loaded, loading markers...");
      
      // Load stakeholders first to ensure they're displayed
      loadStakeholders(map).then(() => {
        console.log("Stakeholders loaded, ensuring visibility...");
        
        // Set up render event listener to ensure markers remain visible
        map.on('render', () => {
          if (window.stakeholderMarkersArray && 
              window.stakeholderMarkersArray.length > 0 && 
              !map._checkingStakeholderVisibility) {
            
            // Prevent multiple simultaneous checks
            map._checkingStakeholderVisibility = true;
            
            // Check if any marker elements are not in DOM
            const needsRedraw = window.stakeholderMarkersArray.some(marker => {
              const el = marker.getElement();
              return !document.body.contains(el);
            });
            
            if (needsRedraw) {
              console.log("Some stakeholder markers not visible, redrawing...");
              renderStakeholderMarkers(map, stakeholderMarkers);
            }
            
            map._checkingStakeholderVisibility = false;
          }
        });
      });
      
      // Add terrain source
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });

      // Set terrain with more subtle exaggeration
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });

      // Add atmospheric sky layer with lighter blue
      map.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 90.0],
          "sky-atmosphere-sun-intensity": 15,
          "sky-atmosphere-halo-color": "rgba(255, 255, 255, 0.8)",
          "sky-atmosphere-color": "rgba(186, 225, 250, 1.0)", // Lighter blue
          "sky-opacity": 0.8,
        },
      });

      // Add light haze effect
      map.setFog({
        range: [0.5, 10],
        color: "#f8f9fa",
        "horizon-blend": 0.2,
      });

      // Add enhanced 3D buildings with detailed features
      add3DBuildings(map);

      // Add extra building details when zoomed in
      addBuildingDetails(map);

      // Add building labels when available
      addBuildingLabels(map);

      // Enhance water features
      enhanceWaterFeatures(map);

      // Enhance road labels and make roads dark gray
      enhanceRoadLabels(map);

      // Add default startup marker for Cebu
      addDefaultStartupMarker(map);

      // Load markers after 3D is set up
      loadStartupMarkers(map);
      // loadInvestorMarkers(map); // removed
      
      // Add a slight delay to ensure stakeholders load after map is fully ready
      console.log("Map ready, loading stakeholders with delay...");
      setTimeout(() => {
        loadStakeholders(map);
      }, 500);

      // Load stakeholder connections (associations)
      loadStakeholderConnections(map);
    });

    return () => {
      map.remove();
    };
  }, []);

  // Add this function to load stakeholder connections
  const loadStakeholderConnections = async (map) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startup-stakeholders`,
        { credentials: "include" }
      );

      if (!response.ok) {
        console.error(
          "Failed to fetch stakeholder connections:",
          response.status
        );
        return [];
      }

      const connections = await response.json();
      setStakeholderConnections(connections);

      // We already rendered all stakeholders via loadStakeholders

      // Then render connection lines (only for mutually connected)
      setTimeout(() => {
        renderConnectionLines(map, connections);
      }, 500);

      return connections;
    } catch (error) {
      console.error("Failed to load stakeholder connections:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Only draw lines when connected on both sides (treat connected === true as mutual)
  const renderConnectionLines = (map, connections) => {
    console.log("Rendering connections:", connections.length);

    // Cleanup previous
    if (window.connectionLinesArray) {
      window.connectionLinesArray.forEach((lineId) => {
        try {
          if (map.getLayer(lineId)) map.removeLayer(lineId);
          if (map.getLayer(`${lineId}-glow`)) map.removeLayer(`${lineId}-glow`);
          if (map.getLayer(`${lineId}-shadow`))
            map.removeLayer(`${lineId}-shadow`);
          if (map.getSource(lineId)) map.removeSource(lineId);
          if (map.getSource(`${lineId}-shadow`))
            map.removeSource(`${lineId}-shadow`);
        } catch {}
      });
    }
    window.connectionLinesArray = [];

    // Optional: dedupe by startup-stakeholder pair
    const seen = new Set();

    connections.forEach((connection, index) => {
      try {
        // Require connected === true (mutual/accepted)
        if (!connection?.connected) return;

        const startup = connection.startup;
        const stakeholder = connection.stakeholder;

        if (
          !startup ||
          !stakeholder ||
          typeof startup.locationLat !== "number" ||
          typeof startup.locationLng !== "number" ||
          typeof stakeholder.locationLat !== "number" ||
          typeof stakeholder.locationLng !== "number"
        ) {
          return;
        }

        const key = `${startup.id}-${stakeholder.id}`;
        if (seen.has(key)) return;
        seen.add(key);

        // Parse coordinates carefully
        const startLat = parseFloat(startup.locationLat);
        const startLng = parseFloat(startup.locationLng);
        const endLat = parseFloat(stakeholder.locationLat);
        const endLng = parseFloat(stakeholder.locationLng);

        if (
          isNaN(startLat) ||
          isNaN(startLng) ||
          isNaN(endLat) ||
          isNaN(endLng)
        ) {
          return;
        }

        const sourceId = `connection-line-${startup.id}-${stakeholder.id}-${index}`;
        window.connectionLinesArray.push(sourceId);

        const lineColor = "#FF7F00";

        const distance = Math.sqrt(
          Math.pow(endLng - startLng, 2) + Math.pow(endLat - startLat, 2)
        );

        const maxHeight = Math.min(distance * 0.5, 0.1);
        const numLayers = 12;
        const layerPoints = [];

        for (let layer = 0; layer < numLayers; layer++) {
          const heightFactor = layer / (numLayers - 1);
          const points = [];
          const steps = 40;
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const heightMultiplier = 4 * t * (1 - t);
            const currentHeight = maxHeight * heightMultiplier * heightFactor;
            const lng = startLng + (endLng - startLng) * t;
            const lat = startLat + (endLat - startLat) * t;
            points.push([lng, lat]);
          }
          layerPoints.push(points);
        }

        map.addSource(`${sourceId}-shadow`, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: layerPoints[0] },
          },
        });

        map.addLayer({
          id: `${sourceId}-shadow`,
          type: "line",
          source: `${sourceId}-shadow`,
          layout: {
            visibility: showConnections ? "visible" : "none",
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#000000",
            "line-width": 4,
            "line-opacity": 0.2,
            "line-blur": 3,
            "line-translate": [3, 3],
          },
        });

        for (let layer = 1; layer < numLayers; layer++) {
          const layerId = `${sourceId}-layer-${layer}`;
          const opacity = 0.3 + (layer / numLayers) * 0.7;
          const lineWidth = 1.5 + (layer / numLayers) * 2.5;
          const vertOffset = layer * 0.5;

          map.addSource(layerId, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: layerPoints[layer] },
            },
          });

          map.addLayer({
            id: layerId,
            type: "line",
            source: layerId,
            layout: {
              visibility: showConnections ? "visible" : "none",
              "line-join": "round",
              "line-cap": "round",
              "line-sort-key": 1000 + layer,
            },
            paint: {
              "line-color": lineColor,
              "line-width": lineWidth,
              "line-opacity": opacity,
              "line-translate": [0, -vertOffset],
              "line-translate-anchor": "viewport",
            },
          });

          window.connectionLinesArray.push(layerId);
        }

        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: layerPoints[numLayers - 1],
            },
          },
        });

        map.addLayer({
          id: `${sourceId}-glow`,
          type: "line",
          source: sourceId,
          layout: {
            visibility: showConnections ? "visible" : "none",
            "line-join": "round",
            "line-cap": "round",
            "line-sort-key": 1500,
          },
          paint: {
            "line-color": lineColor,
            "line-width": 8,
            "line-opacity": 0.5,
            "line-blur": 4,
            "line-translate-anchor": "viewport",
          },
        });

        map.addLayer({
          id: sourceId,
          type: "line",
          source: sourceId,
          layout: {
            visibility: showConnections ? "visible" : "none",
            "line-join": "round",
            "line-cap": "round",
            "line-sort-key": 2000,
          },
          paint: {
            "line-color": lineColor,
            "line-width": 3,
            "line-opacity": 1.0,
            "line-translate-anchor": "viewport",
            "line-dasharray": [2, 1],
          },
        });
      } catch (error) {
        console.error("Error creating connection line:", error);
      }
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden map-container-relative">
      <div
        ref={mapContainerRef}
        className="fixed top-0 left-0 w-full h-full z-0 marker-container"
        style={{ width: "100%", height: "100%" }}
      />
      <SearchComponent />

      {/* 3D Toggle Button */}
      <button
        onClick={toggle3DView}

        className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-2 rounded-md shadow-md z-10 flex items-center gap-1 text-sm font-medium text-gray-700 hover:bg-white transition duration-200"
      >
        {is3DActive ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
            2D
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={0}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 009-9"
              />
            </svg>
            3D
          </>
        )}
      </button>

      {/* Connections Toggle Button */}
      <button
        onClick={toggleConnectionsVisibility}
        className="absolute bottom-4 left-28 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-2 rounded-md shadow-md z-10 flex items-center gap-1 text-sm font-medium text-gray-700 hover:bg-white transition duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        {showConnections ? "Hide Connections" : "Show Connections"}
      </button>

      {openLogin && (
        <Login
          closeModal={() => setOpenLogin(false)}
          openRegister={() => {
            setOpenLogin(false);
            setOpenRegister(true);
          }}
          onLoginSuccess={onLoginSuccess}
        />
      )}
    </div>
  );
}

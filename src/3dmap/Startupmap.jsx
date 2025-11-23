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

// Preload stakeholder icon image for better rendering
const preloadStakeholderIcon = () => {
  const img = new Image();
  img.src = `${window.location.origin}/stakeholder-icon.png`;
  return img;
};

mapboxgl.accessToken =
  "pk.eyJ1IjoiYWxwcmluY2VsbGF2YW4iLCJhIjoiY204djkydXNoMGZsdjJvc2RnN3B5NTdxZCJ9.wGaWS8KJXPBYUzpXh91Dww";

export default function Startupmap({
  mapInstanceRef,
  onMapClick,
  onLoginSuccess,
  onHighlightStakeholder,
  onStartupClick,
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
  const stakeholderPopupRef = useRef(null);
  // Store the preloaded stakeholder icon image
  const stakeholderIconRef = useRef(null);

  // Preload the stakeholder icon as soon as component mounts
  useEffect(() => {
    console.log("Preloading stakeholder icon...");
    stakeholderIconRef.current = preloadStakeholderIcon();
    stakeholderIconRef.current.onload = () => console.log("Stakeholder icon preloaded successfully");
    stakeholderIconRef.current.onerror = (e) => console.error("Failed to preload stakeholder icon:", e);
  }, []);

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

      // Render startup points using a symbol layer if valid coords exist
      const startupsWithLocation = (startups || []).filter((s) => {
        if (s.locationLat == null || s.locationLng == null) return false;
        const lat = typeof s.locationLat === "string" ? parseFloat(s.locationLat) : s.locationLat;
        const lng = typeof s.locationLng === "string" ? parseFloat(s.locationLng) : s.locationLng;
        return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
      });
      const mapRef = mapInstanceRef.current || map;
      if (mapRef && startupsWithLocation.length) {
        renderStartupMarkers(mapRef, startupsWithLocation);
      }
      return startups;
    } catch (error) {
      console.error("Failed to load startups:", error);
      return [];
    }
  };
  /*

  */
  const highlightStakeholder = useCallback(
    (stakeholderId) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      const prevId = activeStakeholderId;
      setActiveStakeholderId(stakeholderId);

      // Update feature-state colors
      try {
        if (prevId != null) {
          map.setFeatureState(
            { source: "stakeholders-src", id: prevId },
            { selected: false }
          );
        }
        map.setFeatureState(
          { source: "stakeholders-src", id: stakeholderId },
          { selected: true }
        );
      } catch {}

      // Update highlight circle filter
      if (map.getLayer("stakeholders-highlight")) {
        map.setFilter("stakeholders-highlight", [
          "==",
          ["get", "id"],
          stakeholderId,
        ]);
      }

      // Find data for popup and fly
      const st = stakeholderMarkers.find((s) => s.id === stakeholderId);
      if (st && st.locationLng != null && st.locationLat != null) {
        const lng = typeof st.locationLng === "string" ? parseFloat(st.locationLng) : st.locationLng;
        const lat = typeof st.locationLat === "string" ? parseFloat(st.locationLat) : st.locationLat;

        // Fly to the stakeholder
        map.flyTo({
          center: [lng, lat],
          zoom: Math.max(map.getZoom(), 14.5),
          speed: 0.8,
          curve: 1.2,
          essential: true,
          padding: { top: 100, bottom: 100, left: 100, right: 100 },
        });

        // Close previous popup
        if (stakeholderPopupRef.current) {
          stakeholderPopupRef.current.remove();
          stakeholderPopupRef.current = null;
        }

        // Build a clean, professional popup
        const html = `
          <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; color: #1F2937;">
            <div style="background: linear-gradient(135deg, #4F46E5, #3B82F6); color: #fff; padding: 14px 16px; border-radius: 8px 8px 0 0;">
              <div style="font-weight: 600; font-size: 16px;">${st.name || "Stakeholder"}</div>
              ${st.organization ? `<div style="opacity: .9; font-size: 12px; margin-top: 2px;">${st.organization}</div>` : ""}
            </div>
            <div style="padding: 12px 16px; background: #fff;">
              ${st.locationName ? `<div style=\"font-size: 13px; color: #4B5563; margin-bottom: 6px;\">${st.locationName}</div>` : ""}
              ${st.email ? `<div style=\"font-size: 13px;\"><a href=\"mailto:${st.email}\" style=\"color:#4F46E5; text-decoration: none;\">${st.email}</a></div>` : ""}
            </div>
          </div>`;

        stakeholderPopupRef.current = new mapboxgl.Popup({ offset: 12, closeButton: true, className: "stakeholder-popup" })
          .setLngLat([lng, lat])
          .setHTML(html)
          .addTo(map);
      }
    },
    [activeStakeholderId, stakeholderMarkers]
  );
  
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

      // Render stakeholders using built-in icon layer
      console.log("Rendering stakeholders with built-in icons...");
      renderStakeholderMarkers(map, stakeholdersWithLocation);

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

  // Render stakeholders using a Mapbox symbol layer (no DOM markers)
  const renderStakeholderMarkers = (map, stakeholdersWithLocation) => {
    if (!map) return;

    const sourceId = "stakeholders-src";
    const symbolLayerId = "stakeholders-layer";
    const highlightLayerId = "stakeholders-highlight";

    // Build GeoJSON from stakeholders
    const features = stakeholdersWithLocation.map((s) => {
      const lat = typeof s.locationLat === "string" ? parseFloat(s.locationLat) : s.locationLat;
      const lng = typeof s.locationLng === "string" ? parseFloat(s.locationLng) : s.locationLng;
      return {
        type: "Feature",
        id: s.id,
        properties: {
          id: s.id,
          name: s.name || "Stakeholder",
          organization: s.organization || "",
          email: s.email || "",
          locationName: s.locationName || "",
        },
        geometry: { type: "Point", coordinates: [lng, lat] },
      };
    });

    const data = { type: "FeatureCollection", features };

    // Add or update source
    if (map.getSource(sourceId)) {
      const src = map.getSource(sourceId);
      try { src.setData(data); } catch {}
    } else {
      map.addSource(sourceId, { type: "geojson", data });
    }

    // Ensure icon image is registered
    const ensureIconAndLayers = () => {
      // Add symbol layer
      if (!map.getLayer(symbolLayerId)) {
        map.addLayer({
          id: symbolLayerId,
          type: "symbol",
          source: sourceId,
          layout: {
            "icon-image": "stakeholder-icon",
            "icon-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              3, 0.11,  // Slightly bigger at low zoom
              8, 0.15,  // Medium size at medium zoom
              12, 0.19, // Improved visibility at higher zoom
              16, 0.24  // More noticeable at highest zoom
            ],
            "icon-allow-overlap": true,
            "icon-ignore-placement": false,
            "icon-anchor": "center",
            "icon-pitch-alignment": "viewport",
            "icon-rotation-alignment": "viewport",
            // Enhanced shadow for professional appearance
            "icon-halo-width": 1.2,
            "icon-halo-color": "rgba(0, 0, 0, 0.2)",
            "icon-halo-blur": 1.0
          },
        });
      }

      // Add subtle highlight circle layer for active
      if (!map.getLayer(highlightLayerId)) {
        map.addLayer({
          id: highlightLayerId,
          type: "circle",
          source: sourceId,
          filter: ["==", ["get", "id"], -1], // start with no match
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              5, 4,
              10, 7,
              14, 10,
              18, 12
            ],
            "circle-color": "#3b82f6",
            "circle-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10, 0.1,
              15, 0.15
            ],
            "circle-stroke-color": "#3b82f6",
            "circle-stroke-width": 2,
            "circle-stroke-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10, 0.4,
              15, 0.6
            ],
            "circle-blur": 0.2,
          },
        });
      }

      // Add hover interactions once
      if (!map.__stakeholderEventsAdded) {
        map.__stakeholderEventsAdded = true;

        map.on("mouseenter", symbolLayerId, (e) => {
          map.getCanvas().style.cursor = "pointer";
          if (!e.features?.length) return;
          const id = e.features[0].id;
          if (id != null) {
            map.setFeatureState({ source: sourceId, id }, { hover: true });
          }
        });

        map.on("mouseleave", symbolLayerId, (e) => {
          map.getCanvas().style.cursor = "";
          if (!e.features?.length) return;
          const id = e.features[0].id;
          if (id != null) {
            map.setFeatureState({ source: sourceId, id }, { hover: false });
          }
        });

        map.on("click", symbolLayerId, (e) => {
          if (!e.features?.length) return;
          const f = e.features[0];
          const id = f.id;
          const [lng, lat] = f.geometry.coordinates;

          setActiveStakeholderId(id);
          try {
            map.setFeatureState({ source: sourceId, id }, { selected: true });
            if (map.getLayer(highlightLayerId)) {
              map.setFilter(highlightLayerId, ["==", ["get", "id"], id]);
            }
          } catch {}

          // Fly and popup
          map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 14.5), speed: 0.8, curve: 1.2, essential: true });

          if (stakeholderPopupRef.current) {
            stakeholderPopupRef.current.remove();
            stakeholderPopupRef.current = null;
          }

          const props = f.properties || {};
          const html = `
            <div style="font-family: 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif; color: #1F2937;">
              <div style="background: linear-gradient(135deg, #4F46E5, #3B82F6); color: #fff; padding: 14px 16px; border-radius: 8px 8px 0 0;">
                <div style="font-weight: 600; font-size: 15px;">${props.name || "Stakeholder"}</div>
                ${props.organization ? `<div style="opacity:.95; font-size:12px; margin-top:3px;">${props.organization}</div>` : ""}
              </div>
              <div style="padding: 12px 16px; background: #fff; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                ${props.locationName ? `<div style=\"font-size: 13px; color: #4B5563; margin-bottom: 8px;\"><svg style=\"display: inline-block; width: 12px; height: 12px; margin-right: 5px; vertical-align: -1px;\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M15 11a3 3 0 11-6 0 3 3 0 016 0z\"></path></svg>${props.locationName}</div>` : ""}
                ${props.email ? `<div style=\"font-size: 13px;\"><svg style=\"display: inline-block; width: 12px; height: 12px; margin-right: 5px; vertical-align: -1px;\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z\"></path></svg><a href=\"mailto:${props.email}\" style=\"color:#4F46E5; text-decoration: none;\">${props.email}</a></div>` : ""}
              </div>
            </div>`;

          stakeholderPopupRef.current = new mapboxgl.Popup({ offset: 15, closeButton: true, className: "stakeholder-popup" })
            .setLngLat([lng, lat])
            .setHTML(html)
            .addTo(map);
        });
      }
    };

    // If icon not present, load it then add layers
    const iconName = "stakeholder-icon";
    if (!map.hasImage(iconName)) {
      // Use preloaded icon if available for better performance
      if (stakeholderIconRef.current && stakeholderIconRef.current.complete) {
        try {
          map.addImage(iconName, stakeholderIconRef.current, { pixelRatio: 2 });
          ensureIconAndLayers();
        } catch (e) {
          console.error("Failed to add preloaded stakeholder icon:", e);
          loadIconFromURL();
        }
      } else {
        loadIconFromURL();
      }
    } else {
      ensureIconAndLayers();
    }
    
    function loadIconFromURL() {
      const iconUrl = `${window.location.origin}/stakeholder-icon.png`;
      map.loadImage(iconUrl, (err, img) => {
        if (err) {
          console.error("Failed to load stakeholder icon:", err);
          // Create a professional fallback icon using canvas
          const canvas = document.createElement('canvas');
          canvas.width = 64; canvas.height = 64;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0,0,64,64);
          
          // Create circular background
          ctx.fillStyle = '#8B5CF6';
          ctx.beginPath();
          ctx.arc(32, 32, 24, 0, Math.PI * 2);
          ctx.fill();
          
          // Add white border for professional look
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(32, 32, 22, 0, Math.PI * 2);
          ctx.stroke();
          
          // Add person silhouette
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          // Head
          ctx.beginPath();
          ctx.arc(32, 24, 8, 0, Math.PI * 2);
          ctx.fill();
          // Body
          ctx.beginPath();
          ctx.moveTo(32, 32);
          ctx.arc(32, 32, 12, Math.PI * 0.25, Math.PI * 0.75, false);
          ctx.fill();
          
          try { 
            map.addImage(iconName, { width: 64, height: 64, data: ctx.getImageData(0,0,64,64).data }, { pixelRatio: 2 }); 
          } catch {}
          return ensureIconAndLayers();
        }
        try {
          map.addImage(iconName, img, { pixelRatio: 2 });
        } catch {}
        ensureIconAndLayers();
      });
    }
  };

  // Render startups using a Mapbox symbol layer (professional marker)
  const renderStartupMarkers = (map, startupsWithLocation) => {
    if (!map) return;

    const sourceId = "startups-src";
    const layerId = "startups-layer";
    const highlightLayerId = "startups-highlight";
    const iconName = "startup-marker";

    const features = startupsWithLocation.map((s) => {
      const lat = typeof s.locationLat === "string" ? parseFloat(s.locationLat) : s.locationLat;
      const lng = typeof s.locationLng === "string" ? parseFloat(s.locationLng) : s.locationLng;
      return {
        type: "Feature",
        id: s.id,
        properties: {
          id: s.id,
          name: s.companyName || s.name || "Startup",
          locationName: s.locationName || "",
        },
        geometry: { type: "Point", coordinates: [lng, lat] },
      };
    });

    const data = { type: "FeatureCollection", features };

    if (map.getSource(sourceId)) {
      try { map.getSource(sourceId).setData(data); } catch {}
    } else {
      map.addSource(sourceId, { type: "geojson", data });
    }

    const ensureLayer = () => {
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: "symbol",
          source: sourceId,
          layout: {
            "icon-image": iconName,
            "icon-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              3, 0.24,  // Significantly improved visibility at low zoom
              8, 0.32,  // Larger size for better visibility at medium zoom
              12, 0.38, // More prominent size at higher zoom
              16, 0.44  // Bold but professional size at highest zoom
            ],
            "icon-allow-overlap": true,
            "icon-ignore-placement": false,
            "icon-anchor": "bottom",
            "icon-pitch-alignment": "viewport",
            "icon-rotation-alignment": "viewport",
            // Add a slight offset to improve map readability
            "icon-offset": [0, 3],
            // Enhanced shadow for professional appearance
            "icon-halo-width": 1.5,
            "icon-halo-color": "rgba(0, 0, 0, 0.28)",
            "icon-halo-blur": 1.2
          },
        });
      }

      if (!map.getLayer(highlightLayerId)) {
        map.addLayer({
          id: highlightLayerId,
          type: "circle",
          source: sourceId,
          filter: ["==", ["get", "id"], -1],
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              5, 12,
              10, 18,
              14, 24,
              18, 30
            ],
            "circle-color": "#0A66C2", // Professional blue color for highlight
            "circle-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10, 0.1,
              15, 0.15
            ],
            "circle-stroke-color": "#0A66C2",
            "circle-stroke-width": 3,
            "circle-stroke-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10, 0.5,
              15, 0.7
            ],
            "circle-blur": 0.2
          },
        });
      }

      if (!map.__startupEventsAdded) {
        map.__startupEventsAdded = true;
        map.on("mouseenter", layerId, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layerId, () => {
          map.getCanvas().style.cursor = "";
        });
        map.on("click", layerId, (e) => {
          if (!e.features?.length) return;
          const f = e.features[0];
          const id = f.id;
          const [lng, lat] = f.geometry.coordinates;

          // Highlight
          try {
            if (map.getLayer(highlightLayerId)) {
              map.setFilter(highlightLayerId, ["==", ["get", "id"], id]);
            }
          } catch {}

          // Fly and popup
          map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 15), speed: 0.8, curve: 1.2, essential: true });

          const props = f.properties || {};
          const html = `
            <div style="font-family: 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif; color: #111827; max-width: 280px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); border-radius: 10px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #0A66C2, #0077B5); color: #fff; padding: 16px 18px; border-radius: 10px 10px 0 0; position: relative;">
                <div style="font-weight: 600; font-size: 17px; margin-bottom: 2px;">${props.name || "Startup"}</div>
                <div style="font-size: 12px; opacity: 0.9;">Startup Company</div>
                <div style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.2); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <svg style="width: 20px; height: 20px;" fill="none" stroke="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
              </div>
              <div style="padding: 14px 18px; background: #fff; border-radius: 0 0 10px 10px;">
                ${props.locationName ? 
                  `<div style="font-size: 13px; color: #4B5563; display: flex; align-items: center;">
                    <div style="min-width: 24px; height: 24px; background-color: rgba(10, 102, 194, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                      <svg style="width: 14px; height: 14px;" fill="none" stroke="#0A66C2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <span>${props.locationName}</span>
                  </div>` : ''
                }
              </div>
            </div>`;
          const popup = new mapboxgl.Popup({ offset: 25, closeButton: true, className: "startup-popup" })
            .setLngLat([lng, lat])
            .setHTML(html)
            .addTo(map);
        });
      }
    };

    if (!map.hasImage(iconName)) {
      const iconUrl = `${window.location.origin}/startup-marker.png`;
      
      // Try SVG marker first (more professional), fallback to PNG
      map.loadImage(iconUrl, (err, img) => {
        if (err) {
          // SVG failed, try PNG
          const pngUrl = `${window.location.origin}/location.png`;
          map.loadImage(pngUrl, (err2, img2) => {
            if (err2) {
              console.error("Failed to load startup icon. Creating enhanced canvas fallback:", err2);
              // Fallback: draw a professional pin with enhanced design and gradients
              const canvas = document.createElement('canvas');
              canvas.width = 128; canvas.height = 128; // Larger canvas for better quality
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, 128, 128);
              
              // Enhanced drop shadow
              ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
              ctx.shadowBlur = 10;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 4;
              
              // Define professional color palette - using LinkedIn-inspired blues
              const primaryColor = '#0A66C2'; // Professional LinkedIn blue
              const secondaryColor = '#0077B5'; // Slightly deeper blue
              const highlightColor = '#0e87db'; // Highlight blue for embellishments
              const accentColor = '#FFFFFF';
              
              // Pin body with sophisticated gradient
              const gradient = ctx.createLinearGradient(64, 16, 64, 64);
              gradient.addColorStop(0, primaryColor);
              gradient.addColorStop(1, secondaryColor);
              ctx.fillStyle = gradient;
              
              // Main pin shape - larger and more professional
              ctx.beginPath();
              ctx.arc(64, 40, 28, Math.PI, Math.PI * 2);
              // Create tapered point for a more elegant pin
              ctx.lineTo(64, 104); // Bottom point (taller)
              ctx.lineTo(36, 40);
              ctx.closePath();
              ctx.fill();
              
              // Reset shadow for inner details
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
              
              // Glossy highlight for professional look
              const glossGradient = ctx.createLinearGradient(40, 20, 88, 60);
              glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
              glossGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
              glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
              ctx.fillStyle = glossGradient;
              ctx.beginPath();
              ctx.arc(64, 40, 27.5, Math.PI, Math.PI * 2);
              ctx.lineTo(64, 102);
              ctx.lineTo(37, 40);
              ctx.closePath();
              ctx.fill();
              
              // White border for professional contrast
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(64, 40, 27, Math.PI, Math.PI * 2);
              ctx.lineTo(64, 102);
              ctx.lineTo(37, 40);
              ctx.stroke();
              
              // Inner circle with refined look
              ctx.fillStyle = accentColor;
              ctx.beginPath();
              ctx.arc(64, 40, 18, 0, Math.PI * 2);
              ctx.fill();
              
              // Subtle inner shadow for depth
              const innerShadow = ctx.createRadialGradient(64, 38, 4, 64, 40, 18);
              innerShadow.addColorStop(0, 'rgba(255, 255, 255, 1)');
              innerShadow.addColorStop(1, 'rgba(240, 240, 240, 1)');
              ctx.fillStyle = innerShadow;
              ctx.beginPath();
              ctx.arc(64, 40, 16, 0, Math.PI * 2);
              ctx.fill();
              
              // Building icon for startup representation
              ctx.fillStyle = primaryColor;
              // Building body
              ctx.fillRect(56, 32, 16, 16);
              // Windows
              ctx.fillStyle = highlightColor;
              ctx.fillRect(58, 34, 4, 4);
              ctx.fillRect(64, 34, 4, 4);
              ctx.fillRect(58, 40, 4, 4);
              ctx.fillRect(64, 40, 4, 4);
              
              try { map.addImage(iconName, { width: 128, height: 128, data: ctx.getImageData(0, 0, 128, 128).data }, { pixelRatio: 3.0 }); } catch {}
              return ensureLayer();
            }
            try { map.addImage(iconName, img2, { pixelRatio: 2 }); } catch {}
            ensureLayer();
          });
        } else {
          try { map.addImage(iconName, img, { pixelRatio: 2 }); } catch {}
          ensureLayer();
        }
      });
    } else {
      ensureLayer();
    }
  };

  // Add default startup marker for Cebu
  const addDefaultStartupMarker = (map) => {
    // Cebu City coordinates (approximate center)
    const cebuCoordinates = [123.8854, 10.3157];

    // Create a DOM element for the startup marker with enhanced professional appearance
    const el = document.createElement("div");
    el.className = "default-startup-marker";
    el.style.width = "15px";  // Larger for better visibility
    el.style.height = "15px"; // Maintain aspect ratio
    
    // Try to use professional SVG marker first, fallback to custom design
    const markerIconSvg = `${window.location.origin}/startup-marker.png`;
    
    // Create professional looking marker
    const createCustomMarker = () => {
      // Create canvas for custom marker
      const canvas = document.createElement('canvas');
      canvas.width = 60;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      
      // Draw professional pin with blue color theme
      ctx.clearRect(0, 0, 60, 60);
      
      // Pin body with gradient
      const gradient = ctx.createLinearGradient(30, 10, 30, 35);
      gradient.addColorStop(0, '#0A66C2');
      gradient.addColorStop(1, '#0077B5');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(30, 20, 12, Math.PI, Math.PI * 2);
      ctx.lineTo(30, 48);
      ctx.lineTo(18, 20);
      ctx.closePath();
      ctx.fill();
      
      // White center
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(30, 20, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Blue dot in center
      ctx.fillStyle = '#0A66C2';
      ctx.beginPath();
      ctx.arc(30, 20, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Convert to image URL
      const dataURL = canvas.toDataURL();
      el.style.backgroundImage = `url(${dataURL})`;
    };
    
    // Check if SVG exists, fallback to custom design
    fetch(markerIconSvg)
      .then(response => {
        if (response.ok) {
          el.style.backgroundImage = `url(${markerIconSvg})`;
        } else {
          createCustomMarker();
        }
      })
      .catch(() => {
        createCustomMarker();
      });
      
    el.style.backgroundSize = "contain";
    el.style.backgroundRepeat = "no-repeat";
    el.style.backgroundPosition = "center";
    el.style.cursor = "pointer";

    // Add enhanced professional shadow effect
    el.style.filter = "drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3))";
    el.style.transform = "translate(-50%, -100%)";
    
    // Create a popup with enhanced professional styling for the default marker
    const popup = new mapboxgl.Popup({ offset: 28, closeButton: true, className: "startup-popup" }).setHTML(
      `<div style="font-family: 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif; overflow: hidden; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #0A66C2, #0077B5); color: #fff; padding: 16px;">
          <div style="font-weight: 600; font-size: 16px; letter-spacing: -0.01em;">Cebu Startup Hub</div>
          <div style="opacity: 0.9; font-size: 12px; margin-top: 3px;">Business District</div>
        </div>
        <div style="padding: 14px 16px; background: #fff;">
          <div style="display: flex; align-items: center; font-size: 13px; color: #4B5563; margin-bottom: 2px;">
            <svg style="width: 14px; height: 14px; margin-right: 6px; flex-shrink: 0;" fill="none" stroke="#0A66C2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span>Cebu City, Philippines</span>
          </div>
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #f0f0f0;">
            <div style="font-size: 12px; color: #4B5563; display: flex; align-items: center;">
              <svg style="width: 14px; height: 14px; margin-right: 6px; flex-shrink: 0;" fill="none" stroke="#4B5563" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Click to set your startup location</span>
            </div>
          </div>
        </div>
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

  // Add 3D buildings to the map - Professional enhanced version
  const add3DBuildings = (map) => {
    // First add ambient occlusion shadow layer for depth
    createBuildingPattern(map);

    // Enhanced shadow layer with better depth perception
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
        "fill-extrusion-height": ["*", ["to-number", ["get", "height"]], 1.03],
        "fill-extrusion-base": ["to-number", ["get", "min_height"]],
        "fill-extrusion-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          12, 0.08,
          16, 0.15,
          18, 0.20
        ],
        "fill-extrusion-translate": [4, 4],
        "fill-extrusion-vertical-gradient": false,
      },
    });

    // Main building layer with professional lighting and materials
    map.addLayer(
      {
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 11,
        paint: {
          // Sophisticated color scheme with realistic building materials
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["to-number", ["get", "height"]],
            0,
            "#f0f4f8", // Light concrete/stone for low buildings
            15,
            "#e3ebf2", // Slightly darker
            30,
            "#d5dfe8", // Modern office buildings
            50,
            "#c8d6e3", // Mid-rise glass/concrete
            80,
            "#b5c9dd", // Glass towers
            120,
            "#a3bfd7", // Premium glass facades
            200,
            "#8fb1cf", // Iconic skyscrapers
            300,
            "#7aa3c7", // Landmark towers
          ],
          // Realistic height with smooth transitions
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            11,
            ["*", ["to-number", ["get", "height"]], 0.6],
            13,
            ["*", ["to-number", ["get", "height"]], 0.8],
            15,
            ["*", ["to-number", ["get", "height"]], 0.95],
            17,
            ["to-number", ["get", "height"]],
          ],
          "fill-extrusion-base": ["to-number", ["get", "min_height"]],
          "fill-extrusion-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            11, 0.70,
            14, 0.85,
            16, 0.92,
            18, 0.95,
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

  // Add water features with enhanced professional blue color
  const enhanceWaterFeatures = (map) => {
    // Modern professional water color
    try {
      if (map.getLayer("water")) {
        map.setPaintProperty("water", "fill-color", "#73b9ed");
        map.setPaintProperty("water", "fill-opacity", 0.95);
      }

      // Add a subtle reflection effect to water
      map.addLayer(
        {
          id: "water-reflection",
          type: "fill",
          source: "composite",
          "source-layer": "water",
          layout: {},
          paint: {
            "fill-color": "#9dd1f7",
            "fill-opacity": 0.15,
          },
        },
        "waterway-label"
      );
    } catch (e) {
      console.log("Water styling not fully supported with Standard style");
    }
  };

  // Enhance roads and road labels with professional styling
  const enhanceRoadLabels = (map) => {
    // Check if the layer exists before modifying it
    if (map.getLayer("road-label")) {
      map.setLayoutProperty("road-label", "visibility", "visible");
      map.setLayoutProperty("road-label", "text-size", [
        "interpolate",
        ["linear"],
        ["zoom"],
        12, 9,
        16, 13,
        20, 20,
      ]);
    }

    if (map.getLayer("road-major-label")) {
      map.setPaintProperty("road-major-label", "text-color", "#2c3e50");
      map.setPaintProperty(
        "road-major-label",
        "text-halo-color",
        "rgba(255, 255, 255, 1.0)"
      );
      map.setPaintProperty("road-major-label", "text-halo-width", 3);
      map.setPaintProperty("road-major-label", "text-halo-blur", 1);
    }

    // Modern professional road colors matching Google Maps/Apple Maps style
    if (map.getLayer("road")) {
      map.setPaintProperty("road", "line-color", [
        "interpolate",
        ["linear"],
        ["zoom"],
        12, "#ffffff",
        16, "#ffffff",
        20, "#fafafa"
      ]);
    }
    if (map.getLayer("road-secondary-tertiary")) {
      map.setPaintProperty("road-secondary-tertiary", "line-color", [
        "interpolate",
        ["linear"],
        ["zoom"],
        12, "#fefefe",
        16, "#fcfcfc",
        20, "#f8f8f8"
      ]);
    }
    if (map.getLayer("road-primary")) {
      map.setPaintProperty("road-primary", "line-color", [
        "interpolate",
        ["linear"],
        ["zoom"],
        12, "#ffe89e",
        16, "#ffd76f",
        20, "#ffc940"
      ]);
    }
    if (map.getLayer("road-motorway-trunk")) {
      map.setPaintProperty("road-motorway-trunk", "line-color", [
        "interpolate",
        ["linear"],
        ["zoom"],
        12, "#ff8c42",
        16, "#ff7f2e",
        20, "#ff6f1a"
      ]);
    }

    // Enhanced road visibility with smooth scaling and borders
    if (map.getLayer("road")) {
      map.setPaintProperty("road", "line-width", [
        "interpolate",
        ["exponential", 1.6],
        ["zoom"],
        12, 1.2,
        16, 3,
        20, 6,
      ]);
      // Add subtle road border for depth
      map.setPaintProperty("road", "line-opacity", [
        "interpolate",
        ["linear"],
        ["zoom"],
        12, 0.9,
        16, 0.95,
        20, 1.0,
      ]);
    }
    if (map.getLayer("road-primary")) {
      map.setPaintProperty("road-primary", "line-width", [
        "interpolate",
        ["exponential", 1.6],
        ["zoom"],
        12, 2,
        16, 4.5,
        20, 9,
      ]);
    }
    if (map.getLayer("road-motorway-trunk")) {
      map.setPaintProperty("road-motorway-trunk", "line-width", [
        "interpolate",
        ["exponential", 1.6],
        ["zoom"],
        12, 3,
        16, 6,
        20, 12,
      ]);
    }
  };

  // Add trees and vegetation for realism
  const addTreesAndVegetation = (map) => {
    // Add parks and green spaces with 3D trees
    if (map.getLayer("landuse")) {
      map.setPaintProperty("landuse", "fill-color", [
        "match",
        ["get", "class"],
        "park", "#8fbc8f",
        "wood", "#6b8e23",
        "grass", "#9acd32",
        "garden", "#90ee90",
        "#e5e5e5"
      ]);
      map.setPaintProperty("landuse", "fill-opacity", 0.7);
    }

    // Add 3D tree representations for parks
    map.addLayer({
      id: "park-trees-3d",
      type: "fill-extrusion",
      source: "composite",
      "source-layer": "landuse",
      filter: ["in", "class", "park", "wood", "nature_reserve"],
      minzoom: 14,
      paint: {
        "fill-extrusion-color": [
          "interpolate",
          ["linear"],
          ["zoom"],
          14, "#5a7a3c",
          18, "#4a6a2c"
        ],
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          14, 3,
          16, 8,
          18, 12
        ],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.6,
        "fill-extrusion-vertical-gradient": true,
      },
    });
  };

  // Add elevated structures like bridges and overpasses
  const addElevatedStructures = (map) => {
    // Enhanced bridge rendering
    if (map.getLayer("bridge")) {
      map.setPaintProperty("bridge", "line-color", "#556b7d");
      map.setPaintProperty("bridge", "line-width", [
        "interpolate",
        ["linear"],
        ["zoom"],
        12, 2,
        16, 5,
        20, 10
      ]);
    }

    // Add 3D bridge structures
    map.addLayer({
      id: "bridge-3d-structure",
      type: "fill-extrusion",
      source: "composite",
      "source-layer": "road",
      filter: ["==", ["get", "structure"], "bridge"],
      minzoom: 14,
      paint: {
        "fill-extrusion-color": "#6b7d8f",
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          14, 8,
          16, 12,
          18, 15
        ],
        "fill-extrusion-base": [
          "interpolate",
          ["linear"],
          ["zoom"],
          14, 5,
          16, 8,
          18, 10
        ],
        "fill-extrusion-opacity": 0.8,
        "fill-extrusion-vertical-gradient": true,
      },
    });

    // Add bridge support pillars
    map.addLayer({
      id: "bridge-pillars",
      type: "fill-extrusion",
      source: "composite",
      "source-layer": "road",
      filter: ["==", ["get", "structure"], "bridge"],
      minzoom: 16,
      paint: {
        "fill-extrusion-color": "#4a5a6a",
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          16, 8,
          18, 12
        ],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.9,
      },
    });
  };

  // Add dynamic lighting effects based on time simulation
  const addDynamicLighting = (map) => {
    // Simulate different times of day (you can make this dynamic)
    const timeOfDay = "day"; // Options: "dawn", "day", "dusk", "night"
    
    // Set the light preset and adjust colors for Standard style
    switch(timeOfDay) {
      case "dawn":
        map.setConfigProperty("lightPreset", "dawn");
        // Warmer colors for dawn
        map.setConfigProperty("basemap", "colorWater", "#a8c7e0");
        map.setConfigProperty("basemap", "colorGreenspace", "#8fac7e");
        map.setConfigProperty("basemap", "colorRoads", "#f5f5f5");
        map.setConfigProperty("basemap", "colorMotorways", "#ffb074");
        break;
      case "day":
        map.setConfigProperty("lightPreset", "day");
        // Bright vibrant colors for day (professional modern style)
        map.setConfigProperty("basemap", "colorWater", "#73b9ed");
        map.setConfigProperty("basemap", "colorGreenspace", "#9dc183");
        map.setConfigProperty("basemap", "colorRoads", "#ffffff");
        map.setConfigProperty("basemap", "colorMotorways", "#ff8c42");
        break;
      case "dusk":
        map.setConfigProperty("lightPreset", "dusk");
        // Warm orange tones for dusk
        map.setConfigProperty("basemap", "colorWater", "#6a9fc4");
        map.setConfigProperty("basemap", "colorGreenspace", "#7a9470");
        map.setConfigProperty("basemap", "colorRoads", "#e8e8e8");
        map.setConfigProperty("basemap", "colorMotorways", "#ff9959");
        break;
      case "night":
        map.setConfigProperty("lightPreset", "night");
        // Dark muted colors for night
        map.setConfigProperty("basemap", "colorWater", "#3d5a73");
        map.setConfigProperty("basemap", "colorGreenspace", "#3a4f3a");
        map.setConfigProperty("basemap", "colorRoads", "#4a4a4a");
        map.setConfigProperty("basemap", "colorMotorways", "#cc6633");
        break;
      default:
        map.setConfigProperty("lightPreset", "day");
    }

    // Add custom lighting effects for night/dusk
    if (timeOfDay === "night" || timeOfDay === "dusk") {
      // Adjust label colors for better visibility at night
      map.setConfigProperty("basemap", "colorPlaceLabels", "#f0f0f0");
      map.setConfigProperty("basemap", "colorRoadLabels", "#e0e0e0");
      map.setConfigProperty("basemap", "colorPointOfInterestLabels", "#d0d0d0");
      
      // Enhance fog for night atmosphere
      map.setFog({
        range: [0.5, 8],
        color: "rgba(30, 40, 60, 0.6)",
        "horizon-blend": 0.15,
        "high-color": "rgba(40, 50, 70, 0.8)",
        "space-color": "rgba(20, 30, 50, 0.4)",
        "star-intensity": 0.5,
      });
      
      // Try to add building lights if custom layers are supported
      try {
        map.addLayer({
          id: "building-windows-lit",
          type: "fill-extrusion",
          source: "composite",
          "source-layer": "building",
          filter: ["all", ["==", "extrude", "true"], [">", ["to-number", ["get", "height"]], 20]],
          minzoom: 14,
          paint: {
            "fill-extrusion-color": "#ffe8b3",
            "fill-extrusion-height": ["*", ["to-number", ["get", "height"]], 0.995],
            "fill-extrusion-base": ["to-number", ["get", "min_height"]],
            "fill-extrusion-opacity": 0.8,
            "fill-extrusion-vertical-gradient": true,
          },
        });
      } catch (e) {
        console.log("Custom building lights not supported with Standard style");
      }

      // Add street lights with warm glow
      try {
        map.addLayer({
          id: "street-lights",
          type: "circle",
          source: "composite",
          "source-layer": "road",
          minzoom: 16,
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              16, 2.5,
              20, 7
            ],
            "circle-color": "#ffe8cc",
            "circle-opacity": 0.9,
            "circle-blur": 0.8,
          },
        });
      } catch (e) {
        console.log("Street lights not supported with Standard style");
      }
    }
  };

  // Toggle between 3D and 2D view
  const toggle3DView = () => {
    const map = mapInstanceRef.current;
    setIs3DActive(!is3DActive);

    if (!is3DActive) {
      // Enable 3D with dramatic perspective
      map.easeTo({
        pitch: 67.95, // High pitch for dramatic 3D view
        bearing: 56.76, // Angled bearing for better perspective
        duration: 1000,
      });
    } else {
      // Disable 3D - flatten view
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
      className={`absolute top-4 left-4 transition-all duration-300 ease-in-out ${
        isSearchExpanded ? "w-96" : "w-12"
      }`}
      style={{ zIndex: 9999 }}
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
                        <img 
                          src="/startup-marker.png" 
                          onError={(e) => {e.target.src = "/location.png"}}
                          alt="Startup" 
                          style={{
                            width: '15px',
                            height: '15px',
                            objectFit: 'contain',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            filter: 'drop-shadow(0 1px 2px rgba(10, 102, 194, 0.2))'
                          }}
                        />
                      ) : suggestion.type === "stakeholder" ? (
                        <img 
                          src="/stakeholder-icon.png" 
                          alt="Stakeholder" 
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid white',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.15)'
                          }}
                        />
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
    
    // Add global CSS for stakeholder markers to ensure they're always visible with professional styling
    if (!document.getElementById('stakeholder-marker-global-styles')) {
      const style = document.createElement('style');
      style.id = 'stakeholder-marker-global-styles';
      style.innerHTML = `
        .stakeholder-marker {
          z-index: 1000 !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: all !important;
          /* Let Mapbox manage transforms; no translate here */
          transform-origin: center;
          will-change: transform;
          transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        
        .stakeholder-marker img {
          filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.1));
          transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          backface-visibility: hidden;
          border-radius: 50%;
          width: 14px; /* Much smaller, more professional size */
          height: 14px; /* Much smaller, more professional size */
          object-fit: cover;
        }
        
        /* Fallback for when image doesn't load */
        .stakeholder-marker:empty {
          background-color: #8B5CF6 !important; /* Violet fallback color */
          position: relative !important;
        }
        
        .stakeholder-marker:empty:after {
          content: "";
          position: absolute;
          width: 60%;
          height: 60%;
          background-color: rgba(255,255,255,0.3);
          border-radius: 50%;
          top: 20%;
          left: 20%;
        }
        
        .stakeholder-marker:hover {
          z-index: 1010 !important;
          transform: scale(1.02); /* Minimal scale for professional look */
        }
        
        .stakeholder-marker:hover img {
          filter: drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.15));
          transition: all 0.2s ease-out;
          border: 0.5px solid rgba(255, 255, 255, 0.6); /* Very subtle border highlight */
        }
        
        .stakeholder-marker:active img {
          transform: scale(0.98);
          filter: drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.2));
        }
        
        .mapboxgl-popup.stakeholder-popup {
          z-index: 1001 !important;
        }
        
        .mapboxgl-popup.stakeholder-popup .mapboxgl-popup-content {
          box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1) !important;
          border: 1px solid rgba(0,0,0,0.05) !important;
          border-radius: 12px !important;
          padding: 16px !important;
          max-width: 320px !important;
          color: #1F2937;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .mapboxgl-popup-content h3 {
          margin-top: 0;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 16px;
          line-height: 1.4;
        }
        
        .mapboxgl-popup-close-button {
          font-size: 18px;
          padding: 6px 10px;
          color: #6B7280;
          right: 2px;
          top: 2px;
          transition: all 0.2s ease;
        }
        
        .mapboxgl-popup-close-button:hover {
          color: #1F2937;
          background: rgba(243, 244, 246, 0.7);
          border-radius: 50%;
        }
        
        .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
          border-top-color: white !important;
          filter: drop-shadow(0 3px 2px rgba(0,0,0,0.1));
        }
        
        .mapboxgl-popup-anchor-top .mapboxgl-popup-tip {
          border-bottom-color: white !important;
          filter: drop-shadow(0 -3px 2px rgba(0,0,0,0.1));
        }
      `;
      document.head.appendChild(style);
    }
    
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard",
      config: {
        basemap: {
          colorModePointOfInterestLabels: "single",
          
          // Feature Visibility - Professional settings
          showPedestrianRoads: true,
          showPlaceLabels: true,
          showPointOfInterestLabels: true,
          showRoadLabels: true,
          showTransitLabels: false, // Hide transit for cleaner look
          show3dObjects: true, // Enable 3D objects like trees, signs
          showLandmarkIcons: true, // Show landmark building icons
          showLandmarkIconLabels: true, // Show landmark labels
          
          // Typography - Professional font stack
          font: "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          
          // Color Customization - Professional color scheme
          colorAdminBoundaries: "#c0c4cc", // Subtle admin boundaries
          colorGreenspace: "#9dc183", // Fresh, vibrant green for parks
          colorWater: "#73b9ed", // Professional blue water (matches modern map styles)
          colorPlaceLabels: "#1a1a1a", // Deep black for maximum readability
          colorRoadLabels: "#3d3d3d", // Dark gray for professional look
          colorPointOfInterestLabels: "#5a5a5a", // Medium gray for POI labels
          colorMotorways: "#ff8c42", // Orange for highways (professional standard)
          colorTrunks: "#ffa75d", // Lighter orange for trunk roads
          colorRoads: "#ffffff", // Pure white for regular roads (modern style)
        },
        lightPreset: "day", // Options: dawn, day, dusk, night
        theme: "default",
      },
      center: [123.8907, 10.3166], // Cebu City coordinates
      zoom: 18, // Professional zoom level matching the reference
      pitch: 67.95, // High pitch for dramatic 3D view
      bearing: 56.76, // Angled bearing for better perspective
      antialias: true, // Smoother edges for 3D buildings
      maxPitch: 85, // Allow steeper pitch
      projection: "globe", // Globe projection for better 3D effect
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
    
    // Ensure stakeholder icon is preloaded before map load completes
    if (!stakeholderIconRef.current || !stakeholderIconRef.current.complete) {
      console.log("Preloading stakeholder icon during map initialization");
      stakeholderIconRef.current = new Image();
      const iconUrl = `${window.location.origin}/stakeholder-icon.png`;
      stakeholderIconRef.current.src = iconUrl;
      stakeholderIconRef.current.onload = () => console.log("Stakeholder icon loaded during map init");
      stakeholderIconRef.current.onerror = () => {
        console.error("Failed to load stakeholder icon during map init, checking icon availability...");
        
        // Check if the icon is actually accessible via fetch
        fetch(iconUrl)
          .then(response => {
            if (!response.ok) {
              console.error(`Stakeholder icon not accessible: ${response.status} ${response.statusText}`);
            } else {
              console.log("Stakeholder icon is accessible via fetch but failed to load as image");
            }
          })
          .catch(err => {
            console.error("Stakeholder icon fetch error:", err);
          });
      };
    }

    // Add 3D terrain and buildings
    map.on("load", () => {
      console.log("Map loaded, loading markers...");
      
      // Load stakeholders first to ensure they're displayed
      loadStakeholders(map);
      
      // The Standard style has built-in 3D buildings and terrain
      // We'll customize the appearance with configuration
      
      // Advanced Feature Visibility Configuration
      map.setConfigProperty("basemap", "showPedestrianRoads", true);
      map.setConfigProperty("basemap", "showPlaceLabels", true);
      map.setConfigProperty("basemap", "showRoadLabels", true);
      map.setConfigProperty("basemap", "showPointOfInterestLabels", true);
      map.setConfigProperty("basemap", "showTransitLabels", false);
      map.setConfigProperty("basemap", "show3dObjects", true);
      map.setConfigProperty("basemap", "showLandmarkIcons", true);
      map.setConfigProperty("basemap", "showLandmarkIconLabels", true);
      
      // Professional Typography
      map.setConfigProperty("basemap", "font", "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
      
      // Professional Color Scheme
      map.setConfigProperty("basemap", "colorAdminBoundaries", "#c0c4cc");
      map.setConfigProperty("basemap", "colorGreenspace", "#9dc183");
      map.setConfigProperty("basemap", "colorWater", "#73b9ed");
      map.setConfigProperty("basemap", "colorPlaceLabels", "#1a1a1a");
      map.setConfigProperty("basemap", "colorRoadLabels", "#3d3d3d");
      map.setConfigProperty("basemap", "colorPointOfInterestLabels", "#5a5a5a");
      map.setConfigProperty("basemap", "colorMotorways", "#ff8c42");
      map.setConfigProperty("basemap", "colorTrunks", "#ffa75d");
      map.setConfigProperty("basemap", "colorRoads", "#ffffff");
      
      // Set lighting preset for professional look
      map.setConfigProperty("lightPreset", "day");
      
      // Enable enhanced fog for depth perception (Standard style supports fog natively)
      map.setFog({
        range: [0.5, 12],
        color: [
          "interpolate",
          ["linear"],
          ["zoom"],
          10, "rgba(220, 230, 245, 0.4)",
          15, "rgba(235, 240, 248, 0.5)",
        ],
        "horizon-blend": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10, 0.08,
          15, 0.12,
        ],
        "high-color": "rgba(245, 248, 252, 0.9)",
        "space-color": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10, "rgba(200, 220, 240, 0.2)",
          15, "rgba(210, 228, 245, 0.3)",
        ],
        "star-intensity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10, 0.1,
          15, 0.2,
        ],
      });

      // Add custom layers on top of Standard style
      // Add trees and vegetation
      addTreesAndVegetation(map);

      // Add extra building details when zoomed in
      addBuildingDetails(map);

      // Add building labels when available
      addBuildingLabels(map);

      // Enhance water features
      enhanceWaterFeatures(map);

      // Enhance road labels
      enhanceRoadLabels(map);
      
      // Add elevated structures (bridges, overpasses)
      addElevatedStructures(map);
      
      // Add dynamic lighting effects
      addDynamicLighting(map);

      // Add default startup marker for Cebu
      addDefaultStartupMarker(map);

      // Load markers after 3D is set up
      loadStartupMarkers(map);
      // loadInvestorMarkers(map); // removed
      
      // Ensure data refresh shortly after load
      setTimeout(() => loadStakeholders(map), 500);

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
            "line-blur": 3
          },
        });

        for (let layer = 1; layer < numLayers; layer++) {
          const layerId = `${sourceId}-layer-${layer}`;
          const opacity = 0.3 + (layer / numLayers) * 0.7;
          const lineWidth = 1.5 + (layer / numLayers) * 2.5;
          const vertOffset = 0; // no viewport offset to keep endpoints aligned

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
              "line-translate": [0, 0],
              "line-translate-anchor": "map",
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
            "line-translate-anchor": "map",
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
            "line-translate-anchor": "map",
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
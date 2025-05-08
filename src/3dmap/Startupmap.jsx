import { useState, useEffect, useRef } from "react";
import Login from "../modals/Login";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { Search, X } from "lucide-react";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYWxwcmluY2VsbGF2YW4iLCJhIjoiY204djkydXNoMGZsdjJvc2RnN3B5NTdxZCJ9.wGaWS8KJXPBYUzpXh91Dww";

export default function Startupmap({
  mapInstanceRef,
  onMapClick,
  onLoginSuccess,
}) {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderContainerRef = useRef(null);
  const [is3DActive, setIs3DActive] = useState(true);
  const [startupMarkers, setStartupMarkers] = useState([]);
  const [investorMarkers, setInvestorMarkers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filteredStartups, setFilteredStartups] = useState([]);
  const [filteredInvestors, setFilteredInvestors] = useState([]);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [currentGeojsonBoundary, setCurrentGeojsonBoundary] = useState(null);

  const loadStartupMarkers = async (map) => {
    try {
      const response = await fetch("http://localhost:8080/startups/approved", {
        credentials: "include",
      });
      const startups = await response.json();
      setStartupMarkers(startups);
      setFilteredStartups(startups);

      // Render startup markers
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

  const loadInvestorMarkers = async (map) => {
    try {
      const response = await fetch("http://localhost:8080/investors", {
        credentials: "include",
      });
      const investors = await response.json();
      setInvestorMarkers(investors);
      setFilteredInvestors(investors);

      // Render investor markers
      renderInvestorMarkers(map, investors);

      return investors;
    } catch (error) {
      console.error("Failed to load investors:", error);
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

  // Add 3D buildings to the map - Updated for light color palette like the image
  const add3DBuildings = (map) => {
    // Add 3D building layer from Mapbox with light colors
    map.addLayer({
      id: "3d-buildings",
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: "fill-extrusion",
      minzoom: 13, // Lower minzoom to show buildings from further away
      paint: {
        "fill-extrusion-color": [
          "interpolate",
          ["linear"],
          ["get", "height"],
          0,
          "#f0f0f0", // Very light gray for small buildings
          50,
          "#e8e8e8", // Light gray
          100,
          "#e0e0e0", // Slightly darker
          200,
          "#d8d8d8", // For taller buildings
        ],
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          13,
          0,
          14,
          ["get", "height"],
        ],
        "fill-extrusion-base": [
          "interpolate",
          ["linear"],
          ["zoom"],
          13,
          0,
          14,
          ["get", "min_height"],
        ],
        "fill-extrusion-opacity": 0.8,
      },
    });
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
  };

  // Handle search input change
  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

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

    if (!searchInput.trim()) return;

    const map = mapInstanceRef.current;
    const query = searchInput.trim();

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
            zoom: 12, // Slightly zoomed out to show more context
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

    // Close expanded search after submission
    setIsSearchExpanded(false);
  };

  useEffect(() => {
    // Initialize map with Cebu as center
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12", // Changed to streets style for better landmark visibility
      center: [123.8854, 10.3157], // Cebu City coordinates
      zoom: 18, // Adjusted zoom level
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

      // Add 3D buildings with light colors
      add3DBuildings(map);

      // Enhance water features
      enhanceWaterFeatures(map);

      // Enhance road labels and make roads dark gray
      enhanceRoadLabels(map);

      // Add default startup marker for Cebu
      addDefaultStartupMarker(map);

      // Load markers after 3D is set up
      loadStartupMarkers(map);
      loadInvestorMarkers(map);
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        ref={mapContainerRef}
        className="fixed top-0 left-0 w-full h-full z-0"
        style={{ width: "100%", height: "100%" }}
      />
      <div
        className={`absolute top-4 left-4 z-10 transition-all duration-300 ease-in-out ${
          isSearchExpanded ? "w-80" : "w-12"
        }`}
      >
        <div className="bg-white rounded-full shadow-md overflow-hidden border border-gray-300 transition-shadow duration-300 hover:shadow-lg">
          <div className="flex items-center">
            {isSearchExpanded ? (
              <>
                <div className="flex items-center flex-1 pl-4">
                  <Search className="h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    placeholder="Search places..."
                    className="px-3 py-2 w-full text-sm text-gray-800 search-input"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchSubmit(e);
                      }
                    }}
                  />
                </div>
                <div className="flex items-center pr-2">
                  <button
                    onClick={handleSearchSubmit}
                    className="p-2 text-blue-500 hover:text-blue-600 transition-colors duration-200"
                    title="Search"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                  <button
                    onClick={toggleSearchExpanded}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    title="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={toggleSearchExpanded}
                className="w-full h-full p-3 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
                title="Expand search"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

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
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            3D
          </>
        )}
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

import { useState, useEffect, useRef } from "react";
import Login from "../modals/Login";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import startupMarkerIcon from "/public/startup-marker.svg";

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

  const loadStartupMarkers = async (map) => {
    try {
      const response = await fetch("http://localhost:8080/startups/approved", {
        credentials: "include",
      });
      const startups = await response.json();

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
          new mapboxgl.Marker({
            element: el,
            anchor: "bottom",
          })
            .setLngLat([startup.locationLng, startup.locationLat])
            .setPopup(popup)
            .addTo(map);
        } else {
          console.warn(
            `Invalid location for startup: ${startup.companyName}`,
            startup
          );
        }
      });
    } catch (error) {
      console.error("Failed to load startups:", error);
    }
  };

  const loadInvestorMarkers = async (map) => {
    try {
      const response = await fetch("http://localhost:8080/investors", {
        credentials: "include",
      });
      const investors = await response.json();

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

          new mapboxgl.Marker({
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
        } else {
          console.warn(
            `Invalid location for investor: ${investor.firstname} ${investor.lastname}`,
            investor
          );
        }
      });
    } catch (error) {
      console.error("Failed to load investors:", error);
    }
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

  useEffect(() => {
    // Initialize map with Cebu as center
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12", // Changed to streets style for better landmark visibility
      center: [123.8854, 10.3157], // Cebu City coordinates
      zoom: 15, // Adjusted zoom level
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
        ref={geocoderContainerRef}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-3/4 max-w-lg"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      />

      {/* 3D Toggle Button */}
      <button
        onClick={toggle3DView}
        className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-md shadow-md z-10 font-medium"
        style={{
          backgroundColor: "white",
          color: "#333",
          padding: "8px 16px",
          borderRadius: "4px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          zIndex: 10,
          cursor: "pointer",
          fontSize: "14px",
          border: "none",
          outline: "none",
        }}
      >
        {is3DActive ? "2D View" : "3D View"}
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

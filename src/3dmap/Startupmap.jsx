import { useState, useEffect, useRef } from "react";
import Login from "../modals/Login";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"; // Import Geocoder CSS
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYWxwcmluY2VsbGF2YW4iLCJhIjoiY204djkydXNoMGZsdjJvc2RnN3B5NTdxZCJ9.wGaWS8KJXPBYUzpXh91Dww";

export default function Startupmap({ mapInstanceRef, onMapClick }) {
  const [openLogin, setOpenLogin] = useState(false);
  const mapContainerRef = useRef(null);
  const [userMarker, setUserMarker] = useState(null); 
  const markerRef = useRef(null);
  const geocoderContainerRef = useRef(null);

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
          const markerElement = document.createElement("div");
          markerElement.style.display = "flex";
          markerElement.style.flexDirection = "column";
          markerElement.style.alignItems = "center";

          const markerIcon = document.createElement("div");
          markerIcon.style.width = "20px";
          markerIcon.style.height = "20px";
          markerIcon.style.backgroundColor = "red";
          markerIcon.style.borderRadius = "50%";
          markerIcon.style.cursor = "pointer";
          markerElement.appendChild(markerIcon);

          const markerLabel = document.createElement("div");
          markerLabel.textContent = startup.companyName;
          markerLabel.style.marginTop = "2px";
          markerLabel.style.textAlign = "center";
          markerLabel.style.color = "black";
          markerLabel.style.fontSize = "12px";
          markerLabel.style.fontFamily = "Arial, sans-serif";
          markerElement.appendChild(markerLabel);

          new mapboxgl.Marker({ color: "red" })
            .setLngLat([startup.locationLng, startup.locationLat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<div style="color: black; font-family: Arial, sans-serif;">
        <h3 style="margin: 0; color: black;">${startup.companyName}</h3>
        <p style="margin: 0; color: black;">${startup.locationName}</p>
      </div>`
              )
            )
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
          const markerElement = document.createElement("div");
          markerElement.style.display = "flex";
          markerElement.style.flexDirection = "column";
          markerElement.style.alignItems = "center";

          const markerIcon = document.createElement("div");
          markerIcon.style.width = "20px";
          markerIcon.style.height = "20px";
          markerIcon.style.backgroundColor = "blue";
          markerIcon.style.borderRadius = "50%";
          markerIcon.style.cursor = "pointer";
          markerElement.appendChild(markerIcon);

          const markerLabel = document.createElement("div");
          markerLabel.textContent = `${investor.firstname} ${investor.lastname}`;
          markerLabel.style.marginTop = "2px";
          markerLabel.style.textAlign = "center";
          markerLabel.style.color = "black";
          markerLabel.style.fontSize = "12px";
          markerLabel.style.fontFamily = "Arial, sans-serif";
          markerElement.appendChild(markerLabel);

          new mapboxgl.Marker(markerElement)
            .setLngLat([
              parseFloat(investor.locationLang),
              parseFloat(investor.locationLat),
            ])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<div style="color: black; font-family: Arial, sans-serif;">
                  <h3 style="margin: 0; color: black;">${investor.firstname} ${investor.lastname}</h3>
                  <p style="margin: 0; color: black;">${investor.locationName}</p>
                </div>`
              )
            )
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

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [120.9842, 14.5995],
      zoom: 12,
    });

    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    mapInstanceRef.current = map;
    map.resize();

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false, // Disable default marker
      placeholder: "Search for places...", // Placeholder text in the search bar
    });

    if (geocoderContainerRef.current) {
      geocoderContainerRef.current.innerHTML = "";
      geocoderContainerRef.current.appendChild(geocoder.onAdd(map));
    }

    geocoder.on("result", (event) => {
      const { center } = event.result; // Get the coordinates of the searched location
      map.flyTo({
        center: center, // Navigate to the searched location
        zoom: 14, // Set the zoom level
        essential: true, // This ensures the animation is smooth
      });

      // Add a marker at the searched location
      if (markerRef.current) {
        markerRef.current.remove(); // Remove the previous marker if it exists
      }
      markerRef.current = new mapboxgl.Marker({ color: "green" })
        .setLngLat(center)
        .addTo(map);
    });

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;

      // Remove the previous marker if it exists
      if (markerRef.current) {
        markerRef.current.remove();
      }

      const newMarker = new mapboxgl.Marker({ color: "red" })
        .setLngLat([lng, lat])
        .addTo(map);

      markerRef.current = newMarker;

      // Pass the latitude and longitude to the parent component
      if (onMapClick) {
        onMapClick(lat, lng);
      }
    });

    loadStartupMarkers(map);
    loadInvestorMarkers(map);

    return () => map.remove();
  }, []); // Empty dependency array ensures this runs only once // Removed userMarker from dependencies

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
          top: "10px", // Adjust the distance from the top
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      />
  
      {openLogin && (
        <Login
          closeModal={() => setOpenLogin(false)}
          openRegister={() => {
            setOpenLogin(false);
            setOpenRegister(true);
          }}
          onLoginSuccess={() => {
            setIsAuthenticated(true);
            setOpenLogin(false);
          }}
        />
      )}
    </div>
  );
}

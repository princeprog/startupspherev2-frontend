import { useState, useEffect, useRef } from "react";
import Login from "../modals/Login";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYWxwcmluY2VsbGF2YW4iLCJhIjoiY204djkydXNoMGZsdjJvc2RnN3B5NTdxZCJ9.wGaWS8KJXPBYUzpXh91Dww";

export default function Startupmap({ mapInstanceRef, onMapClick }) {
  const [openLogin, setOpenLogin] = useState(false);
  const mapContainerRef = useRef(null);
  const [userMarker, setUserMarker] = useState(null); // State to manage the single marker
  const markerRef = useRef(null);

  // Fetch startups and place markers
  const loadStartupMarkers = async (map) => {
    try {
      const response = await fetch("http://localhost:8080/startups", {
        credentials: "include",
      });
      const startups = await response.json();

      startups.forEach((startup) => {
        // Validate latitude and longitude
        if (
          typeof startup.locationLng === "number" &&
          typeof startup.locationLat === "number" &&
          startup.locationLat >= -90 &&
          startup.locationLat <= 90 &&
          startup.locationLng >= -180 &&
          startup.locationLng <= 180
        ) {
          // Create a custom marker element
          const markerElement = document.createElement("div");
          markerElement.style.display = "flex";
          markerElement.style.flexDirection = "column";
          markerElement.style.alignItems = "center";

          // Add the marker icon (red dot)
          const markerIcon = document.createElement("div");
          markerIcon.style.width = "20px";
          markerIcon.style.height = "20px";
          markerIcon.style.backgroundColor = "red";
          markerIcon.style.borderRadius = "50%";
          markerIcon.style.cursor = "pointer";
          markerElement.appendChild(markerIcon);

          // Add the company name below the marker
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
    <div className="relative w-screen h-screen">
      <div
        ref={mapContainerRef}
        className="fixed top-0 left-0 w-full h-full z-0"
        style={{ width: "100%", height: "100%" }}
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

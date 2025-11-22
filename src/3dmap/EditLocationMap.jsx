import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYWxwcmluY2VsbGF2YW4iLCJhIjoiY204djkydXNoMGZsdjJvc2RnN3B5NTdxZCJ9.wGaWS8KJXPBYUzpXh91Dww";

export default function EditLocationMap({ 
  onMapClick, 
  initialLocation,
  mapInstanceRef 
}) {
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialLocation 
        ? [initialLocation.lng, initialLocation.lat] 
        : [123.8854, 10.3157], // Default to Cebu
      zoom: initialLocation ? 15 : 12,
      pitch: 45,
      bearing: 0,
      antialias: true,
    });

    // Store map instance
    if (mapInstanceRef) {
      mapInstanceRef.current = map;
    }

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add scale control
    map.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: "metric",
      }),
      "bottom-left"
    );

    map.on("load", () => {
      setMapLoaded(true);
      
      // Add 3D buildings layer
      const layers = map.getStyle().layers;
      let labelLayerId;
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      // Add 3D buildings
      map.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 13,
          paint: {
            "fill-extrusion-color": [
              "interpolate",
              ["linear"],
              ["get", "height"],
              0, "#e3ebf2",
              50, "#c8d6e3",
              100, "#a3bfd7",
            ],
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              13, 0,
              13.5, ["get", "height"],
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              13, 0,
              13.5, ["get", "min_height"],
            ],
            "fill-extrusion-opacity": 0.8,
          },
        },
        labelLayerId
      );

      // If initial location exists, add marker
      if (initialLocation && initialLocation.lat && initialLocation.lng) {
        addMarker(map, initialLocation.lng, initialLocation.lat);
      }
    });

    // Handle map clicks
    map.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      
      // Add or update marker
      addMarker(map, lng, lat);
      
      // Reverse geocode to get location name
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();
        const locationName = data.features[0]?.place_name || "";
        
        // Call parent callback
        if (onMapClick) {
          onMapClick(lat, lng, locationName);
        }
      } catch (error) {
        console.error("Error geocoding:", error);
        if (onMapClick) {
          onMapClick(lat, lng, "");
        }
      }
    });

    // Add cursor pointer on hover
    map.on("mouseenter", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      map.remove();
    };
  }, []);

  // Update marker when initial location changes
  useEffect(() => {
    if (mapLoaded && mapInstanceRef?.current && initialLocation?.lat && initialLocation?.lng) {
      const map = mapInstanceRef.current;
      
      // Fly to new location
      map.flyTo({
        center: [initialLocation.lng, initialLocation.lat],
        zoom: 15,
        duration: 1500,
      });
      
      // Update marker
      addMarker(map, initialLocation.lng, initialLocation.lat);
    }
  }, [initialLocation?.lat, initialLocation?.lng, mapLoaded]);

  const addMarker = (map, lng, lat) => {
    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create custom marker element
    const el = document.createElement("div");
    el.className = "custom-marker";
    el.style.width = "40px";
    el.style.height = "40px";
    el.style.backgroundImage = "url(/startup-marker.png)";
    el.style.backgroundSize = "contain";
    el.style.backgroundRepeat = "no-repeat";
    el.style.backgroundPosition = "center";
    el.style.cursor = "pointer";
    el.style.filter = "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))";

    // Fallback if image doesn't exist
    el.onerror = () => {
      el.style.backgroundImage = "none";
      el.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" 
                fill="#0A66C2"/>
        </svg>
      `;
    };

    // Create and add marker
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
      draggable: false,
    })
      .setLngLat([lng, lat])
      .addTo(map);

    markerRef.current = marker;
  };

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ minHeight: "400px" }}
    />
  );
}

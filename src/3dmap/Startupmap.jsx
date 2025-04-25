import { useState, useEffect, useRef } from "react";
import Sidebar from "../sidebar/Sidebar";
import Login from "../modals/Login";
import Signup from "../modals/Signup";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYWxwcmluY2VsbGF2YW4iLCJhIjoiY204djkydXNoMGZsdjJvc2RnN3B5NTdxZCJ9.wGaWS8KJXPBYUzpXh91Dww";

export default function Startupmap() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null); // Store the map instance

  useEffect(() => {
    // Initialize the Mapbox map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11", // Map style
      center: [120.9842, 14.5995], // Example: Manila coordinates
      zoom: 12,
    });

    // Disable 3D features like pitch and rotation
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    // Store the map instance in a ref
    mapInstanceRef.current = map;

    // Resize the map to fit the container
    map.resize();

    return () => map.remove(); // Clean up on unmount
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/check", {
        method: "GET",
        credentials: "include", // Include cookies for authentication
      });
      const data = await response.json();
      if (response.ok) {
        console.log("User is authenticated: ", data);
        setIsAuthenticated(true); // Set as true if authenticated
      } else {
        console.log("User is not authenticated");
        setIsAuthenticated(false); // Set as false if not authenticated
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false); // Default to not authenticated on error
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        credentials: "include", // Include cookies for authentication
      });

      if (response.ok) {
        console.log("Logout successful");
        setIsAuthenticated(false); // Update state to reflect logged-out status
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  const toggleTooltip = () => {
    setShowTooltip((prev) => !prev);
  };

  return (
    <div className="relative flex w-screen h-screen overflow-hidden">
      {/* Avatar */}
      <div className="absolute top-4 right-4 z-10">
        <div className="relative">
          <div
            className="avatar avatar-placeholder cursor-pointer"
            onClick={toggleTooltip}
          >
            <div className="bg-neutral text-neutral-content w-12 rounded-full">
              {/* Display 'SY' if authenticated, 'G' if not authenticated, or '?' while loading */}
              <span>
                {isAuthenticated === null
                  ? "?" // Loading state
                  : isAuthenticated
                  ? "SY" // Authenticated
                  : "G"}
              </span>
            </div>
          </div>

          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute top-14 right-0 w-32 bg-white border border-gray-300 rounded-lg shadow-lg">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout(); // Logout the user
                    setShowTooltip(false); // Close tooltip
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowTooltip(false);
                      setOpenLogin(true); // Open login modal
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setShowTooltip(false);
                      setOpenRegister(true); // Open register modal
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Sidebar />

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="absolute w-full h-full z-0"
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

      {openRegister && <Signup closeModal={() => setOpenRegister(false)} />}
    </div>
  );
}
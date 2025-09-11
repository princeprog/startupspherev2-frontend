import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuthenticated = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/check`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Authentication status:", data);
          setIsAuthenticated(data); 
        } else {
          console.error("Failed to fetch authentication status");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error fetching authentication status:", error);
        setIsAuthenticated(false); 
      }
    };

    fetchAuthenticated();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  return <Outlet />;
}
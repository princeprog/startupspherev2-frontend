import { useState, useEffect } from "react";
import Login from "../modals/Login";
import Signup from "../modals/Signup";

export default function Sidebar() {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        credentials: "include", // Include cookies for authentication
      });

      if (response.ok) {
        console.log("Logout successful");
        setIsAuthenticated(false); // Update state to reflect logged-out status
        // Clear any authentication-related cookies or local storage
        document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const checkAuthentication = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/check", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok && data.isAuthenticated) {
        console.log("User is authenticated: ", data);
        setIsAuthenticated(true);
      } else {
        console.log("User is not authenticated");
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  return (
    <div className="flex h-screen w-16 flex-col justify-between border-e border-gray-100 bg-white">
      <div>
        <div className="border-t border-gray-100">
          <div className="px-2">
            <ul className="space-y-1 border-t border-gray-100 pt-4">
              <li>
                <a className="group relative flex justify-center rounded-sm px-2 py-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5 opacity-75"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                    />
                  </svg>

                  <span className="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded-sm bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible">
                    Search
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {isAuthenticated ? (
        <div className="sticky inset-x-0 bottom-0 border-t border-gray-100 bg-white p-2">
          <button
            className="group relative flex w-full justify-center rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            onClick={logout}
          >
            Logout
            <span className="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded-sm bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible">
              Logout
            </span>
          </button>
        </div>
      ) : (
        <div className="sticky inset-x-0 bottom-0 border-t border-gray-100 bg-white p-2">
          <button
            className="group relative flex w-full justify-center rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            onClick={() => setOpenLogin(true)}
          >
            Login
            <span className="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded-sm bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible">
              Login
            </span>
          </button>
        </div>
      )}

      {openLogin && (
        <Login
          closeModal={() => setOpenLogin(false)}
          openRegister={() => {
            setOpenLogin(false);
            setOpenRegister(true);
          }}
          onLoginSuccess={() => {
            setIsAuthenticated(true); // Update state to reflect logged-in status
            setOpenLogin(false); // Close the login modal
          }}
        />
      )}

      {openRegister && <Signup closeModal={() => setOpenRegister(false)} />}
    </div>
  );
}
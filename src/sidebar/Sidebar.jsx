import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Login from "../modals/Login";
import Signup from "../modals/Signup";
import { CiLocationOn } from "react-icons/ci";
import { CiGlobe } from "react-icons/ci";
import { GrLike } from "react-icons/gr";
import { FaRegBookmark } from "react-icons/fa";
import { MdKeyboardReturn } from "react-icons/md";

export default function Sidebar({ mapInstanceRef }) {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSearchContainer, setShowSearchContainer] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startup, setStartup] = useState(null);
  const [viewingStartup, setViewingStartup] = useState(null); // New state for viewing mode

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        console.log("Logout successful");
        setIsAuthenticated(false);
        localStorage.removeItem("isAuthenticated");
        document.cookie =
          "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
      if (response.ok && data) {
        console.log("User is authenticated: ", data);
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true"); // Persist state
      } else {
        console.log("User is not authenticated");
        setIsAuthenticated(false);
        localStorage.removeItem("isAuthenticated"); // Clear state
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
      localStorage.removeItem("isAuthenticated"); // Clear state
    }
  };

  const fetchStartups = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/startups", {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error("Network response was not ok: ", data);
      }

      setStartups(data);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedAuthState = localStorage.getItem("isAuthenticated");
    if (storedAuthState === "true") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    checkAuthentication();
  }, []);

  const toggleTooltip = () => {
    setShowTooltip((prev) => !prev);
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      {viewingStartup && (
        <div className="absolute w-fit top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-lg px-4 py-2 z-50 flex items-center space-x-2">
          <button
            className="text-blue-500 hover:underline flex items-center"
            onClick={() => {
              setViewingStartup(null);
              setStartup(viewingStartup);
            }}
          >
            <MdKeyboardReturn className="mr-1 cursor-pointer text-xl" />
          </button>
          <span className="text-black text-sm flex items-center">
            Viewing <p className="font-semibold ml-2"> {viewingStartup.companyName}</p>
          </span>
        </div>
      )}
      {/* Sidebar */}
      <div className="flex h-screen w-16 flex-col justify-between border-e border-gray-100 bg-white/90 z-10">
        <div>
          <div className="border-t border-gray-100">
            <div className="px-2">
              <ul className="space-y-1 border-t border-gray-100 pt-4">
                <li>
                  <button
                    className="group relative flex justify-center rounded-sm px-2 py-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    onClick={() => {
                      fetchStartups();
                      setShowSearchContainer((prev) => !prev);
                    }}
                  >
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
                  </button>
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
      </div>

      {/* Avatar */}
      <div className="absolute top-4 right-4 z-50">
        <div className="relative">
          <div
            className="avatar avatar-placeholder cursor-pointer"
            onClick={toggleTooltip}
          >
            <div className="bg-neutral text-neutral-content w-12 rounded-full">
              <span>
                {isAuthenticated === null ? "?" : isAuthenticated ? "SY" : "G"}
              </span>
            </div>
          </div>

          {showTooltip && (
            <div className="absolute top-14 right-0 w-32 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setShowTooltip(false);
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
                      setOpenLogin(true);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setShowTooltip(false);
                      setOpenRegister(true);
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

      {showSearchContainer && (
        <div className="absolute left-16 top-0 h-screen w-90 bg-gray-100 shadow-lg z-20">
          <div className="p-4 bg-gradient-to-b from-blue-500 to-white relative">
            <button
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
              onClick={() => setShowSearchContainer(false)}
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-lg text-black font-semibold">Search</h2>

            <form className="flex items-center max-w-sm mx-auto">
              <label htmlFor="simple-search" className="sr-only">
                Search
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="simple-search"
                  className="bg-gray-200 border border-gray-300 text-blue-900 text-sm rounded-lg focus:ring-blue-700 focus:border-blue-700 block w-full ps-10 p-2.5"
                  placeholder="Search startup"
                  required
                />
              </div>
              <button
                type="submit"
                className="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
                <span className="sr-only">Search</span>
              </button>
            </form>
            <div className="join join-vertical lg:join-horizontal w-full mt-4">
              <button className="btn bg-white text-black join-item w-[50%] hover:bg-gray-200">
                Startup
              </button>
              <button className="btn join-item w-[50%] bg-white text-black hover:bg-gray-200">
                Investor
              </button>
            </div>
          </div>
          <div>
            {loading ? (
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              startups.map((startup) => (
                <div
                  key={startup.id}
                  onClick={() => {
                    setStartup(startup);
                    setShowSearchContainer(false);
                  }}
                  className="w-full max-w-sm px-4 py-3 bg-gray-300 shadow-md cursor-pointer hover:bg-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-light text-gray-800">
                      {startup.locationName}
                    </span>
                    <span className="px-3 py-1 text-xs text-blue-800 uppercase bg-blue-200 rounded-full dark:bg-blue-300 dark:text-blue-900">
                      {startup.industry}
                    </span>
                  </div>

                  <div>
                    <h1 className="mt-2 text-lg font-semibold text-gray-800">
                      {startup.companyName}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                      {startup.companyDescription}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {startup && !viewingStartup && (
        <div className="absolute left-16 top-0 h-screen w-90 bg-gray-100 shadow-lg z-20">
          <div className="absolute left-0 flex justify-end p-2">
            <MdKeyboardReturn
              className="text-black text-2xl cursor-pointer"
              onClick={() => {
                setStartup(null);
                setShowSearchContainer(true);
              }}
            />
          </div>

          <div className="image bg-gray-400 h-[13rem]"></div>

          <div className="flex justify-between p-4">
            <div>
              <h1 className="text-black">{startup.companyName}</h1>
              <p className="text-black flex items-center">
                <CiLocationOn />
                {startup.locationName}
              </p>
              <p className="text-blue-700 flex items-center">
                <CiGlobe className="text-black" />
                {startup.website}
              </p>
            </div>
            <div>
              <GrLike className="text-black text-2xl" />
            </div>
          </div>

          <h1 className="text-black flex items-center justify-center hover:underline cursor-pointer">
            <FaRegBookmark />
            Add bookmark
          </h1>

          <div className="p-4">
            <button
              className="btn btn-outline btn-warning text-black mr-2"
              onClick={() => {
                if (startup && startup.locationLng && startup.locationLat) {
                  mapInstanceRef.current.flyTo({
                    center: [startup.locationLng, startup.locationLat],
                    zoom: 14,
                    essential: true,
                  });
                  setViewingStartup(startup); // Enter viewing mode
                  setStartup(null);
                }
              }}
            >
              Preview
            </button>
            <button className="btn btn-warning">Update location</button>
          </div>
        </div>
      )}

      <div className={`flex-1`}>
        <Outlet />
      </div>

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

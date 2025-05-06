import { useState, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import Startupmap from "./3dmap/Startupmap";
import Startup from "./startup/Startup";
import Startupadd from "./startup/Startupadd";
import StartupDashboard from "./startup/StartupDashboard";
import AllStartupDashboard from "./startup/AllStartupDashboard";
import UpdateStartup from "./startup/UpdateStartup";

function App() {
  const mapInstanceRef = useRef(null);
  const [user, setUser] = useState(null); // State to store authenticated user details

  // Callback to handle successful login and update user state
  const handleLoginSuccess = (userData) => {
    setUser(userData); // Update user state with fetched user details
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<Sidebar mapInstanceRef={mapInstanceRef} setUserDetails={setUser} />}
      >
        <Route
          index
          element={
            <Startupmap
              mapInstanceRef={mapInstanceRef}
              onLoginSuccess={handleLoginSuccess}
            />
          }
        />
        <Route path="dashboard" element={<Startup />} />
        <Route path="/startup-dashboard" element={<StartupDashboard />} />
        <Route path="/all-startup-dashboard" element={<AllStartupDashboard />} />
        <Route path="/update-startup/:id" element={<UpdateStartup />} />
      </Route>
      <Route path="/add-startup" element={<Startupadd />} />
    </Routes>
  );
}

export default App;
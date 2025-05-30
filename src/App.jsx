import { useState, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import Startupmap from "./3dmap/Startupmap";
import Startupadd from "./startup/Startupadd";
import StartupDashboard from "./startup/StartupDashboard";
import AllStartupDashboard from "./startup/AllStartupDashboard";
import UpdateStartup from "./startup/UpdateStartup";
import ProtectedRoute from "./security/ProtectedRoute";
import { SidebarProvider } from './context/SidebarContext';

function App() {
  const mapInstanceRef = useRef(null);
  const [user, setUser] = useState(null); 

  const handleLoginSuccess = (userData) => {
    setUser(userData); 
  };

  return (
    <SidebarProvider>
      <Routes>
        <Route
          path="/"
          element={
          <Sidebar mapInstanceRef={mapInstanceRef} setUserDetails={setUser} />
        }
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
        <Route element={<ProtectedRoute />}>
            <Route path="/startup-dashboard" element={<StartupDashboard />} />
            <Route
            path="/all-startup-dashboard"
            element={<AllStartupDashboard />}
          />
            <Route path="/update-startup/:id" element={<UpdateStartup />} />
        </Route>
        </Route>
        <Route path="/add-startup" element={<Startupadd />} />
        
      </Routes>
    </SidebarProvider>
  );
}

export default App;

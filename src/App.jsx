import { useState, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import Startupmap from "./3dmap/Startupmap";
import Startupadd from "./startup/Startupadd";
import StartupDashboard from "./startup/StartupDashboard";
import AllStartupDashboard from "./startup/AllStartupDashboard";
import UpdateStartupAlternative from "./startup/UpdateStartupAlternative";
import ProtectedRoute from "./security/ProtectedRoute";
import { SidebarProvider } from "./context/SidebarContext";
import Notification from "./Notifications/Notification";
import StartupDetail from "./startup/StartupDetail";
import AddMethodModal from "./startup/AddMethodModal"; 

function App() {
  const mapInstanceRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isAddMethodModalOpen, setIsAddMethodModalOpen] = useState(false);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const openAddMethodModal = () => {
    setIsAddMethodModalOpen(true);
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
            <Route 
              path="/startup-dashboard" 
              element={<StartupDashboard openAddMethodModal={openAddMethodModal} />} 
            />
            <Route
              path="/all-startup-dashboard"
              element={<AllStartupDashboard />}
            />
            <Route path="/startup/:id" element={<StartupDetail />} />
            <Route path="/notifications" element={<Notification />} />
            <Route
              path="/update-startup/:id"
              element={<UpdateStartupAlternative />}
            />
          </Route>
        </Route>
        <Route path="/add-startup" element={<Startupadd />} />
        
      </Routes>
      <AddMethodModal 
        isOpen={isAddMethodModalOpen} 
        onClose={() => setIsAddMethodModalOpen(false)} 
      />
    </SidebarProvider>
  );
}

export default App;

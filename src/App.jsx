import { useRef } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import Startupmap from "./3dmap/Startupmap";
import Bookmarks from "./sidebar/Bookmarks";
import Startup from "./startup/Startup";
import Addstartup from "./startup/Addstartup";

function App() {
  const mapInstanceRef = useRef(null);

  return (
    <Routes>
      <Route path="/" element={<Sidebar mapInstanceRef={mapInstanceRef} />}>
        <Route index element={<Startupmap mapInstanceRef={mapInstanceRef} />} />
        <Route path="dashboard" element={<Startup/>}/>
      </Route>
      <Route path="/startup" element={<Addstartup/>}/>
    </Routes>
  );
}

export default App;
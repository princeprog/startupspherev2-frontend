import { useRef } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import Startupmap from "./3dmap/Startupmap";
import Startup from "./startup/Startup";
import Startupadd from "./startup/Startupadd";

function App() {
  const mapInstanceRef = useRef(null);

  return (
    <Routes>
      <Route path="/" element={<Sidebar mapInstanceRef={mapInstanceRef} />}>
        <Route index element={<Startupmap mapInstanceRef={mapInstanceRef} />} />
        <Route path="dashboard" element={<Startup/>}/>
      </Route>
      <Route path="/startup" element={<Startupadd/>}/>
    </Routes>
  );
}

export default App;
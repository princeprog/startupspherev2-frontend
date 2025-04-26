import { useRef } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import Startupmap from "./3dmap/Startupmap";

function App() {
  const mapInstanceRef = useRef(null);

  return (
    <Routes>
      <Route path="/" element={<Sidebar mapInstanceRef={mapInstanceRef} />}>
        <Route index element={<Startupmap mapInstanceRef={mapInstanceRef} />} />
      </Route>
    </Routes>
  );
}

export default App;

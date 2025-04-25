import { useState } from 'react'
import './App.css'
import { Router, Routes, Route, Navigate } from "react-router-dom"
import Sidebar from './sidebar/Sidebar'
import Startupmap from './3dmap/Startupmap'
function App() {
  return (
    <Routes>
      <Route path="/home" element={<Startupmap />} />
    </Routes>
  )
}

export default App

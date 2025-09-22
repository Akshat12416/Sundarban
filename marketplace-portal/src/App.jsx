// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Marketplace from "./pages/Marketplace";


export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-black font-bold">CV</div>
            <span className="text-lg font-bold text-green-300">CarbonVault</span>
          </div>
          <div className="flex gap-3">
            <Link to="/" className="text-sm text-gray-300 hover:text-white">Login</Link>
            <Link to="/marketplace" className="text-sm text-gray-300 hover:text-white">Marketplace</Link>
            <Link to="/profile" className="text-sm text-gray-300 hover:text-white">My Profile</Link>
          </div>
        </nav>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        <footer className="border-t border-gray-800 p-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} CarbonVault — Verified Sustainability Every Step
        </footer>
      </div>
    </Router>
  );
}

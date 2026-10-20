// src/components/NavBar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function NavBar() {
  const loc = useLocation();
  const current = (p) => (loc.pathname === p ? "text-green-300" : "text-white");

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur border-b border-green-900">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-green-300 font-bold">CarbonVault</div>
          <div className="text-sm text-gray-300 hidden sm:block">Verified Sustainability Every Step</div>
        </div>
        <div className="flex items-center gap-4">
          <Link className={`hover:underline ${current("/")}`} to="/">Home</Link>
          <Link className={`hover:underline ${current("/new-project")}`} to="/new-project">New Project</Link>
          <Link className={`hover:underline ${current("/projects")}`} to="/projects">My Projects</Link>
          <Link className={`hover:underline ${current("/transfers")}`} to="/transfers">Transfers</Link>
          <Link className={`hover:underline ${current("/marketplace")}`} to="/marketplace">Marketplace</Link>
          <button
            onClick={() => signOut(auth)}
            className="ml-2 bg-green-600 text-black px-3 py-1 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

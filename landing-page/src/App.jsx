import React from "react";
import Navbar from "./Components/Navbar";
import Hero from "./Components/Hero";


export default function App() {
  return (
    // main section
    <div className="min-h-screen max-w-7xl flex flex-col items-start justify-center bg-gradient-to-b from-blue-100 to-blue-300 text-gray-900">
      {/* Hero Section */}
      {/* <header className="text-center p-6">
        <h1 className="text-4xl font-bold mb-2">🌊 Blue Carbon MRV</h1>
        <p className="text-lg">Blockchain-based Registry for Transparent Carbon Credits</p>
      </header> */}
      <Hero />

      {/* Role Selection */}
      {/* <main className="grid md:grid-cols-3 gap-6 mt-10 w-11/12 max-w-5xl"> */}
        {/* Contributor */}
        {/* <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition">
          <h2 className="text-xl font-semibold mb-3">🌱 Contributor</h2>
          <p className="text-sm mb-4">Register land or projects, upload before/after plantation images, and earn credits.</p>
          <a
            href="http://localhost:5173" // contributor-portal local port
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Go to Portal
          </a>
        </div> */}

        {/* Company */}
        {/* <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition">
          <h2 className="text-xl font-semibold mb-3">🏭 Company</h2>
          <p className="text-sm mb-4">Buy carbon credits to offset emissions and meet compliance.</p>
          <a
            href="http://localhost:5174" // company-portal local port
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Portal
          </a>
        </div> */}

        {/* Admin */}
        {/* <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-xl transition">
          <h2 className="text-xl font-semibold mb-3">🛠️ NCCR Admin</h2>
          <p className="text-sm mb-4">Verify projects, approve credits, and manage registry.</p>
          <a
            href="http://localhost:5175" // admin-portal local port
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Go to Portal
          </a>
        </div> */}
      {/* </main> */}
    </div>
  );
}

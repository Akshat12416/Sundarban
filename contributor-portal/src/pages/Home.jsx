// src/pages/Home.jsx
import React from "react";
import { UserContext } from "../App";

export default function Home(){
  const user = React.useContext(UserContext);
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-400 mb-4">Welcome, {user?.displayName}</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700">Use the left navigation to submit a new project, manage your projects, view transfers, or list price in the marketplace.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="p-4 border rounded">
            <h3 className="font-semibold">New Project</h3>
            <p className="text-sm text-gray-600">Submit pre-plantation images & details.</p>
          </div>
          <div className="p-4 border rounded">
            <h3 className="font-semibold">My Projects</h3>
            <p className="text-sm text-gray-600">Upload after images; track status.</p>
          </div>
          <div className="p-4 border rounded">
            <h3 className="font-semibold">Marketplace</h3>
            <p className="text-sm text-gray-600">List your credits by setting a price.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

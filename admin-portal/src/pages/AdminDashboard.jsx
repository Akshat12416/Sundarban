import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, update } from "firebase/database";
import SplitText from "../components/animations/SplitText";

export default function AdminDashboard() {
  const [wasteProjects, setWasteProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState(new Set());

  /* ---------------- FETCH WASTE PROJECTS ---------------- */

  useEffect(() => {
    const wasteRef = ref(db, "WasteProjects");

    const unsubscribe = onValue(wasteRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setWasteProjects([]);
        setLoading(false);
        return;
      }

      const flat = [];

      Object.entries(data).forEach(([userKey, userNode]) => {
        Object.entries(userNode || {}).forEach(([wasteId, wasteData]) => {
          flat.push({
            id: wasteId,
            userKey,
            ...wasteData,
          });
        });
      });

      // Show only AI verified waste for admin
      const filtered = flat.filter(
        (w) => w.status === "AI_VERIFIED"
      );

      setWasteProjects(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* ---------------- ADMIN ACTIONS ---------------- */

  const approveWaste = async (waste) => {
    const path = `WasteProjects/${waste.userKey}/${waste.id}`;

    await update(ref(db, path), {
      status: "APPROVED",
      approvedBy: "admin",
      approvedAt: Date.now(),
    });

    alert("Waste approved for listing & impact attribution");
  };

  const rejectWaste = async (waste) => {
    const path = `WasteProjects/${waste.userKey}/${waste.id}`;

    await update(ref(db, path), {
      status: "REJECTED",
      rejectedBy: "admin",
      rejectedAt: Date.now(),
    });
  };

  const toggleExpand = (id) => {
    const next = new Set(expandedCards);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedCards(next);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading waste submissions...
      </div>
    );
  }

  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <SplitText
        text="Admin Dashboard – Waste Verification"
        tag="h1"
        className="text-4xl font-bold text-green-600 mb-6"
      />

      {wasteProjects.length === 0 && (
        <p className="text-gray-500">No AI-verified waste found.</p>
      )}

      <div className="space-y-4">
        {wasteProjects.map((waste) => {
          const expanded = expandedCards.has(waste.id);

          return (
            <div
              key={waste.id}
              className="bg-white rounded-lg shadow p-4 cursor-pointer"
              onClick={() => toggleExpand(waste.id)}
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-lg text-black">
                    {waste.wasteName}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {waste.city}, {waste.state}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">
                  AI Verified
                </span>
              </div>

              {/* EXPANDED DETAILS */}
              {expanded && (
                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p>
                    <strong>User:</strong> {waste.userKey}
                  </p>

                  <p>
                    <strong>Declared Quantity:</strong>{" "}
                    {waste.quantityKg} kg
                  </p>

                  <p>
                    <strong>AI Classified Category:</strong>{" "}
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {waste.aiCategory || "Recyclable"}
                    </span>
                  </p>

                  <p>
                    <strong>AI Confidence:</strong>{" "}
                    {waste.aiConfidence
                      ? `${waste.aiConfidence}%`
                      : "—"}
                  </p>

                  <p>
                    <strong>Location:</strong>{" "}
                    {waste.landMark}, {waste.pincode}
                  </p>

                  {waste.photo && (
                    <img
                      src={waste.photo}
                      alt="waste"
                      className="w-48 h-48 object-cover rounded border"
                    />
                  )}

                  {/* ACTIONS */}
                  <div className="flex gap-3 mt-4">
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        approveWaste(waste);
                      }}
                    >
                      Approve
                    </button>

                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        rejectWaste(waste);
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { ref, onValue, update, push, set } from "firebase/database";
import { db } from "../firebase";

const IMPACT_FACTOR = {
  Organic: 1.2,
  Recyclable: 0.8,
  Electronic: 0.6,
  Construction: 0.3,
  Inert: 0.1
};


const classifyWaste = (wasteName = "") => {
  const name = wasteName.toLowerCase();

  if (name.includes("rice")) return "Organic";
  if (name.includes("wrapper")) return "Recyclable";
  if (name.includes("can")) return "Recyclable";
  if (name.includes("paper")) return "Recyclable";
  if (name.includes("mobile")) return "Electronic";

  return "Inert";
};

export default function AdminDashboard() {
  const [wasteList, setWasteList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wasteRef = ref(db, "WasteProjects");

    const unsub = onValue(wasteRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setWasteList([]);
        setLoading(false);
        return;
      }

      const flat = [];

      for (const [userKey, userNode] of Object.entries(data)) {
        for (const [id, waste] of Object.entries(userNode || {})) {
          const updates = {};

          // ---------- AUTO AI VERIFICATION ----------
          if (!waste.status || waste.status === "SUBMITTED") {
            updates.status = "AI_VERIFIED";
          }

          // ---------- AUTO CATEGORY CLASSIFICATION ----------
          if (!waste.aiCategory && waste.wasteName) {
            updates.aiCategory = classifyWaste(waste.wasteName);
          }

          // Apply updates once (safe)
          if (Object.keys(updates).length > 0) {
            await update(
              ref(db, `WasteProjects/${userKey}/${id}`),
              updates
            );
          }

          flat.push({
            id,
            userKey,
            ...waste,
            ...updates
          });
        }
      }

      // Latest first (demo clarity)
      flat.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      setWasteList(flat);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ---------- ADMIN ACTIONS ----------

  const approveWaste = async (waste) => {
    await update(
      ref(db, `WasteProjects/${waste.userKey}/${waste.id}`),
      {
        status: "APPROVED",
        approvedAt: Date.now(),
        approvedBy: "admin"
      }
    );

    alert("Waste approved and listed");
  };

  const allocateToPlantationPool = async (waste) => {
    const factor = IMPACT_FACTOR[waste.aiCategory] || 0.1;
    const finalWeight = Number(waste.finalWeightKg || 0);
    const plantationUnits = finalWeight * factor;

    const poolRef = ref(db, "PlantationPool");
    const entryRef = push(poolRef);

    await set(entryRef, {
      wasteId: waste.id,
      sourceUser: waste.userKey,
      buyerId: waste.buyerId || null,
      aiCategory: waste.aiCategory,
      finalWeightKg: finalWeight,
      plantationUnits,
      status: "POOL_LOCKED",
      createdAt: Date.now()
    });

    await update(
      ref(db, `WasteProjects/${waste.userKey}/${waste.id}`),
      {
        status: "POOL_ALLOCATED",
        poolEntryId: entryRef.key,
        poolAllocatedAt: Date.now()
      }
    );

    alert("Allocated to Plantation Pool");
  };

  // ---------- UI ACTION HANDLER ----------
  const renderAction = (waste) => {
    switch (waste.status) {
      case "AI_VERIFIED":
        return (
          <button
            onClick={() => approveWaste(waste)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Approve
          </button>
        );

      case "WEIGHT_VERIFIED":
        return (
          <button
            onClick={() => allocateToPlantationPool(waste)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Allocate to Plantation Pool
          </button>
        );

      default:
        return (
          <span className="text-sm text-gray-500">
            No action required
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading admin dashboard…
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-6">
        Admin Dashboard – Waste Lifecycle Control
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wasteList.map((waste) => (
          <div
            key={waste.id}
            className="bg-white rounded shadow p-4 flex flex-col justify-between"
          >
            <div>
              <h3 className="font-semibold text-lg">
                {waste.wasteName}
              </h3>

              <p className="text-sm text-gray-600">
                Status: <strong>{waste.status}</strong>
              </p>

              <p className="text-sm text-gray-600">
                Category: {waste.aiCategory}
              </p>

              <p className="text-sm text-gray-600">
                Declared Weight: {waste.wasteWeight} kg
              </p>

              {waste.finalWeightKg && (
                <p className="text-sm text-gray-600">
                  Final Weight: {waste.finalWeightKg} kg
                </p>
              )}
            </div>

            <div className="mt-4">
              {renderAction(waste)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

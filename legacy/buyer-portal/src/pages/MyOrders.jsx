import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "../firebase";
import { getImageSrc } from "../utils/imageUtils";

const BUYER_ID = "buyer_demo";

export default function MyOrders() {
  const [orders, setOrders] = useState({});
  const [weights, setWeights] = useState({});

  useEffect(() => {
    const wasteRef = ref(db, "WasteProjects");

    const unsub = onValue(wasteRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const result = {};

      Object.entries(data).forEach(([userKey, userNode]) => {
        Object.entries(userNode || {}).forEach(([id, waste]) => {
          if (waste.status === "RESERVED" && waste.buyerId === BUYER_ID) {
            result[`${userKey}_${id}`] = { id, userKey, ...waste };
          }
        });
      });

      setOrders(result);
    });

    return () => unsub();
  }, []);

  const confirmWeight = async (order) => {
    const declared = Number(order.wasteWeight);
    const reported = Number(weights[order.id]);

    if (!reported || reported <= 0) {
      alert("Enter valid received weight");
      return;
    }

    // CORE ANTI-FRAUD RULE
    const finalWeightKg = Math.min(declared, reported);

    const path = `WasteProjects/${order.userKey}/${order.id}`;

    await update(ref(db, path), {
      recyclerReportedWeightKg: reported,
      finalWeightKg,
      status: "WEIGHT_VERIFIED",
      weightVerifiedAt: Date.now()
    });

    alert("Final weight verified");
  };

  const orderList = Object.values(orders);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">My Orders</h2>

      {orderList.length === 0 && (
        <p className="text-gray-500">No active orders.</p>
      )}

      {/* GRID FIXES CARD SIZE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {orderList.map(order => (
          <div
            key={order.id}
            className="bg-white rounded shadow p-4 flex flex-col"
          >
            <h3 className="font-semibold text-lg mb-2">
              {order.wasteName}
            </h3>

            {/* FIXED IMAGE CONTAINER */}
            {order.photo && (
              <div className="w-full h-40 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                <img
                  src={getImageSrc(order.photo)}
                  alt="Waste"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="text-sm text-gray-600 mt-3">
              Declared Weight: {order.wasteWeight} kg
            </p>

            <input
              type="number"
              placeholder="Final received weight (kg)"
              className="border px-3 py-2 rounded w-full mt-3"
              onChange={(e) =>
                setWeights(prev => ({
                  ...prev,
                  [order.id]: e.target.value
                }))
              }
            />

            <button
              onClick={() => confirmWeight(order)}
              className="mt-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Confirm Weight
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

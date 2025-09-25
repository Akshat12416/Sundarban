// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get, set, update } from "firebase/database";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [price, setPrice] = useState("");
  const [minQty, setMinQty] = useState(1);
  const [maxQty, setMaxQty] = useState(1000);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (!stored) {
      navigate("/");
      return;
    }
    setUser(stored);

    // load existing seller record if any
    (async () => {
      const snap = await get(ref(db, `Sellers/${stored.userId}`));
      if (snap.exists()) {
        const s = snap.val();
        setPrice(s.price || "");
        setMinQty(s.minQty || 1);
        setMaxQty(s.maxQty || 1000);
      }
    })();
  }, [navigate]);

  const saveSeller = async () => {
    if (!price) return alert("Set a price per credit first");
    const userId = user.userId;
    await set(ref(db, `Sellers/${userId}`), {
      userId,
      email: user.email,
      fullName: user.fullName,
      price: Number(price),
      minQty: Number(minQty),
      maxQty: Number(maxQty),
      updatedAt: Date.now(),
    });

    alert("Price published. You will appear in marketplace.");
    navigate("/marketplace");
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 rounded-lg p-6">
      <h2 className="text-xl font-bold text-green-300 mb-3">Contributor Profile</h2>
      {!user ? (
        <div>Loading...</div>
      ) : (
        <>
          <p className="text-sm text-gray-300 mb-4">Signed in as: <strong>{user.email}</strong></p>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-300">Price per credit (INR)</label>
              <input
                type="number"
                min="1"
                className="w-full mt-1 p-2 rounded bg-black text-white border border-gray-700"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-300">Min qty</label>
                <input
                  type="number"
                  className="w-full mt-1 p-2 rounded bg-black text-white border border-gray-700"
                  value={minQty}
                  onChange={(e) => setMinQty(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Max qty</label>
                <input
                  type="number"
                  className="w-full mt-1 p-2 rounded bg-black text-white border border-gray-700"
                  value={maxQty}
                  onChange={(e) => setMaxQty(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => navigate("/marketplace")}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button onClick={saveSeller} className="px-4 py-2 rounded bg-green-600 hover:bg-green-700">
                Publish Price
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

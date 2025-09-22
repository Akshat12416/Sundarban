// src/pages/Marketplace.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, get, child, set, push } from "firebase/database";

export default function Marketplace() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // seller selected to buy
  const [qty, setQty] = useState(1);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    setUser(stored || null);

    const sellersRef = ref(db, "Sellers");
    const unsub = onValue(sellersRef, (snap) => {
      const val = snap.val() || {};
      const arr = Object.values(val).filter(s => s.price && s.price > 0);
      setSellers(arr);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openBuy = (seller) => {
    setSelected(seller);
    setQty(seller.minQty || 1);
  };

  const placeOrder = async () => {
    if (!user) return alert("Please login first");
    if (!selected) return;
    if (qty < selected.minQty || qty > selected.maxQty) {
      return alert(`Qty must be between ${selected.minQty} and ${selected.maxQty}`);
    }

    // Write order under Orders/<sellerUserId>/<uniqueOrderId>
    const ordersRef = ref(db, `Orders/${selected.userId}`);
    const newRef = push(ordersRef);
    const orderId = newRef.key;
    await set(newRef, {
      orderId,
      sellerId: selected.userId,
      buyerId: user.userId,
      buyerEmail: user.email,
      qty,
      pricePerCredit: selected.price,
      totalAmount: Number(selected.price) * Number(qty),
      status: "initiated",
      createdAt: Date.now(),
    });

    alert("Order placed. Admin / seller will process payment/transfer.");
    setSelected(null);
  };

  if (loading) return <div>Loading sellers...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-green-300 mb-4">Marketplace</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {sellers.length === 0 && <div className="text-gray-400">No sellers published prices yet.</div>}
        {sellers.map((s) => (
          <div key={s.userId} className="bg-gray-900 p-4 rounded-lg border border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-white">{s.fullName || s.email}</div>
                <div className="text-sm text-gray-300">Price: ₹{s.price} / credit</div>
                <div className="text-sm text-gray-400">Min: {s.minQty} | Max: {s.maxQty}</div>
              </div>
              <div>
                <button onClick={() => openBuy(s)} className="bg-green-600 px-3 py-1 rounded">Buy</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Buy modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="w-full max-w-md bg-gray-900 p-6 rounded shadow-lg">
            <h2 className="text-xl font-semibold text-green-300 mb-3">Buy from {selected.fullName || selected.email}</h2>
            <div className="mb-2 text-sm text-gray-300">Price: ₹{selected.price} per credit</div>
            <div className="mb-3">
              <label className="text-sm text-gray-300">Quantity</label>
              <input
                type="number"
                min={selected.minQty}
                max={selected.maxQty}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-black text-white border border-gray-700"
              />
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-300">Total: <strong>₹{Number(selected.price) * Number(qty)}</strong></div>
              <div className="flex gap-2">
                <button onClick={() => setSelected(null)} className="px-3 py-1 rounded bg-gray-700">Cancel</button>
                <button onClick={placeOrder} className="px-3 py-1 rounded bg-green-600">Place Order</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

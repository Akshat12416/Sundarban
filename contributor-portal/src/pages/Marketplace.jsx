// src/pages/Marketplace.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, set, onValue } from "firebase/database";
import { UserContext } from "../App";
import { ethers } from "ethers";

export default function Marketplace(){
  const user = React.useContext(UserContext);
  const [price, setPrice] = useState("");
  const [listings, setListings] = useState([]);
  const [walletAddr, setWalletAddr] = useState("");

  useEffect(()=> {
    const listingsRef = ref(db, "Marketplace");
    const unsub = onValue(listingsRef, (snap)=>{
      const d = snap.val() || {};
      const arr = Object.entries(d).map(([uid, v]) => ({ ownerKey: uid, ...v }));
      // show only sellers with price set
      setListings(arr.filter(a=>a.price && a.price !== ""));
    });
    return ()=> unsub();
  }, []);

  useEffect(()=>{
    if(!user) return;
    // read user's linked wallet if any from Users node (if you store there)
    const userKey = user.email.replace(/\./g, ",");
    const userRef = ref(db, `Users/${userKey}/walletAddress`);
    // optional: read if you stored walletAddress elsewhere
  }, [user]);

  const connectMetaMask = async () => {
    if(!window.ethereum) return alert("MetaMask required");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setWalletAddr(accounts[0]);
  };

  const publish = async () => {
    if(!user) return alert("Login required");
    if(!price) return alert("Set a price");
    const ownerKey = user.email.replace(/\./g, ",");
    await set(ref(db, `Marketplace/${ownerKey}`), {
      price: String(price),
      walletAddress: walletAddr || ""
    });
    alert("Listed on marketplace");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-green-400 mb-4">Marketplace — Sell CC</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm">Your price per credit (INR)</label>
            <input value={price} onChange={(e)=>setPrice(e.target.value)} className="border p-2 rounded w-full"/>
          </div>
          <div>
            <label className="block text-sm">Linked wallet (optional)</label>
            <div className="flex gap-2">
              <input value={walletAddr} onChange={(e)=>setWalletAddr(e.target.value)} className="border p-2 rounded w-full" placeholder="0x..."/>
              <button onClick={connectMetaMask} className="bg-green-600 px-3 text-white rounded">Connect</button>
            </div>
          </div>
          <div className="flex items-end">
            <button onClick={publish} className="bg-green-600 px-4 py-2 rounded text-white">Publish Listing</button>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-3">Sellers</h3>
      <div className="grid gap-3">
        {listings.map(l => (
          <div key={l.ownerKey} className="bg-white p-3 rounded shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">{l.ownerKey.replace(/,/g,".")}</div>
              <div className="text-sm text-gray-600">Price: ₹{l.price} / CC</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Wallet: {l.walletAddress || "—"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// src/pages/Transfers.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { UserContext } from "../App";

export default function Transfers(){
  const user = React.useContext(UserContext);
  const [transfers, setTransfers] = useState([]);

  useEffect(()=>{
    if(!user) return;
    const ownerKey = user.email.replace(/\./g, ",");
    const tRef = ref(db, `Transfers/${ownerKey}`);
    const unsub = onValue(tRef, (snap)=>{
      const d = snap.val() || {};
      // if nested unique ids under ownerKey, convert accordingly
      if (typeof d === "object" && Object.keys(d).length > 0) {
        const arr = Object.entries(d).map(([k,v]) => ({ id: k, ...v }));
        setTransfers(arr.reverse());
      } else {
        setTransfers([]);
      }
    });
    return ()=> unsub();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-green-400 mb-4">Transfer History</h2>
      {transfers.length === 0 && <div>No transfers yet.</div>}
      <div className="grid gap-3">
        {transfers.map(t=>(
          <div key={t.id} className="bg-white p-3 rounded shadow">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{t.payoutMode?.toUpperCase() || "N/A"}</div>
                <div className="text-sm text-gray-600">Credits: {t.credits}</div>
                <div className="text-xs text-gray-500">At: {new Date(t.timestamp).toLocaleString()}</div>
              </div>
              <div className="text-sm">
                {t.blockchainTx ? <a className="text-green-600" target="_blank" rel="noreferrer" href={`https://sepolia.etherscan.io/tx/${t.blockchainTx}`}>TX</a> : t.upiId}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

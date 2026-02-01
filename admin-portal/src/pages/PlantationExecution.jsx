import React, { useEffect, useState } from "react";
import { ref, onValue, update, push } from "firebase/database";
import { db } from "../firebase";
import { ethers } from "ethers";
import CONTRACT_ABI from "../abi/CarbonCreditToken.json";

const CONTRACT_ADDRESS = "0x1448d4966Cf9748f708ef4607BE5685f0e9AF0B9";

// Environmental impact multipliers
const IMPACT_FACTOR = {
  Organic: 1.2,
  Recyclable: 0.8,
  Electronic: 0.6,
  Construction: 0.3,
  Inert: 0.1
};

// Solidity enum mapping
// enum ProjectType { PLANTATION = 0, WASTE = 1, HYBRID = 2 }
const PROJECT_TYPE_WASTE = 1;

export default function PlantationExecution() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= LOAD POOL ALLOCATED =================
  useEffect(() => {
    const wasteRef = ref(db, "WasteProjects");

    const unsub = onValue(wasteRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setItems([]);
        setLoading(false);
        return;
      }

      const flat = [];

      Object.entries(data).forEach(([userKey, userNode]) => {
        Object.entries(userNode || {}).forEach(([id, waste]) => {
          if (waste.status === "POOL_ALLOCATED") {
            flat.push({ id, userKey, ...waste });
          }
        });
      });

      setItems(flat);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ================= EXECUTION LOGIC =================
  const executePlantationAndPayout = async (waste) => {
    try {
      // ---- VALIDATION ----
      if (!waste.finalWeightKg || !waste.aiCategory) {
        alert("Final weight or category missing");
        return;
      }

      const factor = IMPACT_FACTOR[waste.aiCategory] || 0.1;
      const credits = Math.floor(
        Number(waste.finalWeightKg) * factor * 10
      );

      if (credits <= 0) {
        alert("Credits calculated as zero");
        return;
      }

      const wastePath = `WasteProjects/${waste.userKey}/${waste.id}`;
      const wallet = waste.userWallet;

      // ---- STEP 1: MARK PLANTED ----
      await update(ref(db, wastePath), {
        status: "PLANTED",
        plantedAt: Date.now()
      });

      // ================= CRYPTO FLOW =================
      if (wallet && wallet.startsWith("0x")) {
        if (!window.ethereum) {
          alert("MetaMask required");
          return;
        }

        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );

        // IMPORTANT: string dataHash (matches Solidity)
        const dataHash = JSON.stringify({
          wasteId: waste.id,
          finalWeightKg: waste.finalWeightKg,
          category: waste.aiCategory,
          timestamp: Date.now()
        });

        const tx = await contract.registerProject(
          wallet,              // address owner
          dataHash,            // string dataHash
          credits,             // uint256 credits
          PROJECT_TYPE_WASTE   // enum ProjectType.WASTE
        );

        await tx.wait();

        await update(ref(db, wastePath), {
          status: "CREDITED",
          creditsIssued: credits,
          blockchainTx: tx.hash,
          creditedAt: Date.now()
        });

        await push(ref(db, `Transfers/${waste.userKey}`), {
          transactionId: Date.now().toString(),
          wasteId: waste.id,
          ownerKey: waste.userKey,
          userWallet: wallet,
          credits,
          payoutMode: "crypto",
          blockchainTx: tx.hash,
          timestamp: Date.now()
        });

        alert("Plantation completed & crypto credits issued");
        return;
      }

      // ================= BANK / UPI FLOW =================
      await update(ref(db, wastePath), {
        status: "CREDITED",
        creditsIssued: credits,
        payoutMode: "bank",
        creditedAt: Date.now()
      });

      await push(ref(db, `Transfers/${waste.userKey}`), {
        transactionId: Date.now().toString(),
        wasteId: waste.id,
        ownerKey: waste.userKey,
        upiId: wallet,
        credits,
        payoutMode: "bank",
        timestamp: Date.now()
      });

      alert("Plantation completed & bank payout recorded");

    } catch (err) {
      console.error("Execution failed:", err);
      alert("Execution failed — check console");
    }
  };

  // ================= UI =================
  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading plantation execution…
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-6">
        Plantation Execution & Credit Issuance
      </h1>

      {items.length === 0 && (
        <p className="text-gray-500">
          No pool-allocated items pending execution.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((waste) => (
          <div
            key={waste.id}
            className="bg-white rounded shadow p-4"
          >
            <h3 className="font-semibold text-lg">
              {waste.wasteName}
            </h3>

            <p className="text-sm text-gray-600">
              Category: {waste.aiCategory}
            </p>

            <p className="text-sm text-gray-600">
              Final Weight: {waste.finalWeightKg} kg
            </p>

            <p className="text-sm text-gray-600 break-all">
              Wallet / UPI: {waste.userWallet}
            </p>

            <button
              onClick={() => executePlantationAndPayout(waste)}
              className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Complete Plantation & Issue Credits
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

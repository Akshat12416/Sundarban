import React, { useEffect, useState } from "react";
import { ref, onValue, update, push } from "firebase/database";
import { db } from "../firebase";
import { ethers } from "ethers";
import CONTRACT_ABI from "../abi/CarbonCreditToken.json";
import { getImageSrc } from "../utils/imageUtils";

const CONTRACT_ADDRESS = "0x1448d4966Cf9748f708ef4607BE5685f0e9AF0B9";

// enum ProjectType { PLANTATION = 0, WASTE = 1, HYBRID = 2 }
const PROJECT_TYPE_PLANTATION = 0;

export default function PlantationVerification() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const projectsRef = ref(db, "Projects");

    const unsub = onValue(projectsRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setProjects([]);
        setLoading(false);
        return;
      }

      const flat = [];

      for (const [userKey, userNode] of Object.entries(data)) {
        for (const [id, project] of Object.entries(userNode || {})) {

          // ✅ AUTO-DETECT AFTER IMAGES
          const hasAfterImages =
            project.aImg1 && project.aImg2 && project.aImg3;

          // ✅ AUTO UPGRADE STATUS
          if (
            project.status === "Approved" &&
            hasAfterImages
          ) {
            await update(
              ref(db, `Projects/${userKey}/${id}`),
              { status: "AFTER_UPLOADED" }
            );
            project.status = "AFTER_UPLOADED";
          }

          // ✅ SHOW ONLY READY PROJECTS
          if (project.status === "AFTER_UPLOADED") {
            flat.push({ id, userKey, ...project });
          }
        }
      }

      setProjects(flat);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ================= VERIFY & ISSUE =================
  const verifyAndIssueCredits = async (project) => {
    try {
      if (!project.noTree || !project.upiMetamask) {
        alert("Missing tree count or payout details");
        return;
      }

      const credits = Number(project.noTree);
      if (credits <= 0) {
        alert("Invalid credit amount");
        return;
      }

      const projectPath = `Projects/${project.userKey}/${project.id}`;

      // STEP 1: Mark verified
      await update(ref(db, projectPath), {
        status: "PLANTATION_VERIFIED",
        verifiedAt: Date.now()
      });

      // ================= CRYPTO FLOW =================
      if (project.upiMetamask.startsWith("0x")) {
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

        const dataHash = JSON.stringify({
          projectId: project.id,
          treeType: project.treeType,
          treeCategory: project.treeCategory,
          noTree: project.noTree,
          area: project.area,
          region: project.region,
          verifiedAt: Date.now()
        });

        const tx = await contract.registerProject(
          project.upiMetamask,
          dataHash,
          credits,
          PROJECT_TYPE_PLANTATION
        );

        await tx.wait();

        await update(ref(db, projectPath), {
          status: "CREDITED",
          creditsIssued: credits,
          blockchainTx: tx.hash,
          creditedAt: Date.now()
        });

        await push(ref(db, `Transfers/${project.userKey}`), {
          transactionId: Date.now().toString(),
          projectId: project.id,
          ownerKey: project.userKey,
          userWallet: project.upiMetamask,
          credits,
          payoutMode: "crypto",
          blockchainTx: tx.hash,
          timestamp: Date.now()
        });

        alert("Plantation verified & crypto credits issued");
        return;
      }

      // ================= BANK / UPI FLOW =================
      await update(ref(db, projectPath), {
        status: "CREDITED",
        creditsIssued: credits,
        payoutMode: "bank",
        creditedAt: Date.now()
      });

      await push(ref(db, `Transfers/${project.userKey}`), {
        transactionId: Date.now().toString(),
        projectId: project.id,
        ownerKey: project.userKey,
        upiId: project.upiMetamask,
        credits,
        payoutMode: "bank",
        timestamp: Date.now()
      });

      alert("Plantation verified & bank payout recorded");

    } catch (err) {
      console.error("Verification failed:", err);
      alert("Verification failed — check console");
    }
  };

  // ================= UI =================
  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading plantation verification…
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-6">
        Plantation Verification (After Images)
      </h1>

      {projects.length === 0 && (
        <p className="text-gray-500">
          No plantations awaiting verification.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <div
            key={p.id}
            className="bg-white p-4 rounded shadow"
          >
            <h3 className="font-semibold text-lg">
              {p.userName}
            </h3>

            <p className="text-sm text-gray-600">
              Trees Planted: {p.noTree}
            </p>

            <p className="text-sm text-gray-600">
              Tree Type: {p.treeType}
            </p>

            <p className="text-sm text-gray-600">
              Category: {p.treeCategory}
            </p>

            <p className="text-sm text-gray-600">
              Area: {p.area} sq.m
            </p>

            {/* After Plantation Images */}
<div className="mt-3 grid grid-cols-3 gap-2">
  {p.aImg1 && (
    <img
      src={getImageSrc(p.aImg1)}
      alt="After 1"
      className="h-24 w-full object-cover rounded border"
    />
  )}
  {p.aImg2 && (
    <img
      src={getImageSrc(p.aImg2)}
      alt="After 2"
      className="h-24 w-full object-cover rounded border"
    />
  )}
  {p.aImg3 && (
    <img
      src={getImageSrc(p.aImg3)}
      alt="After 3"
      className="h-24 w-full object-cover rounded border"
    />
  )}
</div>


            <button
              onClick={() => verifyAndIssueCredits(p)}
              className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Verify Plantation & Issue Credits
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

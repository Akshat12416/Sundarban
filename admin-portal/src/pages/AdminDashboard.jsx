import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, update, push } from "firebase/database";
import { collectImgs, getImageSrc, parseLocationField } from "../utils/projectUtils";
import { ethers } from "ethers";
import CONTRACT_ABI from "../abi/CarbonCreditToken.json"; 


const CONTRACT_ADDRESS = "0x9D52f83a9D1DF87D2117b98B48A815d03cCD8b9b";

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    const projectsRef = ref(db, "Projects");
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setProjects([]);
        setLoading(false);
        return;
      }

      const flat = [];
      Object.entries(data).forEach(([ownerKey, ownerNode]) => {
        Object.entries(ownerNode || {}).forEach(([projId, projData]) => {
          const beforeRaw = collectImgs(projData, "bImg");
          const afterRaw = collectImgs(projData, "aImg");

          const beforeImages = beforeRaw.map(getImageSrc).filter(Boolean);
          const afterImages = afterRaw.map(getImageSrc).filter(Boolean);

          flat.push({
            id: projId,
            ownerKey,
            ...projData,
            beforeImages,
            afterImages,
            parsedBeforeLocation: parseLocationField(projData.bLocation),
            parsedAfterLocation: parseLocationField(projData.aLocation),
          });
        });
      });

      const filtered = flat.filter(
        (p) => String(p.status).toLowerCase() === "pending" && p.afterImages.length > 0
      );

      setProjects(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Connect wallet for blockchain interactions
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask required!");
      return;
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });
    setWalletConnected(true);
  };

  // Hash generator (simple JSON stringify hash for now)
  const hashProjectData = (proj) => {
    const str = JSON.stringify({
      id: proj.id,
      owner: proj.ownerKey,
      type: proj.treeType,
      count: proj.noTree,
      category: proj.treeCategory,
    });
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(str));
  };

const approveProject = async (proj) => {
  try {
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }

    // Request wallet connection
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Setup ethers provider + signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Get details from project
    const userWallet = proj.walletAddress;
    const credits = parseInt(proj.noTree) || 0; // for demo: 1 tree = 1 credit
    const dataHash = proj.id; // for demo: use project ID, later replace with IPFS/sha256

    if (!userWallet) {
      alert("No wallet address found for this project");
      return;
    }

    // Call contract
    const tx = await contract.registerProject(userWallet, dataHash, credits);
    console.log("Transaction sent:", tx.hash);

    await tx.wait();
    console.log("Transaction mined");

    // Save tx hash in Firebase
    const path = `Projects/${proj.ownerKey}/${proj.id}`;
    await update(ref(db, path), {
      status: "Approved",
      blockchainTx: tx.hash,
    });

    alert("Project approved and credits issued!");
  } catch (err) {
    console.error("Approval failed:", err);
    alert("Approval failed: " + err.message);
  }
};


  const rejectProject = async (proj) => {
    const path = `Projects/${proj.ownerKey}/${proj.id}`;
    await update(ref(db, path), { status: "Rejected" });
  };

  if (loading) return <p className="p-6 text-white">Loading projects...</p>;

  return (
    <div className="p-6 min-h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-6 text-green-400">
        Admin Dashboard — Pending Projects
      </h1>

      {!walletConnected && (
        <button
          onClick={connectWallet}
          className="mb-6 bg-green-600 px-4 py-2 rounded hover:bg-green-700"
        >
          Connect Wallet
        </button>
      )}

      <div className="grid gap-6">
        {projects.length === 0 && (
          <div className="text-gray-400">No pending projects found.</div>
        )}

        {projects.map((p) => (
          <div
            key={`${p.ownerKey}-${p.id}`}
            className="bg-gray-900 rounded-lg shadow-lg p-5 border border-green-700"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-green-300">
                  {p.orgName || p.userName}{" "}
                  <span className="text-xs text-gray-500">({p.ownerKey})</span>
                </h2>
                <p className="text-sm text-gray-400">
                  Project ID: <span className="font-mono">{p.id}</span>
                </p>
                <p className="text-sm">
                  🌱 <strong>{p.treeType}</strong> | Count:{" "}
                  <strong>{p.noTree}</strong> | {p.treeCategory}
                </p>
                <p className="text-sm text-gray-400">
                  📍 {p.region} | 📞 {p.phone} | ✉️ {p.email}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-medium border bg-yellow-100 text-yellow-800">
                Pending
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-green-200 mb-2">
                  Before Images
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {p.beforeImages.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`before-${i}`}
                      className="w-24 h-24 object-cover rounded border border-green-600 cursor-pointer"
                      onClick={() => setPreviewImg(src)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-green-200 mb-2">
                  After Images
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {p.afterImages.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`after-${i}`}
                      className="w-24 h-24 object-cover rounded border border-green-600 cursor-pointer"
                      onClick={() => setPreviewImg(src)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                className="bg-green-600 px-4 py-1 rounded hover:bg-green-700"
                onClick={() => approveProject(p)}
              >
                Approve & Pay
              </button>
              <button
                className="bg-red-600 px-4 py-1 rounded hover:bg-red-700"
                onClick={() => rejectProject(p)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {previewImg && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-6 z-50"
          onClick={() => setPreviewImg(null)}
        >
          <img
            src={previewImg}
            alt="preview"
            className="max-h-full max-w-full rounded shadow-lg border border-green-500"
          />
        </div>
      )}
    </div>
  );
}

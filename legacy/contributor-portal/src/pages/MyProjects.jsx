// src/pages/MyProjects.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, update } from "firebase/database";
import { UserContext } from "../App";

function readFilesToBase64(files) {
  return Promise.all(
    Array.from(files).map(
      (f) =>
        new Promise((res) => {
          const r = new FileReader();
          r.onload = () => res(r.result);
          r.readAsDataURL(f);
        })
    )
  );
}

export default function MyProjects() {
  const user = React.useContext(UserContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const ownerKey = (user?.email || "unknown").replace(/\./g, ",");

  useEffect(() => {
    const projectsRef = ref(db, `Projects/${ownerKey}`);
    const unsub = onValue(projectsRef, (snap) => {
      const data = snap.val() || {};
      const arr = Object.entries(data).map(([k, v]) => ({ id: k, ...v }));
      setProjects(arr.reverse());
      setLoading(false);
    });
    return () => unsub();
  }, [ownerKey]);

  const uploadAfterImages = async (projId, files) => {
    if (!files || files.length < 3) {
      alert("Please upload at least 3 after images.");
      return;
    }
    const b64 = await readFilesToBase64(files);
    const updates = {};
    b64.forEach((s, idx) => {
      updates[`aImg${idx + 1}`] = s;
    });
    updates.aLocation = `Time: ${Date.now()} Lat: ${"N/A"}=>Long: ${"N/A"}`; // optionally geolocate
    updates.status = "pending";
    await update(ref(db, `Projects/${ownerKey}/${projId}`), updates);
    alert("After images uploaded — project now marked as pending for admin.");
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-green-400 mb-4">My Projects</h2>
      {projects.length === 0 && <div>No projects yet.</div>}
      <div className="grid gap-4">
        {projects.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{p.treeType} — {p.treeCategory}</div>
                <div className="text-sm text-gray-600">Count: {p.noTree} • Area: {p.area}</div>
                <div className="text-xs mt-1">Status: <strong>{p.status}</strong></div>
              </div>
            </div>

            <div className="mt-3 flex gap-2 flex-wrap">
              {/* show before thumbnails */}
              {Object.keys(p).filter(k=>k.startsWith("bImg")).map(k => (
                <img key={k} src={p[k]} className="w-20 h-20 object-cover rounded border" alt={k} />
              ))}
            </div>

            <div className="mt-3">
              {p.status === "waiting_for_after_images" ? (
                <>
                  <label className="block text-sm">Upload After Images (min 3)</label>
                  <input type="file" accept="image/*" multiple onChange={(e)=>uploadAfterImages(p.id, e.target.files)} />
                </>
              ) : (
                <div className="text-sm text-gray-600">After images already uploaded or project pending/approved.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

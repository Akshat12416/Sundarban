// src/pages/NewProject.jsx
import React, { useState, useEffect } from "react";
import { ref, push, set } from "firebase/database";
import { db } from "../firebase";
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

export default function NewProject() {
  const user = React.useContext(UserContext);
  const [roleType, setRoleType] = useState("individual");
  const [form, setForm] = useState({
    treeType: "",
    noTree: "",
    area: "",
    treeCategory: "Sapling",
    upiMetamask: "",
    description: "",
    orgName: "",
    orgId: ""
  });
  const [beforeFiles, setBeforeFiles] = useState([]);
  const [error, setError] = useState("");

  // location + timestamp for before images when they are chosen
  const getLocationStamp = async () =>
    new Promise((res) => {
      if (!("geolocation" in navigator)) return res(null);
      navigator.geolocation.getCurrentPosition(
        (p) => res(`Time: ${Date.now()} Lat: ${p.coords.latitude}=>Long: ${p.coords.longitude}`),
        () => res(null),
        { timeout: 5000 }
      );
    });

  const handleBefore = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files.length < 3) {
      setError("Please select at least 3 before images.");
      return;
    }
    setError("");
    const b64 = await readFilesToBase64(files);
    setBeforeFiles(b64);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError("");
    if (beforeFiles.length < 3) {
      setError("Upload at least 3 before images.");
      return;
    }
    if (!form.treeType || !form.noTree || !form.area) {
      setError("Fill required fields.");
      return;
    }

    const loc = await getLocationStamp();
    const projectsRef = ref(db, "Projects");
    // store under Projects/{emailEncoded}/{pushId}
    const ownerKey = (user?.email || "unknown").replace(/\./g, ",");
    const newProjRef = push(ref(db, `Projects/${ownerKey}`));
    const projId = newProjRef.key;

    // assemble data: store bImg1..bImgN, bLocation, other fields
    const data = {
      userName: user.displayName || "",
      email: user.email || "",
      phone: "",
      region: "",
      treeType: form.treeType,
      noTree: String(form.noTree),
      area: String(form.area),
      treeCategory: form.treeCategory,
      upiMetamask: form.upiMetamask,
      description: form.description,
      status: "waiting_for_after_images",
      organizationId: "", // keep placeholder
      orgName: form.orgName || "",
      orgId: form.orgId || "",
      createdAt: Date.now()
    };

    // attach before images as bImg1..N
    beforeFiles.forEach((b64, idx) => {
      data[`bImg${idx + 1}`] = b64;
    });
    if (loc) data.bLocation = loc;

    await set(newProjRef, data);
    alert("Project submitted. Upload after images later from My Projects.");
    // reset
    setBeforeFiles([]);
    setForm({
      treeType: "",
      noTree: "",
      area: "",
      treeCategory: "Sapling",
      upiMetamask: "",
      description: "",
      orgName: "",
      orgId: ""
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-green-400">Submit New Project</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded p-6 shadow space-y-4">
        <div>
          <label className="block text-sm font-medium">Role</label>
          <select value={roleType} onChange={(e)=>setRoleType(e.target.value)} className="border p-2 rounded w-48">
            <option value="individual">Individual</option>
            <option value="organisation">Organisation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm">Tree Type</label>
          <input value={form.treeType} onChange={e=>setForm({...form, treeType: e.target.value})} required className="w-full border p-2 rounded" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm">Number of Trees</label>
            <input value={form.noTree} onChange={e=>setForm({...form, noTree: e.target.value})} required type="number" className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm">Area (acres)</label>
            <input value={form.area} onChange={e=>setForm({...form, area: e.target.value})} required type="number" step="0.01" className="w-full border p-2 rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm">Tree Category</label>
          <select value={form.treeCategory} onChange={e=>setForm({...form, treeCategory: e.target.value})} className="border p-2 rounded w-48">
            <option>Sapling</option>
            <option>Young</option>
            <option>Mature</option>
          </select>
        </div>

        {roleType === "organisation" && (
          <>
            <div>
              <label className="block text-sm">Organization Name</label>
              <input value={form.orgName} onChange={e=>setForm({...form, orgName: e.target.value})} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm">Org ID</label>
              <input value={form.orgId} onChange={e=>setForm({...form, orgId: e.target.value})} className="w-full border p-2 rounded" />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm">Before Images (camera/gallery) — min 3</label>
          <input type="file" accept="image/*" multiple onChange={handleBefore} />
          <div className="flex gap-2 mt-2 flex-wrap">
            {beforeFiles.map((s, i) => <img key={i} src={s} alt={`b${i}`} className="w-20 h-20 object-cover rounded border" />)}
          </div>
        </div>

        <div>
          <label className="block text-sm">UPI or MetaMask (enter UPI like x@ybl or 0x...)</label>
          <input value={form.upiMetamask} onChange={e=>setForm({...form, upiMetamask: e.target.value})} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm">Description</label>
          <textarea value={form.description} onChange={e=>setForm({...form, description: e.target.value})} className="w-full border p-2 rounded" />
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <button className="bg-green-600 text-white py-2 px-4 rounded">Submit Project</button>
      </form>
    </div>
  );
}

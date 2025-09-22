// src/pages/ApprovedProjects.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { collectImgs, getImageSrc } from "../utils/projectUtils";

export default function ApprovedProjects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const projectsRef = ref(db, "Projects");
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const flat = [];
      Object.entries(data).forEach(([ownerKey, ownerNode]) => {
        Object.entries(ownerNode || {}).forEach(([projId, projData]) => {
          if (projData.status === "Approved") {
            flat.push({
              id: projId,
              ownerKey,
              ...projData,
              beforeImages: collectImgs(projData, "bImg").map(getImageSrc),
              afterImages: collectImgs(projData, "aImg").map(getImageSrc),
            });
          }
        });
      });
      setProjects(flat);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-6 text-green-400">
        Approved Projects
      </h1>
      <div className="grid gap-6">
        {projects.map((p) => (
          <div
            key={p.id}
            className="bg-gray-900 p-5 rounded-lg border border-green-700"
          >
            <h2 className="text-green-300 font-semibold">{p.orgName}</h2>
            <p className="text-sm text-gray-400">Project ID: {p.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

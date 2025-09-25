// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { ref, get, child, set, push } from "firebase/database";
import { v4 as uuidv4 } from "uuid";

/*
Simple login flow:
- Enter email and name
- Choose Contributor or Industry via slider
- If user exists in /Users node (search by email) we reuse it
- Otherwise create a new user in /Users/<userId>
- Save current user to localStorage and redirect to profile or marketplace
*/

export default function Login() {
  const [mode, setMode] = useState("contributor"); // or "industry"
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const findUserByEmail = async (emailToFind) => {
    const dbRef = ref(db);
    const snap = await get(child(dbRef, `Users`));
    if (!snap.exists()) return null;
    const users = snap.val();
    for (const [id, u] of Object.entries(users)) {
      if ((u.email || "").toLowerCase() === emailToFind.toLowerCase()) {
        return { id, ...u };
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return alert("Email required");

    // try to find existing user
    const existing = await findUserByEmail(email);
    if (existing) {
      localStorage.setItem("user", JSON.stringify({ userId: existing.id, ...existing }));
      // contributors go to profile, industries to marketplace
      navigate(mode === "contributor" ? "/profile" : "/marketplace");
      return;
    }

    // create user
    const newId = uuidv4();
    const userObj = {
      email,
      fullName: fullName || (mode === "industry" ? companyName : ""),
      role: mode === "contributor" ? "contributor" : "industry",
      phone: phone || "",
      createdAt: Date.now(),
      // optional fields contributors may fill later
      picUrl: "",
      userId: newId
    };
    await set(ref(db, `Users/${newId}`), userObj);
    localStorage.setItem("user", JSON.stringify({ userId: newId, ...userObj }));
    navigate(mode === "contributor" ? "/profile" : "/marketplace");
  };

  return (
    <div className="max-w-xl mx-auto bg-gray-900 rounded-lg p-6 shadow">
      <h1 className="text-2xl font-bold text-green-300 mb-4">Marketplace Login</h1>

      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setMode("contributor")}
          className={`px-3 py-1 rounded ${mode === "contributor" ? "bg-green-600" : "bg-gray-800"}`}
        >
          Contributor
        </button>
        <button
          onClick={() => setMode("industry")}
          className={`px-3 py-1 rounded ${mode === "industry" ? "bg-green-600" : "bg-gray-800"}`}
        >
          Industry
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm text-gray-300">Email</label>
          <input
            type="email"
            className="w-full mt-1 p-2 rounded bg-black text-white border border-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {mode === "contributor" ? (
          <div>
            <label className="text-sm text-gray-300">Full Name</label>
            <input
              className="w-full mt-1 p-2 rounded bg-black text-white border border-gray-700"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        ) : (
          <>
            <div>
              <label className="text-sm text-gray-300">Company / Industry Name</label>
              <input
                className="w-full mt-1 p-2 rounded bg-black text-white border border-gray-700"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-300">Contact Person</label>
              <input
                className="w-full mt-1 p-2 rounded bg-black text-white border border-gray-700"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </>
        )}

        <div>
          <label className="text-sm text-gray-300">Phone (optional)</label>
          <input
            className="w-full mt-1 p-2 rounded bg-black text-white border border-gray-700"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <button className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">Continue</button>
        </div>
      </form>
    </div>
  );
}

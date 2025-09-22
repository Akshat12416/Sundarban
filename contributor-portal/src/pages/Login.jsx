// src/pages/Login.jsx
import React from "react";
import { auth, provider, db } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { ref, set, get, child } from "firebase/database";

export default function Login() {
  const signIn = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      const user = res.user;

      const userRef = ref(db, `Users/${user.uid}`);
      const snapshot = await get(child(ref(db), `Users/${user.uid}`));

      if (!snapshot.exists()) {
        await set(userRef, {
          userId: user.uid,
          fullName: user.displayName,
          email: user.email,
          picUrl: user.photoURL,
        });
      }

      // 🚀 no redirect needed here, App.jsx will auto-redirect
    } catch (err) {
      console.error(err);
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-green-700">
          Contributor Portal
        </h2>
        <p className="text-sm mb-6">
          Sign in with Google to continue (MetaMask link later).
        </p>
        <button
          onClick={signIn}
          className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

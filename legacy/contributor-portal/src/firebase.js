// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase config (from your Admin portal)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAc8tjDida4qmwQ7QJJ_EceMwAgOg2mk64",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "carbonvault-c2f6a.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://carbonvault-c2f6a-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "carbonvault-c2f6a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "carbonvault-c2f6a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "794261395085",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:794261395085:web:06abb7a146f6ae4890b4c4",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-207HLVB62W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth + Provider
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Realtime Database
export const db = getDatabase(app);

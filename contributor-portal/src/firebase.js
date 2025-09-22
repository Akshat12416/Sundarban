// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase config (from your Admin portal)
const firebaseConfig = {
  apiKey: "AIzaSyAc8tjDida4qmwQ7QJJ_EceMwAgOg2mk64",
  authDomain: "carbonvault-c2f6a.firebaseapp.com",
  databaseURL: "https://carbonvault-c2f6a-default-rtdb.firebaseio.com",
  projectId: "carbonvault-c2f6a",
  storageBucket: "carbonvault-c2f6a.firebasestorage.app",
  messagingSenderId: "794261395085",
  appId: "1:794261395085:web:06abb7a146f6ae4890b4c4",
  measurementId: "G-207HLVB62W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth + Provider
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Realtime Database
export const db = getDatabase(app);

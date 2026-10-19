import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

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


const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

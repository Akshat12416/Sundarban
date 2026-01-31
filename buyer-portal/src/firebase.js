import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

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


const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

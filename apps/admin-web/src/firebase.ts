import { initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.length > 0,
);

export const firebaseApp: FirebaseApp | null = firebaseConfigured
  ? initializeApp(firebaseConfig)
  : null;

export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;

export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;

function emulatorUrl(host: string): string {
  return host.startsWith("http") ? host : `http://${host}`;
}

const authHost = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST;
if (auth && authHost) {
  connectAuthEmulator(auth, emulatorUrl(authHost), { disableWarnings: true });
}

const firestoreHost = import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST;
if (db && firestoreHost) {
  const bare = firestoreHost.replace(/^https?:\/\//, "");
  const [name, port] = bare.split(":");
  connectFirestoreEmulator(db, name, Number(port || "8080"));
}

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

export function getFirebaseAuth(): Auth | null {
  if (!firebaseConfigured || !config.apiKey || !config.projectId || !config.appId) {
    return null;
  }
  if (!app) {
    app = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    });
  }
  if (!auth) {
    auth = getAuth(app);
  }
  return auth;
}

export function getFirebaseDb(): Firestore | null {
  const host = process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST;
  if (!host) {
    return null;
  }
  const ready = getFirebaseAuth();
  if (!ready || !app) {
    return null;
  }
  if (!firestore) {
    firestore = getFirestore(app);
    const [name, port] = host.split(":");
    connectFirestoreEmulator(firestore, name, Number(port || "8080"));
  }
  return firestore;
}

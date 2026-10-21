import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { firebaseConfigured, getFirebaseAuth } from "../firebase";

type Session = {
  uid: string;
  email: string;
  sample: boolean;
};

type AuthValue = {
  ready: boolean;
  session: Session | null;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  useSample: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

function normalizeEmail(value: string): string {
  return value
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
}

export function readableAuthError(caught: unknown): string {
  const code =
    typeof caught === "object" && caught !== null && "code" in caught
      ? String((caught as { code: unknown }).code)
      : "";
  if (code === "auth/invalid-email") {
    return "Enter a full email address, such as name@gmail.com, with no spaces.";
  }
  if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
    return "That email and password do not match an account. Use Create account if this is the first time.";
  }
  if (code === "auth/email-already-in-use") {
    return "That email already has an account. Use Sign in.";
  }
  if (code === "auth/weak-password") {
    return "Use a password of at least 6 characters.";
  }
  if (code === "auth/operation-not-allowed") {
    return "Email and password sign-in is turned off in the Firebase console.";
  }
  return caught instanceof Error ? caught.message : "Sign-in failed";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!firebaseConfigured);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }
    return onAuthStateChanged(auth, (user: User | null) => {
      setSession(user ? { uid: user.uid, email: user.email ?? "", sample: false } : null);
      setReady(true);
    });
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      ready,
      session,
      configured: firebaseConfigured,
      async signIn(email, password) {
        const auth = getFirebaseAuth();
        if (!auth) {
          throw new Error("Add the Firebase web keys to apps/mobile/.env, or use sample data.");
        }
        await signInWithEmailAndPassword(auth, requireEmail(email), password);
      },
      async signUp(email, password) {
        const auth = getFirebaseAuth();
        if (!auth) {
          throw new Error("Add the Firebase web keys to apps/mobile/.env, or use sample data.");
        }
        await createUserWithEmailAndPassword(auth, requireEmail(email), password);
      },
      useSample() {
        setSession({ uid: "sample", email: "sample@sundarban.local", sample: true });
        setReady(true);
      },
      async signOut() {
        const auth = getFirebaseAuth();
        if (auth && session && !session.sample) {
          await signOut(auth);
        }
        setSession(null);
      },
    }),
    [ready, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function requireEmail(value: string): string {
  const email = normalizeEmail(value);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a full email address, such as name@gmail.com, with no spaces.");
  }
  return email;
}

export function useSession() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useSession must be used inside AuthProvider");
  }
  return value;
}

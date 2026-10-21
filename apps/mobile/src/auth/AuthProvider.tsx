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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!firebaseConfigured);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }
    return onAuthStateChanged(auth, (user: User | null) => {
      setSession(user?.email ? { email: user.email, sample: false } : null);
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
        await signInWithEmailAndPassword(auth, email.trim(), password);
      },
      async signUp(email, password) {
        const auth = getFirebaseAuth();
        if (!auth) {
          throw new Error("Add the Firebase web keys to apps/mobile/.env, or use sample data.");
        }
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      },
      useSample() {
        setSession({ email: "sample@sundarban.local", sample: true });
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

export function useSession() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useSession must be used inside AuthProvider");
  }
  return value;
}

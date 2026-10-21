import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { auth } from "./firebase";

type Session = {
  user: User | null;
  ready: boolean;
  error: string;
  signIn: () => Promise<void>;
  signOutAdmin: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(auth === null);
  const [error, setError] = useState("");

  useEffect(() => {
    const firebaseAuth = auth;
    if (!firebaseAuth) {
      return;
    }
    void getRedirectResult(firebaseAuth).catch((caught: unknown) => {
      setError(caught instanceof Error ? caught.message : "Google sign-in failed");
    });
    return onAuthStateChanged(firebaseAuth, async (next) => {
      if (!next) {
        setUser(null);
        setReady(true);
        return;
      }
      const token = await next.getIdTokenResult(true);
      if (token.claims.role !== "admin") {
        setError("This Google account does not have the admin claim.");
        await signOut(firebaseAuth);
        setUser(null);
        setReady(true);
        return;
      }
      setError("");
      setUser(next);
      setReady(true);
    });
  }, []);

  const value = useMemo<Session>(
    () => ({
      user,
      ready,
      error,
      async signIn() {
        if (!auth) {
          setError("Firebase web config is missing.");
          return;
        }
        setError("");
        const provider = new GoogleAuthProvider();
        try {
          await signInWithPopup(auth, provider);
        } catch (caught) {
          const code = caught && typeof caught === "object" && "code" in caught ? String(caught.code) : "";
          if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
            await signInWithRedirect(auth, provider);
            return;
          }
          if (code !== "auth/popup-closed-by-user") {
            setError(caught instanceof Error ? caught.message : "Google sign-in failed");
          }
        }
      },
      async signOutAdmin() {
        if (auth) {
          await signOut(auth);
        }
      },
    }),
    [error, ready, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("SessionProvider is missing");
  }
  return value;
}

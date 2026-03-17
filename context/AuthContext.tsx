"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  User,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  Unsubscribe as AuthUnsubscribe,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserDoc, subscribeToUserDoc } from "@/lib/firestore";
import { UserDoc } from "@/types";

interface AuthContextValue {
  user: User | null;
  userDoc: UserDoc | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  userDoc: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  // Stable callback so the effect doesn't re-run on every render
  const handleUserDoc = useCallback((doc: UserDoc) => {
    setUserDoc(doc);
  }, []);

  useEffect(() => {
    let unsubDoc: AuthUnsubscribe | null = null;

    // Explicitly set persistence to surviving browser restarts
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.error("Auth persistence error:", err);
    });

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        // Clean up previous Firestore listener
        if (unsubDoc) {
          unsubDoc();
          unsubDoc = null;
        }

        if (firebaseUser) {
          setUser(firebaseUser);

          // Set lightweight auth cookie for middleware route protection
          // Extended to 1 year (31536000 seconds)
          document.cookie =
            "segreclaim_authed=1; path=/; max-age=31536000; SameSite=Lax";

          // Ensure user doc exists (no-op if already created)
          await createUserDoc(
            firebaseUser.uid,
            firebaseUser.displayName ?? "Recycler",
            firebaseUser.phoneNumber ?? ""
          );

          // Subscribe to real-time user doc updates
          unsubDoc = subscribeToUserDoc(firebaseUser.uid, handleUserDoc);
        } else {
          // Clear auth cookie on sign-out
          document.cookie =
            "segreclaim_authed=; path=/; max-age=0; SameSite=Lax";
          setUser(null);
          setUserDoc(null);
        }
      } catch (error) {
        console.error("Error in onAuthStateChanged:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubDoc) unsubDoc();
    };
  }, [handleUserDoc]);

  return (
    <AuthContext.Provider value={{ user, userDoc, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

/**
 * AuthContext
 * Provides: currentUser, userDoc, loading, signInWithGoogle, signOut
 * userDoc is fetched via API (Admin SDK) to avoid Firestore security rule issues.
 */

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut as fbSignOut,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";
import { userApi } from "../services/api.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserDoc(user);
      } else {
        setUserDoc(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function fetchUserDoc(user) {
    try {
      const res = await userApi.sync({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
      });
      if (res.data?.data) {
        setUserDoc(res.data.data);
      }
    } catch {
      setUserDoc({ uid: user.uid, isPremium: false });
    }
  }

  async function refreshUserDoc() {
    if (!currentUser) return;
    try {
      const res = await userApi.getMe();
      if (res.data?.data) setUserDoc(res.data.data);
    } catch {
      // keep existing userDoc on failure
    }
  }

  async function signInWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

  async function signOut() {
    await fbSignOut(auth);
    setUserDoc(null);
  }

  const value = {
    currentUser,
    userDoc,
    loading,
    isPremium: userDoc?.isPremium === true,
    signInWithGoogle,
    signOut,
    refreshUserDoc,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

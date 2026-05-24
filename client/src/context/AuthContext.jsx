/**
 * AuthContext
 * Provides: currentUser, userDoc, loading, signInWithGoogle, signOut
 * userDoc is the Firestore document — includes isPremium flag.
 */

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut as fbSignOut,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserDoc(user);
      } else {
        setUserDoc(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  /**
   * Create or refresh the Firestore user document.
   * Does NOT overwrite isPremium if already true.
   */
  async function syncUserDoc(user) {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      const newDoc = {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        isPremium: false,
        premiumActivatedAt: null,
        paymentId: null,
        createdAt: serverTimestamp(),
      };
      await setDoc(ref, newDoc);
      setUserDoc(newDoc);
    } else {
      setUserDoc({ uid: user.uid, ...snap.data() });
    }
  }

  /** Re-fetch userDoc from Firestore (call after payment verification). */
  async function refreshUserDoc() {
    if (!currentUser) return;
    const ref = doc(db, "users", currentUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) setUserDoc({ uid: currentUser.uid, ...snap.data() });
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

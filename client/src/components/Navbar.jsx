import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { usePayment } from "../hooks/usePayment";
import toast from "react-hot-toast";

const S = {
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 6vw", height: 64,
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(10,10,12,0.85)", backdropFilter: "blur(20px)",
    fontFamily: "DM Sans, sans-serif",
  },
  logo: { display: "flex", alignItems: "center", gap: 10, textDecoration: "none" },
  logoIcon: {
    width: 34, height: 34, borderRadius: 10, background: "#ff2d2d",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontSize: 16, boxShadow: "0 0 20px rgba(255,45,45,0.3)",
  },
  logoText: {
    fontFamily: "Bebas Neue, sans-serif", fontSize: 20,
    letterSpacing: "0.1em", color: "#f0f0f0",
  },
  signInBtn: {
    padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
    background: "none", color: "#f0f0f0", fontSize: 14,
    fontFamily: "DM Sans, sans-serif", cursor: "pointer",
  },
  premiumBtn: (disabled) => ({
    padding: "9px 20px", borderRadius: 8, border: "none",
    background: "linear-gradient(135deg,#ffd700,#ffb300)",
    color: "#000", fontSize: 14, fontWeight: 800,
    fontFamily: "DM Sans, sans-serif", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    boxShadow: "0 0 20px rgba(255,215,0,0.2)",
  }),
  avatar: {
    width: 36, height: 36, borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.1)",
    cursor: "pointer", overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#ff2d2d", color: "#fff", fontSize: 14, fontWeight: 700,
  },
  dropdown: {
    position: "absolute", right: 0, top: "calc(100% + 8px)",
    width: 210, borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#111116", boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    overflow: "hidden", zIndex: 200,
  },
  dropItem: {
    width: "100%", padding: "10px 18px", background: "none", border: "none",
    color: "#ccc", fontSize: 14, cursor: "pointer",
    fontFamily: "DM Sans, sans-serif", textAlign: "left",
  },
};

export default function Navbar() {
  const { currentUser, isPremium, signInWithGoogle, signOut } = useAuth();
  const { initiatePayment, paying } = usePayment();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleSignIn() {
    try { await signInWithGoogle(); toast.success("Signed in!"); }
    catch { toast.error("Sign-in failed. Please try again."); }
  }

  async function handleSignOut() {
    await signOut(); navigate("/"); toast.success("Signed out."); setMenuOpen(false);
  }

  const initial = currentUser?.displayName?.[0] || currentUser?.email?.[0] || "U";

  return (
    <nav style={S.nav}>
      {/* Logo */}
      <a href="/" style={S.logo}>
        <div style={S.logoIcon}>▶</div>
        <span style={S.logoText}>Tube<span style={{ color: "#ff2d2d" }}>Drop</span></span>
      </a>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {isPremium && (
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
            padding: "4px 12px", borderRadius: 99, color: "#ffd700",
            background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)" }}>
            ★ PREMIUM
          </span>
        )}

        {currentUser ? (
          <div style={{ position: "relative" }}>
            <div style={S.avatar} onClick={() => setMenuOpen((p) => !p)}>
              {currentUser.photoURL
                ? <img src={currentUser.photoURL} alt="avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initial.toUpperCase()
              }
            </div>

            <AnimatePresence>
              {menuOpen && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}
                  style={S.dropdown}>
                  <div style={{ padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <p style={{ fontSize: 12, color: "#555", margin: 0,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {currentUser.email}
                    </p>
                    {isPremium && (
                      <p style={{ fontSize: 11, color: "#ffd700", fontWeight: 700, margin: "4px 0 0" }}>
                        ★ Lifetime Premium
                      </p>
                    )}
                  </div>
                  <button style={S.dropItem}
                    onClick={() => { navigate("/history"); setMenuOpen(false); }}>
                    📂 Download History
                  </button>
                  {!isPremium && (
                    <button style={{ ...S.dropItem, color: "#ffd700" }}
                      disabled={paying}
                      onClick={() => { initiatePayment(); setMenuOpen(false); }}>
                      ★ Upgrade — Rs.1
                    </button>
                  )}
                  <button style={S.dropItem} onClick={handleSignOut}>Sign out</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            <button style={S.signInBtn} onClick={handleSignIn}>Sign in</button>
            <button style={S.premiumBtn(paying)} onClick={initiatePayment} disabled={paying}>
              Get Premium — Rs.1
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

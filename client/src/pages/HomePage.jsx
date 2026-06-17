import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DownloadCard from "../components/DownloadCard";
import { usePayment } from "../hooks/usePayment";

const FEATURES = [
  { icon: "⚡", title: "Lightning Fast",   desc: "Metadata in under 3 seconds. Downloads start instantly with priority queuing." },
  { icon: "🌐", title: "Multi-Platform",   desc: "YouTube, Instagram, Facebook, Twitter/X, TikTok, Pinterest, Dailymotion, Vimeo & more." },
  { icon: "🎵", title: "MP3 Export",       desc: "Extract clean audio from any video. Perfect for music, podcasts, and reels." },
  { icon: "🔒", title: "Secure & Private", desc: "No file storage on our servers. Downloads stream directly to your device." },
];

const FAQS = [
  { q: "Is it free to use?",              a: "Yes! Free users can download 360p videos without signing up. Premium unlocks 720p, 1080p, 4K, and MP3 for just Rs.1 — once, forever." },
  { q: "Which platforms are supported?",  a: "YouTube, Instagram, Facebook, Twitter/X, TikTok, Pinterest, Dailymotion, Vimeo — just paste any link and download." },
  { q: "How does the Rs.1 premium work?", a: "A single payment of Rs.1 via Razorpay gives you lifetime access to 4K, 1080p, 720p, and MP3. No subscription, no auto-renewal." },
  { q: "Do I need to sign in?",           a: "Not for free 360p downloads. Login is required to activate and carry your premium status across sessions." },
  { q: "What formats are supported?",     a: "MP4 video in 360p, 720p, 1080p, 4K, and MP3 audio extraction. All from one link." },
];

const staggerContainer = { animate: { transition: { staggerChildren: 0.08 } } };
const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ── FaqItem ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderRadius: 14,
      border: `1px solid ${open ? "rgba(255,45,45,0.3)" : "rgba(255,255,255,0.07)"}`,
      background: "#111116",
      overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "18px 22px",
          background: "none", border: "none", color: open ? "#ff2d2d" : "#f0f0f0",
          fontSize: 15, fontWeight: 600, cursor: "pointer",
          fontFamily: "DM Sans, sans-serif", textAlign: "left",
        }}>
        {q}
        <span style={{ fontSize: 20, marginLeft: 16, transition: "transform 0.2s", display: "inline-block",
          transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}>
            <p style={{ padding: "0 22px 18px", fontSize: 14, color: "#666", lineHeight: 1.7 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── HomePage ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { initiatePayment, paying } = usePayment();

  return (
    <div style={{ fontFamily: "DM Sans, sans-serif" }}>

      {/* HERO */}
      <section style={{ position: "relative", padding: "80px 6vw 60px", textAlign: "center", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "flex-start", justifyContent: "center", pointerEvents: "none",
        }}>
          <div style={{ marginTop: 64, width: 600, height: 400, borderRadius: "50%",
            background: "rgba(255,45,45,0.08)", filter: "blur(120px)" }} />
        </div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28,
            padding: "6px 16px", borderRadius: 99, fontSize: 12, fontWeight: 700,
            letterSpacing: "0.15em", textTransform: "uppercase",
            background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.25)", color: "#ff2d2d" }}>
          ★ Universal Media Downloader
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "clamp(52px,10vw,120px)",
            lineHeight: 0.95, margin: "0 0 24px", color: "#f0f0f0", letterSpacing: "0.01em" }}>
          Download<br />
          <span style={{ color: "#ff2d2d", textShadow: "0 0 80px rgba(255,45,45,0.4)" }}>Any Media.</span>
          <br />Instantly.
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ color: "#666", fontSize: "clamp(15px,2vw,18px)", maxWidth: 520,
            margin: "0 auto 48px", lineHeight: 1.7 }}>
          Paste any link from YouTube, Instagram, Facebook, Twitter, TikTok, Pinterest and more.
          Get your media in seconds. 4K downloads for just Rs.1 — lifetime.
        </motion.p>

        <DownloadCard />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center",
            flexWrap: "wrap", gap: 24, marginTop: 40 }}>
          {["No signup for free", "Secure HTTPS", "Mobile friendly", "Zero file storage"].map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#555" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff2d2d", display: "inline-block" }} />
              {t}
            </div>
          ))}
        </motion.div>
      </section>

      <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0 6vw" }} />

      {/* FEATURES */}
      <section style={{ padding: "80px 6vw", maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "#ff2d2d",
          textTransform: "uppercase", marginBottom: 12 }}>Why TubeDrop</p>
        <h2 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "clamp(36px,5vw,64px)",
          lineHeight: 1, margin: "0 0 16px", color: "#f0f0f0" }}>
          Built for Speed.<br />Designed for You.
        </h2>
        <p style={{ color: "#555", fontSize: 16, maxWidth: 480, lineHeight: 1.6, marginBottom: 48 }}>
          No bloat, no friction. Just paste, click, download.
        </p>

        <motion.div variants={staggerContainer} initial="initial" whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
          {FEATURES.map((f) => (
            <motion.div key={f.title} variants={staggerItem}
              whileHover={{ y: -4, borderColor: "rgba(255,45,45,0.3)" }}
              style={{ padding: "28px 24px", borderRadius: 16, background: "#111116",
                border: "1px solid rgba(255,255,255,0.07)", transition: "border-color 0.2s" }}>
              <span style={{ fontSize: 32, display: "block", marginBottom: 16 }}>{f.icon}</span>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f0", marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0 6vw" }} />

      {/* PREMIUM */}
      <section style={{ padding: "80px 6vw", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ width: 500, height: 300, borderRadius: "50%",
            background: "rgba(255,215,0,0.05)", filter: "blur(100px)" }} />
        </div>

        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "#ffd700",
            textTransform: "uppercase", marginBottom: 12 }}>Premium</p>
          <h2 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "clamp(36px,5vw,64px)",
            lineHeight: 1, margin: "0 0 48px", color: "#f0f0f0" }}>
            One Rupee.<br />Lifetime Access.
          </h2>

          <div style={{ borderRadius: 24, border: "1px solid rgba(255,215,0,0.2)",
            background: "linear-gradient(135deg,#111116 0%,rgba(255,215,0,0.03) 100%)",
            padding: "48px 40px" }}>
            <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 88, color: "#ffd700",
              lineHeight: 1, textShadow: "0 0 60px rgba(255,215,0,0.3)" }}>Rs.1</div>
            <p style={{ fontSize: 14, color: "#555", margin: "8px 0 32px" }}>
              One-time payment. No subscription. No tricks.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", textAlign: "left" }}>
              {["4K, 1080p & 720p HD Downloads", "MP3 Audio Extraction",
                "YouTube + Instagram + More", "Priority Download Queue",
                "Ad-Free Experience"].map((perk) => (
                <li key={perk} style={{ display: "flex", alignItems: "center", gap: 12,
                  fontSize: 15, color: "#f0f0f0", marginBottom: 12 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, color: "#ffd700" }}>✓</span>
                  {perk}
                </li>
              ))}
            </ul>

            <button onClick={initiatePayment} disabled={paying}
              style={{ width: "100%", padding: "16px 0", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#ffd700,#ffb300)", color: "#000",
                fontSize: 16, fontWeight: 900, fontFamily: "DM Sans, sans-serif",
                cursor: paying ? "not-allowed" : "pointer", opacity: paying ? 0.6 : 1,
                boxShadow: "0 0 40px rgba(255,215,0,0.25)" }}>
              {paying ? "Processing..." : "★ Unlock Premium for Rs.1"}
            </button>
            <p style={{ fontSize: 12, color: "#444", marginTop: 12 }}>
              Powered by Razorpay · Secure · Instant activation
            </p>
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0 6vw" }} />

      {/* FAQ */}
      <section style={{ padding: "80px 6vw", maxWidth: 800, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "#ff2d2d",
          textTransform: "uppercase", marginBottom: 12 }}>FAQ</p>
        <h2 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "clamp(36px,5vw,64px)",
          lineHeight: 1, margin: "0 0 40px", color: "#f0f0f0" }}>Got Questions?</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "32px 6vw",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16, color: "#444", fontSize: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#ff2d2d",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 13 }}>▶</div>
          <span style={{ fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.12em",
            fontSize: 16, color: "rgba(240,240,240,0.7)" }}>TubeDrop</span>
        </div>
        <span>© 2025 TubeDrop · Built for India & beyond</span>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Contact"].map((l) => (
            <a key={l} href="#" style={{ color: "#444", textDecoration: "none" }}
              onMouseOver={(e) => e.target.style.color = "#888"}
              onMouseOut={(e) => e.target.style.color = "#444"}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}

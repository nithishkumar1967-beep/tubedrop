/**
 * DownloadCard — core URL input, metadata display, quality selection, download
 */
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVideoInfo } from "../hooks/useVideoInfo";
import { useDownload } from "../hooks/useDownload";
import { useAuth } from "../context/AuthContext";
import { usePayment } from "../hooks/usePayment";
import toast from "react-hot-toast";

const PLATFORM_INFO = {
  youtube:    { label: "YouTube",    color: "#ff2d2d", icon: "▶" },
  instagram:  { label: "Instagram",  color: "#e4405f", icon: "📷" },
  facebook:   { label: "Facebook",   color: "#1877f2", icon: "👍" },
  twitter:    { label: "Twitter / X",color: "#1da1f2", icon: "🐦" },
  tiktok:     { label: "TikTok",     color: "#000000", icon: "🎵" },
  pinterest:  { label: "Pinterest",  color: "#e60023", icon: "📌" },
  dailymotion:{ label: "Dailymotion",color: "#00d2f3", icon: "🎬" },
  vimeo:      { label: "Vimeo",      color: "#1ab7ea", icon: "🎥" },
};

const QUALITIES = [
  { key: "360p",  label: "360p MP4",  free: true     },
  { key: "720p",  label: "720p MP4",  free: false    },
  { key: "1080p", label: "1080p MP4", free: false    },
  { key: "4K",    label: "4K MP4",    free: false    },
  { key: "mp3",   label: "MP3 Audio", free: false    },
];

const QUALITY_BADGES = {
  "360p":  { label: "FREE",  color: "#ff6b6b", bg: "rgba(255,107,107,0.1)", border: "rgba(255,107,107,0.3)" },
  "720p":  { label: "✓ HD",  color: "#4ade80", bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.3)" },
  "1080p": { label: "✓ FHD", color: "#4ade80", bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.3)" },
  "4K":    { label: "✦ 4K",  color: "#ffd700", bg: "rgba(255,215,0,0.1)",   border: "rgba(255,215,0,0.3)" },
  "mp3":   { label: "✓ MP3", color: "#c084fc", bg: "rgba(192,132,252,0.1)", border: "rgba(192,132,252,0.3)" },
};

function formatDuration(secs) {
  if (!secs) return "";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const card = {
  wrapper: {
    width: "100%", maxWidth: 680, margin: "0 auto",
    borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)",
    background: "#111116", padding: 28,
    boxShadow: "0 0 80px rgba(255,45,45,0.06), 0 40px 80px rgba(0,0,0,0.5)",
  },
  input: {
    flex: 1, background: "#18181f", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12, padding: "14px 18px", color: "#f0f0f0",
    fontSize: 15, fontFamily: "DM Sans, sans-serif", outline: "none",
  },
  fetchBtn: (loading) => ({
    display: "flex", alignItems: "center", gap: 8,
    padding: "14px 26px", borderRadius: 12, border: "none",
    background: "#ff2d2d", color: "#fff", fontSize: 15,
    fontWeight: 700, fontFamily: "DM Sans, sans-serif",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.6 : 1,
    boxShadow: "0 0 20px rgba(255,45,45,0.3)",
    whiteSpace: "nowrap",
  }),
  qualityBtn: (locked) => ({
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px", borderRadius: 10, border: "none",
    background: "#18181f", color: "#f0f0f0",
    cursor: locked ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600,
    fontFamily: "DM Sans, sans-serif",
    opacity: locked ? 0.5 : 1,
    outline: "1px solid rgba(255,255,255,0.07)",
    transition: "outline 0.2s, opacity 0.2s",
  }),
};

export default function DownloadCard() {
  const [url, setUrl] = useState("");
  const inputRef = useRef();
  const { videoData, loading, error, fetchInfo, reset } = useVideoInfo();
  const { startDownload, downloading, progress } = useDownload();
  const { isPremium, currentUser } = useAuth();
  const { initiatePayment, paying } = usePayment();

  async function handleFetch(e) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) { inputRef.current?.focus(); return; }
    await fetchInfo(trimmed);
  }

  async function handleDownload(quality, isFree) {
    if (!isFree && !isPremium) {
      if (!currentUser) {
        toast("Sign in first, then upgrade to premium!", { icon: "🔒" });
      } else {
        await initiatePayment();
      }
      return;
    }
    await startDownload({ url: url.trim(), quality, isPremium });
  }

  const platform = videoData?.platform
    ? PLATFORM_INFO[videoData.platform.toLowerCase()] || null
    : null;

  const has4k = videoData?.qualities?.includes("4K");

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}>
      <div style={card.wrapper}>

        {/* URL form */}
        {!videoData && (
          <form onSubmit={handleFetch} style={{ display: "flex", gap: 12 }}>
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste video / reel / post link here..."
              disabled={loading}
              style={card.input}
            />
            <button type="submit" disabled={loading || !url.trim()} style={card.fetchBtn(loading)}>
              {loading ? <><SpinIcon /> Fetching…</> : <>▼ Fetch</>}
            </button>
          </form>
        )}

        {/* Loading bar */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ marginTop: 16, height: 3, borderRadius: 99, background: "#18181f", overflow: "hidden" }}>
              <motion.div initial={{ width: "0%" }} animate={{ width: "85%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                style={{ height: "100%", background: "#ff2d2d" }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Download progress */}
        <AnimatePresence>
          {downloading && progress > 0 && progress < 100 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ marginTop: 16, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888", marginBottom: 4 }}>
                <span>Downloading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 99, background: "#18181f", overflow: "hidden" }}>
                <motion.div
                  animate={{ width: `${progress}%` }}
                  style={{ height: "100%", background: "linear-gradient(90deg,#ff2d2d,#ff6b6b)", borderRadius: 99 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12,
                background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.3)" }}>
              <p style={{ fontSize: 14, color: "#ff6b6b", margin: 0 }}>{error}</p>
              <button onClick={reset}
                style={{ marginTop: 8, fontSize: 12, color: "#ff6b6b", background: "none",
                  border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {videoData && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

              {/* Meta */}
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start",
                padding: 16, borderRadius: 12, background: "#18181f",
                border: "1px solid rgba(255,255,255,0.05)", marginBottom: 16 }}>
                {videoData.thumbnail ? (
                  <img src={videoData.thumbnail} alt="thumb"
                    style={{ width: 100, height: 60, objectFit: "cover",
                      borderRadius: 8, flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)" }} />
                ) : (
                  <div style={{ width: 100, height: 60, borderRadius: 8, flexShrink: 0,
                    background: "#0d0d14", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 24 }}>
                    {platform?.icon || "▶"}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f0", margin: "0 0 4px",
                    lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {videoData.title}
                  </p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 6 }}>
                    {platform && (
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                        padding: "3px 8px", borderRadius: 99, color: platform.color,
                        border: `1px solid ${platform.color}33`, background: `${platform.color}11` }}>
                        {platform.icon} {platform.label}
                      </span>
                    )}
                    {videoData.uploader && (
                      <span style={{ fontSize: 11, color: "#666" }}>{videoData.uploader}</span>
                    )}
                    {videoData.durationSeconds > 0 && (
                      <span style={{ fontSize: 11, color: "#555" }}>🕐 {formatDuration(videoData.durationSeconds)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quality grid - auto-download on first click */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {QUALITIES.filter((q) =>
                  q.free || (videoData.qualities && videoData.qualities.includes(q.key))
                ).map((q) => {
                  const locked = !q.free && !isPremium;
                  const badge = QUALITY_BADGES[q.key];
                  return (
                    <button key={q.key} disabled={downloading || paying || locked}
                      onClick={() => {
                        if (locked) {
                          if (!currentUser) {
                            toast("Sign in first, then upgrade!", { icon: "🔒" });
                          } else {
                            initiatePayment();
                          }
                          return;
                        }
                        handleDownload(q.key, q.free);
                      }}
                      style={card.qualityBtn(locked)}>
                      <span>⬇ {q.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                        color: badge.color, background: badge.bg, border: `1px solid ${badge.border}` }}>
                        {badge.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {has4k && !isPremium && (
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: "#ffd700", background: "rgba(255,215,0,0.08)",
                    padding: "6px 14px", borderRadius: 99, border: "1px solid rgba(255,215,0,0.2)" }}>
                    ✦ 4K available — Upgrade for Rs.1 to download
                  </span>
                </div>
              )}

              <div style={{ textAlign: "center" }}>
                <button onClick={() => { reset(); setUrl(""); }}
                  style={{ background: "none", border: "none", color: "#555",
                    fontSize: 13, cursor: "pointer", textDecoration: "underline",
                    fontFamily: "DM Sans, sans-serif" }}>
                  ↩ Try another URL
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!videoData && !loading && !error && (
          <p style={{ textAlign: "center", fontSize: 12, color: "#444", marginTop: 16 }}>
            Supports YouTube, Instagram, Facebook, Twitter/X, TikTok, Pinterest, Dailymotion, Vimeo
          </p>
        )}
      </div>
    </motion.div>
  );
}

function SpinIcon() {
  return (
    <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }}
      viewBox="0 0 24 24" fill="none">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
      <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

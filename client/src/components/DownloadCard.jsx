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

const QUALITIES = [
  { key: "360p",  label: "360p MP4",  free: true  },
  { key: "720p",  label: "720p MP4",  free: false },
  { key: "1080p", label: "1080p MP4", free: false },
  { key: "mp3",   label: "MP3 Audio", free: false },
];

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
  qualityBtn: (isFree, locked) => ({
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px", borderRadius: 10, border: "none",
    background: "#18181f", color: "#f0f0f0",
    cursor: "pointer", fontSize: 14, fontWeight: 600,
    fontFamily: "DM Sans, sans-serif",
    outline: `1px solid ${locked ? "rgba(255,215,0,0.2)" : isFree ? "rgba(255,255,255,0.07)" : "rgba(0,200,100,0.2)"}`,
    transition: "outline 0.2s",
  }),
};

export default function DownloadCard() {
  const [url, setUrl] = useState("");
  const inputRef = useRef();
  const { videoData, loading, error, fetchInfo, reset } = useVideoInfo();
  const { startDownload, downloading } = useDownload();
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
              placeholder="Paste YouTube link here..."
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
                    justifyContent: "center", fontSize: 24 }}>▶</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f0", margin: "0 0 4px",
                    lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {videoData.title}
                  </p>
                  {videoData.durationSeconds > 0 && (
                    <p style={{ fontSize: 12, color: "#555", margin: 0 }}>
                      🕐 {formatDuration(videoData.durationSeconds)}
                    </p>
                  )}
                </div>
              </div>

              {/* Quality grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {QUALITIES.filter((q) =>
                  q.free || (videoData.qualities && videoData.qualities.includes(q.key))
                ).map((q) => {
                  const locked = !q.free && !isPremium;
                  return (
                    <button key={q.key} disabled={downloading || paying}
                      onClick={() => handleDownload(q.key, q.free)}
                      style={card.qualityBtn(q.free, locked)}>
                      <span>⬇ {q.label}</span>
                      {locked
                        ? <Badge label="★ PRO"  color="#ffd700" bg="rgba(255,215,0,0.1)"  border="rgba(255,215,0,0.3)" />
                        : q.free
                          ? <Badge label="FREE"   color="#ff6b6b" bg="rgba(255,107,107,0.1)" border="rgba(255,107,107,0.3)" />
                          : <Badge label="✓ HD"   color="#4ade80" bg="rgba(74,222,128,0.1)"  border="rgba(74,222,128,0.3)" />
                      }
                    </button>
                  );
                })}
              </div>

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
            Supports youtube.com/watch, youtu.be, and YouTube Shorts
          </p>
        )}
      </div>
    </motion.div>
  );
}

function Badge({ label, color, bg, border }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
      color, background: bg, border: `1px solid ${border}` }}>{label}</span>
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

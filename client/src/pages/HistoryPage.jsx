import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { historyApi } from "../services/api.service";

const PLATFORM_ICONS = {
  youtube: "▶", instagram: "📷", facebook: "👍",
  twitter: "🐦", tiktok: "🎵", pinterest: "📌",
  dailymotion: "🎬", vimeo: "🎥",
};

const QUALITY_COLORS = {
  "360p": "#ff6b6b", "720p": "#4ade80", "1080p": "#4ade80",
  "4K": "#ffd700", "mp3": "#c084fc",
};

export default function HistoryPage() {
  const { currentUser } = useAuth();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const res = await historyApi.getHistory();
        setDownloads(res.data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div style={{ textAlign: "center", padding: "80px 6vw" }}>
        <h2 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 48, color: "#f0f0f0" }}>Sign in to view download history</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 6vw" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 48, margin: "0 0 32px", color: "#f0f0f0" }}>
          Download History
        </h1>

        {loading && <p style={{ color: "#555" }}>Loading...</p>}
        {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

        {!loading && downloads.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#555" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📂</p>
            <p>No downloads yet. Paste a link and start downloading!</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {downloads.map((d) => (
            <div key={d.id} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 18px", borderRadius: 12,
              background: "#111116", border: "1px solid rgba(255,255,255,0.07)",
            }}>
              <span style={{ fontSize: 20, width: 30, textAlign: "center" }}>
                {PLATFORM_ICONS[d.platform] || "🌐"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: 14, color: "#f0f0f0",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {d.videoUrl}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#555" }}>
                  {new Date(d.downloadedAt).toLocaleDateString()} at {new Date(d.downloadedAt).toLocaleTimeString()}
                </p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                color: QUALITY_COLORS[d.quality] || "#888",
                background: `${QUALITY_COLORS[d.quality] || "#888"}11`,
                border: `1px solid ${QUALITY_COLORS[d.quality] || "#888"}33`,
              }}>
                {d.quality}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

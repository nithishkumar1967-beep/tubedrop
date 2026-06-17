/**
 * useDownload hook
 * Handles both free and premium downloads.
 * Uses XMLHttpRequest for real download progress tracking.
 */

import { useState, useRef, useCallback } from "react";
import { downloadApi } from "../services/api.service";
import toast from "react-hot-toast";

export function useDownload() {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef(null);

  async function startDownload({ url, quality, isPremium }) {
    setDownloading(true);
    setProgress(0);

    const toastId = toast.loading(`Preparing ${quality} download...`);

    try {
      const endpoint = isPremium || quality === "360p"
        ? quality === "360p"
          ? downloadApi.getFreeUrl()
          : downloadApi.getPremiumUrl()
        : downloadApi.getFreeUrl();

      const response = await downloadApi.makeRequest(
        endpoint,
        { url, quality },
        (pct) => {
          setProgress(pct);
          if (pct > 0 && pct < 100) {
            toast.loading(`Downloading ${quality}... ${Math.round(pct)}%`, { id: toastId });
          }
        }
      );

      // Extract filename from Content-Disposition header
      const disposition = response.headers["content-disposition"] || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? decodeURIComponent(match[1]) : `tubedrop_${quality}.mp4`;

      // Create object URL and trigger download
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

      toast.success(`${quality} downloaded!`, { id: toastId });
      setProgress(100);
    } catch (err) {
      if (err.name !== "AbortError") {
        toast.error(err.message || "Download failed. Please try again.", { id: toastId });
      }
    } finally {
      setDownloading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  }

  const cancelDownload = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setDownloading(false);
      toast.dismiss();
    }
  }, []);

  return { startDownload, downloading, progress, cancelDownload };
}

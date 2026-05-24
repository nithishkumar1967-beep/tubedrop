/**
 * useDownload hook
 * Handles both free and premium downloads.
 * Triggers a browser file download from a blob URL.
 */

import { useState } from "react";
import { downloadApi } from "../services/api.service";
import toast from "react-hot-toast";

export function useDownload() {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function startDownload({ url, quality, isPremium }) {
    setDownloading(true);
    setProgress(0);

    const toastId = toast.loading(`Preparing ${quality} download...`);

    try {
      const response = isPremium || quality === "360p"
        ? quality === "360p"
          ? await downloadApi.free(url)
          : await downloadApi.premium(url, quality)
        : await downloadApi.free(url);

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

      toast.success("Download started!", { id: toastId });
      setProgress(100);
    } catch (err) {
      toast.error(err.message || "Download failed. Please try again.", { id: toastId });
    } finally {
      setDownloading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  }

  return { startDownload, downloading, progress };
}

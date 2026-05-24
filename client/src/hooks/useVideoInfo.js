/**
 * useVideoInfo hook
 * Fetches video metadata from the backend.
 */

import { useState } from "react";
import { videoApi } from "../services/api.service";

export function useVideoInfo() {
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchInfo(url) {
    setLoading(true);
    setError(null);
    setVideoData(null);

    try {
      const res = await videoApi.getInfo(url);
      setVideoData(res.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setVideoData(null);
    setError(null);
    setLoading(false);
  }

  return { videoData, loading, error, fetchInfo, reset };
}

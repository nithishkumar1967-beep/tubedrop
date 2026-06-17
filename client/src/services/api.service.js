/**
 * API Service — Axios instance with Firebase token auto-injection
 *
 * Interceptor fetches the Firebase ID token on every request so we never
 * store tokens in localStorage (XSS risk).
 */

import axios from "axios";
import { auth } from "../firebase/firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 120_000, // 120s — 4K files need more time
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach Bearer token if user is signed in ─────────
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken(/* forceRefresh */ false);
      config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // Token fetch failed — proceed without auth header
    }
  }
  return config;
});

// ── Response interceptor: normalize errors ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

// ── API Methods ───────────────────────────────────────────────────────────

export const videoApi = {
  getInfo: (url) => api.post("/video/info", { url }),
};

/**
 * Download with real progress tracking via XMLHttpRequest.
 * Returns a promise that resolves with an axios-like response object.
 */
function downloadWithProgress(url, data, onProgress) {
  return new Promise(async (resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${api.defaults.baseURL}${url}`);
    xhr.responseType = "blob";

    // Await auth token before setting headers and sending
    const user = auth.currentUser;
    let token = null;
    if (user) {
      try {
        token = await user.getIdToken(false);
      } catch { /* proceed without auth */ }
    }

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const contentType = xhr.getResponseHeader("content-type") || "application/octet-stream";
        const contentDisposition = xhr.getResponseHeader("content-disposition") || "";
        resolve({
          data: xhr.response,
          headers: {
            "content-type": contentType,
            "content-disposition": contentDisposition,
          },
        });
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errData = JSON.parse(reader.result);
            reject(new Error(errData.message || "Download failed."));
          } catch {
            reject(new Error(`Download failed with status ${xhr.status}.`));
          }
        };
        reader.onerror = () => reject(new Error("Download failed."));
        reader.readAsText(xhr.response);
      }
    };

    xhr.onerror = () => reject(new Error("Network error. Check your connection."));
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));

    xhr.send(JSON.stringify(data));
  });
}

export const downloadApi = {
  getFreeUrl: () => "/download/free",
  getPremiumUrl: () => "/download/premium",

  free: (url) =>
    api.post("/download/free", { url, quality: "360p" }, { responseType: "blob" }),

  premium: (url, quality) =>
    api.post("/download/premium", { url, quality }, { responseType: "blob" }),

  makeRequest: (endpoint, data, onProgress) =>
    downloadWithProgress(endpoint, data, onProgress),
};

export const paymentApi = {
  createOrder: (plan) => api.post("/payment/create-order", { plan: plan || "basic" }),
  verifyPayment: (payload) => api.post("/payment/verify", payload),
};

export const historyApi = {
  getHistory: () => api.get("/history"),
};

export const userApi = {
  getMe: () => api.get("/user/me"),
  sync: (data) => api.post("/user/sync", data),
};

export default api;

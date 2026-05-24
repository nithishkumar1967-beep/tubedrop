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
  timeout: 60_000, // 60s — downloads can be slow
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

export const downloadApi = {
  free: (url) =>
    api.post("/download/free", { url, quality: "360p" }, { responseType: "blob" }),

  premium: (url, quality) =>
    api.post("/download/premium", { url, quality }, { responseType: "blob" }),
};

export const paymentApi = {
  createOrder: () => api.post("/payment/create-order"),
  verifyPayment: (payload) => api.post("/payment/verify", payload),
};

export default api;

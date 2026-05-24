/**
 * CORS Configuration
 * Allowlist-based: only origins in ALLOWED_ORIGINS env var are permitted.
 */

"use strict";

const cors = require("cors");
const logger = require("../utils/logger");

function configureCors() {
  const rawOrigins = process.env.ALLOWED_ORIGINS || "";
  const allowedOrigins = rawOrigins
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    logger.warn("ALLOWED_ORIGINS is not set. CORS will block all cross-origin requests.");
  }

  return cors({
    origin(origin, callback) {
      // Allow server-to-server requests (no origin) only in dev
      if (!origin) {
        if (process.env.NODE_ENV === "development") return callback(null, true);
        return callback(new Error("CORS: No origin header"), false);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn(`CORS: Blocked request from origin: ${origin}`);
      callback(new Error(`CORS policy: origin '${origin}' is not allowed.`), false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // Cache preflight for 24h
  });
}

module.exports = { configureCors };

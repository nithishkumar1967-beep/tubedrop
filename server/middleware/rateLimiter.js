/**
 * Rate Limiting Middleware — express-rate-limit v7 compatible
 */
"use strict";

const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const MAX_GLOBAL = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100;
const MAX_DOWNLOAD = parseInt(process.env.DOWNLOAD_RATE_LIMIT_MAX, 10) || 10;
const MAX_PAYMENT = 5;

function makeLimitHandler(message) {
  return (req, res) => {
    logger.warn(`Rate limit hit - IP: ${req.ip} - Path: ${req.path}`);
    res.status(429).json({ success: false, message });
  };
}

const globalRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: MAX_GLOBAL,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: (req) => req.path === "/api/health",
  handler: makeLimitHandler("Too many requests. Please slow down and try again shortly."),
});

const downloadRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: MAX_DOWNLOAD,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: makeLimitHandler("Download limit reached. Please wait before downloading more videos."),
});

const paymentRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: MAX_PAYMENT,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: makeLimitHandler("Too many payment attempts. Please wait and try again."),
});

module.exports = { globalRateLimiter, downloadRateLimiter, paymentRateLimiter };

/**
 * Request Validation Middleware
 * Uses express-validator. Call validate(rules) to produce a middleware array.
 */

"use strict";

const { body, validationResult } = require("express-validator");

// Multi-platform URL patterns
const PLATFORM_PATTERNS = {
  youtube:    /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)[\w\-]{11}/,
  instagram:  /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv)\/[\w\-]+/,
  facebook:   /^https?:\/\/(www\.)?(facebook\.com|fb\.com|fb\.watch)\/.+/,
  twitter:    /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/,
  tiktok:     /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
  pinterest:  /^https?:\/\/(www\.)?(pin\.it\/[\w]+|pinterest\.[a-z]+\/pin\/[\w-]+)/,
  dailymotion:/^https?:\/\/(www\.)?dailymotion\.com\/video\/[\w]+/,
  vimeo:      /^https?:\/\/(www\.)?vimeo\.com\/\d+/,
  googlephotos:/^https?:\/\/(www\.)?(photos\.google\.com|drive\.google\.com)\/.+/,
};

const SUPPORTED_URL_REGEX = new RegExp(
  Object.values(PLATFORM_PATTERNS).map((r) => r.source).join("|")
);

function detectPlatform(url) {
  for (const [name, regex] of Object.entries(PLATFORM_PATTERNS)) {
    if (regex.test(url)) return name;
  }
  return "unknown";
}

/** Run validations and return 400 if any fail */
function validate(rules) {
  return [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed.",
          errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
      }
      // Attach detected platform to request
      if (req.body.url) {
        req.platform = detectPlatform(req.body.url);
      }
      next();
    },
  ];
}

// ── Reusable Rule Sets ────────────────────────────────────────────────────────

const videoInfoRules = [
  body("url")
    .trim()
    .notEmpty().withMessage("URL is required.")
    .matches(SUPPORTED_URL_REGEX).withMessage("Unsupported URL. Supported: YouTube, Instagram, Facebook, Twitter/X, TikTok, Pinterest, Dailymotion, Vimeo."),
];

const freeDownloadRules = [
  body("url")
    .trim()
    .notEmpty().withMessage("URL is required.")
    .matches(SUPPORTED_URL_REGEX).withMessage("Unsupported URL."),
  body("quality")
    .equals("360p").withMessage("Free tier only supports 360p downloads."),
];

const premiumDownloadRules = [
  body("url")
    .trim()
    .notEmpty().withMessage("URL is required.")
    .matches(SUPPORTED_URL_REGEX).withMessage("Unsupported URL."),
  body("quality")
    .isIn(["720p", "1080p", "4K", "mp3"]).withMessage("Invalid quality. Choose 720p, 1080p, 4K, or mp3."),
];

const createOrderRules = [
  body("plan").optional().isIn(["basic", "pro", "ultimate"]).withMessage("Invalid plan. Choose basic, pro, or ultimate."),
];

const verifyPaymentRules = [
  body("razorpay_order_id").notEmpty().withMessage("Order ID is required."),
  body("razorpay_payment_id").notEmpty().withMessage("Payment ID is required."),
  body("razorpay_signature").notEmpty().withMessage("Signature is required."),
];

module.exports = {
  validate,
  videoInfoRules,
  freeDownloadRules,
  premiumDownloadRules,
  createOrderRules,
  verifyPaymentRules,
};

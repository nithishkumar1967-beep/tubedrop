/**
 * Request Validation Middleware
 * Uses express-validator. Call validate(rules) to produce a middleware array.
 */

"use strict";

const { body, validationResult } = require("express-validator");

// YouTube URL pattern (video + shorts)
const YT_URL_REGEX =
  /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w\-]{11}/;

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
      next();
    },
  ];
}

// ── Reusable Rule Sets ────────────────────────────────────────────────────────

const videoInfoRules = [
  body("url")
    .trim()
    .notEmpty().withMessage("YouTube URL is required.")
    .matches(YT_URL_REGEX).withMessage("Invalid YouTube URL. Must be a standard video or Shorts link."),
];

const freeDownloadRules = [
  body("url")
    .trim()
    .notEmpty().withMessage("YouTube URL is required.")
    .matches(YT_URL_REGEX).withMessage("Invalid YouTube URL."),
  body("quality")
    .equals("360p").withMessage("Free tier only supports 360p downloads."),
];

const premiumDownloadRules = [
  body("url")
    .trim()
    .notEmpty().withMessage("YouTube URL is required.")
    .matches(YT_URL_REGEX).withMessage("Invalid YouTube URL."),
  body("quality")
    .isIn(["720p", "1080p", "mp3"]).withMessage("Invalid quality. Choose 720p, 1080p, or mp3."),
];

const createOrderRules = [
  // No body params needed — amount is fixed server-side at ₹1
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

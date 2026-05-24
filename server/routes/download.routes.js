"use strict";

const express = require("express");
const router = express.Router();
const { freeDownload, premiumDownload } = require("../controllers/download.controller");
const { authenticate, requirePremium } = require("../middleware/auth.middleware");
const { downloadRateLimiter } = require("../middleware/rateLimiter");
const { validate, freeDownloadRules, premiumDownloadRules } = require("../middleware/validate.middleware");

// POST /api/download/free — public but rate-limited + validated
router.post(
  "/free",
  downloadRateLimiter,
  validate(freeDownloadRules),
  freeDownload
);

// POST /api/download/premium — auth + premium + validated
router.post(
  "/premium",
  downloadRateLimiter,
  authenticate,
  requirePremium,
  validate(premiumDownloadRules),
  premiumDownload
);

module.exports = router;

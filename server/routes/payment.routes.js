"use strict";

const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment } = require("../controllers/payment.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { paymentRateLimiter } = require("../middleware/rateLimiter");
const { validate, verifyPaymentRules } = require("../middleware/validate.middleware");

// POST /api/payment/create-order — auth required
router.post("/create-order", paymentRateLimiter, authenticate, createOrder);

// POST /api/payment/verify — auth + validation
router.post(
  "/verify",
  paymentRateLimiter,
  authenticate,
  validate(verifyPaymentRules),
  verifyPayment
);

module.exports = router;

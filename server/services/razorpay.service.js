/**
 * Razorpay Service
 * Handles order creation and HMAC signature verification.
 * Amount is ALWAYS fixed server-side — never trust client-sent amounts.
 */

"use strict";

const Razorpay = require("razorpay");
const crypto = require("crypto");
const logger = require("../utils/logger");

const PREMIUM_AMOUNT_PAISE = 100; // ₹1 = 100 paise — FIXED, never from client
const CURRENCY = "INR";

let instance;

function getRazorpayInstance() {
  if (!instance) {
    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
    }
    instance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  }
  return instance;
}

/**
 * Create a Razorpay order for the fixed ₹1 premium amount.
 * @returns {Promise<{id, amount, currency, receipt}>}
 */
async function createPremiumOrder(uid) {
  const razorpay = getRazorpayInstance();

  const receipt = `tubedrop_${uid.slice(0, 12)}_${Date.now()}`;

  const order = await razorpay.orders.create({
    amount: PREMIUM_AMOUNT_PAISE,
    currency: CURRENCY,
    receipt,
    notes: {
      product: "TubeDrop Premium Lifetime",
      uid,
    },
  });

  logger.info(`Razorpay order created: ${order.id} for uid: ${uid}`);
  return order;
}

/**
 * Verify Razorpay payment signature using HMAC-SHA256.
 * This is the ONLY authoritative check — never trust client-side "success" callbacks.
 *
 * @param {string} orderId       - razorpay_order_id from client
 * @param {string} paymentId     - razorpay_payment_id from client
 * @param {string} signature     - razorpay_signature from client
 * @returns {boolean}
 */
function verifyPaymentSignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const payload = `${orderId}|${paymentId}`;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  const isValid = crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(signature, "hex")
  );

  if (!isValid) {
    logger.warn(`Signature mismatch for order ${orderId} / payment ${paymentId}`);
  }

  return isValid;
}

module.exports = { createPremiumOrder, verifyPaymentSignature, PREMIUM_AMOUNT_PAISE };

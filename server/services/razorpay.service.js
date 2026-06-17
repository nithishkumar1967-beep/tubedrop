/**
 * Razorpay Service
 * Handles order creation and HMAC signature verification.
 * Amount is ALWAYS fixed server-side — never trust client-sent amounts.
 */

"use strict";

const Razorpay = require("razorpay");
const crypto = require("crypto");
const logger = require("../utils/logger");

const PLANS = {
  basic:    { label: "Basic (720p)",   amount: 100,   currency: "INR" },   // ₹1
  pro:      { label: "Pro (1080p)",     amount: 500,   currency: "INR" },   // ₹5
  ultimate: { label: "Ultimate (4K)",   amount: 1000,  currency: "INR" },   // ₹10
};

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
 * Create a Razorpay order for a given plan.
 * @param {string} uid - Firebase user UID
 * @param {string} plan - Plan key: "basic" | "pro" | "ultimate"
 * @returns {Promise<{id, amount, currency, receipt}>}
 */
async function createPremiumOrder(uid, plan = "basic") {
  const planConfig = PLANS[plan];
  if (!planConfig) throw Object.assign(new Error(`Invalid plan: ${plan}`), { status: 400 });

  const razorpay = getRazorpayInstance();

  const receipt = `tubedrop_${uid.slice(0, 12)}_${Date.now()}`;

  const order = await razorpay.orders.create({
    amount: planConfig.amount,
    currency: planConfig.currency,
    receipt,
    notes: {
      product: `TubeDrop ${planConfig.label}`,
      plan,
      uid,
    },
  });

  logger.info(`Razorpay order created: ${order.id} for uid: ${uid} plan: ${plan}`);
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

module.exports = { createPremiumOrder, verifyPaymentSignature };

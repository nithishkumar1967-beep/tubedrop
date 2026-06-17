/**
 * Payment Controller
 * Handles:
 *   POST /api/payment/create-order   — Create Razorpay order (auth required)
 *   POST /api/payment/verify         — Verify payment signature, activate premium
 */

"use strict";

const { createPremiumOrder, verifyPaymentSignature } = require("../services/razorpay.service");
const { getCollection, updateUserDoc } = require("../config/firebase.config");
const logger = require("../utils/logger");

/**
 * POST /api/payment/create-order
 * Creates a Razorpay order for selected plan.
 * Amount is ALWAYS set server-side — never from client.
 * Body: { plan?: "basic" | "pro" | "ultimate" }
 */
async function createOrder(req, res, next) {
  try {
    const { uid, email } = req.user;
    const { plan } = req.body;
    const selectedPlan = plan || "basic";
    logger.info(`Create order requested by uid: ${uid} plan: ${selectedPlan}`);

    // Idempotency: if already premium, return early
    const userDocs = await getCollection("users").doc(uid).get();
    if (userDocs.exists && userDocs.data().isPremium) {
      return res.status(200).json({
        success: false,
        message: "Your account already has premium access.",
        alreadyPremium: true,
      });
    }

    const order = await createPremiumOrder(uid, selectedPlan);

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        plan: selectedPlan,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/payment/verify
 * Verifies Razorpay HMAC signature and activates premium on success.
 * This is the ONLY place isPremium is set to true.
 */
async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const { uid } = req.user;

    logger.info(`Payment verify attempt: order=${razorpay_order_id} payment=${razorpay_payment_id} uid=${uid}`);

    // ── Signature Verification (HMAC-SHA256) ─────────────────────────────────
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      logger.warn(`Invalid payment signature for uid: ${uid}`);
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }

    // ── Activate Premium ──────────────────────────────────────────────────────
    const now = new Date().toISOString();

    await updateUserDoc(uid, {
      isPremium: true,
      premiumActivatedAt: now,
      paymentId: razorpay_payment_id,
    });

    // Log payment record
    await getCollection("payments").add({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      userId: uid,
      amount: 1,
      currency: "INR",
      status: "success",
      createdAt: now,
    });

    logger.info(`Premium activated for uid: ${uid} via payment: ${razorpay_payment_id}`);

    return res.status(200).json({
      success: true,
      message: "Payment verified! Premium access activated.",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, verifyPayment };

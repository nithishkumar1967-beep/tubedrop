/**
 * Authentication Middleware
 *
 * Verifies the Firebase ID token sent in the Authorization header.
 * Usage:
 *   router.post("/protected", authenticate, controller)
 *   router.post("/premium-only", authenticate, requirePremium, controller)
 */

"use strict";

const { verifyIdToken, getUserDoc } = require("../config/firebase.config");
const logger = require("../utils/logger");

/**
 * Verify Firebase ID token and attach decoded user to req.user.
 * Returns 401 if token is missing or invalid.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing or malformed. Expected: Bearer <token>",
      });
    }

    const idToken = authHeader.split("Bearer ")[1].trim();

    if (!idToken) {
      return res.status(401).json({ success: false, message: "ID token is empty." });
    }

    const decoded = await verifyIdToken(idToken);
    req.user = decoded; // { uid, email, name, ... }
    next();
  } catch (err) {
    logger.warn(`Auth failed: ${err.message}`);

    // Distinguish expired vs invalid tokens for better client UX
    if (err.code === "auth/id-token-expired") {
      return res.status(401).json({ success: false, message: "Token expired. Please sign in again." });
    }

    return res.status(401).json({ success: false, message: "Invalid authentication token." });
  }
}

/**
 * Requires the authenticated user to have isPremium === true in Firestore.
 * Must be used AFTER authenticate middleware.
 */
async function requirePremium(req, res, next) {
  try {
    const userDoc = await getUserDoc(req.user.uid);

    if (!userDoc || !userDoc.isPremium) {
      return res.status(403).json({
        success: false,
        message: "Premium subscription required. Upgrade for ₹1 lifetime access.",
        requiresUpgrade: true,
      });
    }

    req.userDoc = userDoc;
    next();
  } catch (err) {
    logger.error(`requirePremium error for uid ${req.user?.uid}: ${err.message}`);
    return res.status(500).json({ success: false, message: "Failed to verify premium status." });
  }
}

module.exports = { authenticate, requirePremium };

/**
 * Firebase Admin SDK — graceful init with clear error messages
 */
"use strict";

const admin = require("firebase-admin");
const logger = require("../utils/logger");

let initialized = false;

function initFirebaseAdmin() {
  if (initialized) return;

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    logger.error("=================================================");
    logger.error("  Firebase credentials missing in .env file!");
    logger.error("  Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL,");
    logger.error("  and FIREBASE_PRIVATE_KEY then restart.");
    logger.error("=================================================");
    process.exit(1);
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    initialized = true;
    logger.info("Firebase Admin SDK initialized successfully.");
  } catch (err) {
    logger.error(`Firebase init failed: ${err.message}`);
    logger.error("Check that FIREBASE_PRIVATE_KEY is correct in your .env file.");
    process.exit(1);
  }
}

async function verifyIdToken(idToken) {
  return admin.auth().verifyIdToken(idToken);
}

function getCollection(name) {
  return admin.firestore().collection(name);
}

async function getUserDoc(uid) {
  const doc = await getCollection("users").doc(uid).get();
  return doc.exists ? { uid, ...doc.data() } : null;
}

async function updateUserDoc(uid, data) {
  await getCollection("users").doc(uid).set(data, { merge: true });
}

module.exports = { initFirebaseAdmin, verifyIdToken, getCollection, getUserDoc, updateUserDoc };

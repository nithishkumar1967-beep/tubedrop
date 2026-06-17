"use strict";

const { getCollection, updateUserDoc } = require("../config/firebase.config");
const logger = require("../utils/logger");

async function getMe(req, res, next) {
  try {
    const { uid } = req.user;
    const doc = await getCollection("users").doc(uid).get();
    if (!doc.exists) {
      return res.status(200).json({ success: true, data: null });
    }
    return res.status(200).json({ success: true, data: { uid, ...doc.data() } });
  } catch (err) {
    next(err);
  }
}

async function syncUser(req, res, next) {
  try {
    const { uid, email, name, photoURL } = req.body;
    const ref = getCollection("users").doc(uid);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        uid,
        name: name || "",
        email: email || "",
        photoURL: photoURL || "",
        isPremium: false,
        premiumActivatedAt: null,
        paymentId: null,
        createdAt: new Date().toISOString(),
      });
      logger.info(`User created in Firestore: ${uid}`);
    }

    const doc = await ref.get();
    return res.status(200).json({ success: true, data: { uid, ...doc.data() } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, syncUser };

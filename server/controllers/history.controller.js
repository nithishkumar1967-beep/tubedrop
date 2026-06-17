"use strict";

const { getCollection } = require("../config/firebase.config");
const logger = require("../utils/logger");

async function getDownloadHistory(req, res, next) {
  try {
    const { uid } = req.user;
    const snapshot = await getCollection("downloads")
      .where("userId", "==", uid)
      .limit(50)
      .get();

    const downloads = [];
    snapshot.forEach((doc) => {
      downloads.push({ id: doc.id, ...doc.data() });
    });
    // Sort by date descending (avoids needing a Firestore composite index)
    downloads.sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt));

    return res.status(200).json({ success: true, data: downloads });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDownloadHistory };

"use strict";

const { getCollection } = require("../config/firebase.config");
const logger = require("../utils/logger");

async function getDownloadHistory(req, res, next) {
  try {
    const { uid } = req.user;
    const snapshot = await getCollection("downloads")
      .where("userId", "==", uid)
      .orderBy("downloadedAt", "desc")
      .limit(50)
      .get();

    const downloads = [];
    snapshot.forEach((doc) => {
      downloads.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({ success: true, data: downloads });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDownloadHistory };

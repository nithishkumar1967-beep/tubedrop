/**
 * Download Controller
 * Handles:
 *   POST /api/download/free    — 360p, public (rate limited)
 *   POST /api/download/premium — 720p / 1080p / mp3 (auth + premium required)
 *
 * Files are streamed directly to the client and deleted immediately after.
 */

"use strict";

const { downloadToTemp } = require("../services/ytdlp.service");
const { getCollection } = require("../config/firebase.config");
const { deleteFile, scheduleCleanup } = require("../utils/fileCleanup");
const logger = require("../utils/logger");
const fs = require("fs");

/**
 * Shared streaming logic: download → stream → delete.
 */
async function streamDownload(req, res, next, quality) {
  let filePath = null;

  try {
    const { url } = req.body;
    logger.info(`Download started: quality=${quality} url=${url} ip=${req.ip}`);

    const { filePath: fp, fileName, mimeType } = await downloadToTemp(url, quality);
    filePath = fp;

    const stat = fs.statSync(filePath);

    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", stat.size);
    res.setHeader("X-Content-Type-Options", "nosniff");

    const stream = fs.createReadStream(filePath);

    stream.on("error", (err) => {
      logger.error(`Stream error: ${err.message}`);
      deleteFile(filePath);
      if (!res.headersSent) next(err);
    });

    stream.on("end", () => {
      logger.info(`Download complete: ${fileName}`);
      deleteFile(filePath);
    });

    // If client disconnects early, still clean up
    req.on("close", () => {
      if (filePath) deleteFile(filePath);
    });

    stream.pipe(res);

    // Log download to Firestore (best-effort, non-blocking)
    if (req.user) {
      logDownload(req.user.uid, url, quality).catch((e) =>
        logger.warn(`Failed to log download: ${e.message}`)
      );
    }
  } catch (err) {
    if (filePath) {
      scheduleCleanup(filePath); // Ensure cleanup even on error
    }
    next(err);
  }
}

/**
 * POST /api/download/free
 * No auth required. Quality fixed at 360p by validator.
 */
async function freeDownload(req, res, next) {
  await streamDownload(req, res, next, "360p");
}

/**
 * POST /api/download/premium
 * Requires: authenticate + requirePremium middleware.
 */
async function premiumDownload(req, res, next) {
  const { quality } = req.body;
  await streamDownload(req, res, next, quality);
}

/**
 * Write a download record to Firestore (analytics).
 */
async function logDownload(uid, videoUrl, quality) {
  await getCollection("downloads").add({
    userId: uid,
    videoUrl,
    quality,
    format: quality === "mp3" ? "mp3" : "mp4",
    downloadedAt: new Date().toISOString(),
  });
}

module.exports = { freeDownload, premiumDownload };

/**
 * Video Controller
 * Handles: POST /api/video/info
 */

"use strict";

const { fetchVideoInfo } = require("../services/ytdlp.service");
const logger = require("../utils/logger");

/**
 * POST /api/video/info
 * Body: { url: string }
 * Returns video metadata (title, thumbnail, duration, available qualities).
 * Public endpoint — no authentication required.
 */
async function getVideoInfo(req, res, next) {
  try {
    const { url } = req.body;
    logger.info(`Video info requested for: ${url} from IP: ${req.ip}`);

    const info = await fetchVideoInfo(url);

    return res.status(200).json({
      success: true,
      data: info,
    });
  } catch (err) {
    // yt-dlp errors often have useful messages — pass them up
    if (err.stderr && err.stderr.includes("Private video")) {
      return res.status(422).json({ success: false, message: "This video is private and cannot be downloaded." });
    }
    if (err.stderr && err.stderr.includes("not available")) {
      return res.status(422).json({ success: false, message: "This video is not available or has been removed." });
    }
    next(err);
  }
}

module.exports = { getVideoInfo };

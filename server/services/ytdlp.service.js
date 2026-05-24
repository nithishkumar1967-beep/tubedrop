/**
 * yt-dlp Service — video metadata & download
 */
"use strict";

const ytdlp = require("yt-dlp-exec");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");
const { getTempDirPath } = require("../utils/fileCleanup");

const FORMAT_MAP = {
  "360p":  "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]/best[height<=360]",
  "720p":  "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]",
  "1080p": "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best[height<=1080]",
  "mp3":   "bestaudio/best",
};

const COMMON_OPTS = {
  noWarnings: true,
  noCallHome: true,
  noCheckCertificates: true,
  addHeader: ["referer:youtube.com", "user-agent:Mozilla/5.0"],
  socketTimeout: 20,
};

async function fetchVideoInfo(url) {
  logger.debug(`fetchVideoInfo: ${url}`);

  const info = await ytdlp(url, {
    ...COMMON_OPTS,
    dumpSingleJson: true,
    preferFreeFormats: true,
    youtubeSkipDashManifest: true,
  });

  const heights = (info.formats || []).map((f) => f.height).filter(Boolean);

  const qualities = [];
  if (heights.some((h) => h <= 360) || heights.length === 0) qualities.push("360p");
  if (heights.some((h) => h <= 720))  qualities.push("720p");
  if (heights.some((h) => h <= 1080)) qualities.push("1080p");
  qualities.push("mp3");

  return {
    title:           info.title || "Unknown Title",
    thumbnail:       info.thumbnail || null,
    durationSeconds: info.duration  || 0,
    qualities,
  };
}

async function downloadToTemp(url, quality) {
  const format = FORMAT_MAP[quality];
  if (!format) throw Object.assign(new Error(`Unsupported quality: ${quality}`), { status: 400 });

  const isMp3   = quality === "mp3";
  const fileId  = uuidv4();
  const TEMP    = getTempDirPath();
  const outTpl  = path.join(TEMP, `${fileId}.%(ext)s`);

  logger.debug(`downloadToTemp quality=${quality} id=${fileId}`);

  const opts = {
    ...COMMON_OPTS,
    format,
    output: outTpl,
    mergeOutputFormat: isMp3 ? undefined : "mp4",
  };

  if (isMp3) {
    opts.extractAudio  = true;
    opts.audioFormat   = "mp3";
    opts.audioQuality  = 0; // best
  }

  await ytdlp(url, opts);

  // Find the actual output file (yt-dlp fills %(ext)s)
  const files = fs.readdirSync(TEMP).filter((f) => f.startsWith(fileId));
  if (files.length === 0) throw new Error("Download finished but output file not found.");

  const actualFile = files[0];
  const filePath   = path.join(TEMP, actualFile);
  const ext        = path.extname(actualFile).replace(".", "") || (isMp3 ? "mp3" : "mp4");

  return {
    filePath,
    fileName: `tubedrop_${quality}.${ext}`,
    mimeType: ext === "mp3" ? "audio/mpeg" : "video/mp4",
  };
}

module.exports = { fetchVideoInfo, downloadToTemp };

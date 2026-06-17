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
  "4K":    "bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/best[height<=2160][ext=mp4]/best[height<=2160]",
  "mp3":   "bestaudio/best",
};

function getCommonOpts(url) {
  const low = url.toLowerCase();
  let referer = "youtube.com";
  if (low.includes("instagram")) referer = "instagram.com";
  else if (low.includes("facebook") || low.includes("fb.")) referer = "facebook.com";
  else if (low.includes("tiktok")) referer = "tiktok.com";
  else if (low.includes("twitter") || low.includes("x.com")) referer = "twitter.com";
  else if (low.includes("pinterest") || low.includes("pin.it")) referer = "pinterest.com";
  else if (low.includes("dailymotion")) referer = "dailymotion.com";
  else if (low.includes("vimeo")) referer = "vimeo.com";

  return {
    noWarnings: true,
    noCallHome: true,
    noCheckCertificates: true,
    addHeader: [`referer:${referer}`, "user-agent:Mozilla/5.0"],
    socketTimeout: 30,
  };
}

async function fetchVideoInfo(url) {
  logger.debug(`fetchVideoInfo: ${url}`);

  const opts = {
    ...getCommonOpts(url),
    dumpSingleJson: true,
    preferFreeFormats: true,
    youtubeSkipDashManifest: true,
  };

  const info = await ytdlp(url, opts);

  const heights = (info.formats || []).map((f) => f.height).filter(Boolean);

  const qualities = [];
  if (heights.some((h) => h <= 360) || heights.length === 0) qualities.push("360p");
  if (heights.some((h) => h <= 720))  qualities.push("720p");
  if (heights.some((h) => h <= 1080)) qualities.push("1080p");
  if (heights.some((h) => h <= 2160)) qualities.push("4K");
  qualities.push("mp3");

  return {
    title:           info.title || "Unknown Title",
    thumbnail:       info.thumbnail || null,
    durationSeconds: info.duration  || 0,
    qualities,
    platform:        info.extractor_key || "unknown",
    uploader:        info.uploader || info.channel || null,
    filesize:        info.filesize_approx || null,
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
    ...getCommonOpts(url),
    format,
    output: outTpl,
    mergeOutputFormat: isMp3 ? undefined : "mp4",
  };

  if (isMp3) {
    opts.extractAudio  = true;
    opts.audioFormat   = "mp3";
    opts.audioQuality  = 0;
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

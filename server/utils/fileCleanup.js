/**
 * Temp File Cleanup — Windows & Linux compatible paths
 */
"use strict";

const fs = require("fs");
const path = require("path");
const logger = require("./logger");

function getTempDir() {
  const envDir = process.env.TEMP_DOWNLOAD_DIR;
  if (envDir) return envDir;
  // Windows fallback
  const base = process.env.TEMP || process.env.TMP || (process.platform === "win32" ? "C:\\Temp" : "/tmp");
  return path.join(base, "tubedrop_downloads");
}

const TEMP_DIR = getTempDir();
const TTL_MS = (parseInt(process.env.TEMP_FILE_TTL_MINUTES, 10) || 10) * 60 * 1000;

function ensureTempDir() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    logger.info(`Created temp directory: ${TEMP_DIR}`);
  }
  purgeStaleFiles();
}

function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.debug(`Deleted: ${filePath}`);
    }
  } catch (err) {
    logger.warn(`Could not delete ${filePath}: ${err.message}`);
  }
}

function scheduleCleanup(filePath) {
  setTimeout(() => deleteFile(filePath), TTL_MS);
}

function purgeStaleFiles() {
  try {
    const now = Date.now();
    const files = fs.readdirSync(TEMP_DIR);
    let purged = 0;
    for (const file of files) {
      const fp = path.join(TEMP_DIR, file);
      const stat = fs.statSync(fp);
      if (now - stat.mtimeMs > TTL_MS) { deleteFile(fp); purged++; }
    }
    if (purged > 0) logger.info(`Purged ${purged} stale temp file(s).`);
  } catch (err) {
    logger.warn(`purgeStaleFiles: ${err.message}`);
  }
}

function getTempDirPath() { return TEMP_DIR; }

// Purge every 5 minutes
setInterval(purgeStaleFiles, 5 * 60 * 1000);

module.exports = { ensureTempDir, deleteFile, scheduleCleanup, purgeStaleFiles, getTempDirPath };

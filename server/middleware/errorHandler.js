/**
 * Global Error Handler Middleware
 * Must be the last middleware registered in index.js.
 */

"use strict";

const logger = require("../utils/logger");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "An internal server error occurred."
      : err.message || "Unknown error.";

  logger.error(`[${req.method}] ${req.path} → ${status}: ${err.message}`, {
    stack: err.stack,
    body: req.body,
    ip: req.ip,
  });

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

module.exports = { errorHandler };

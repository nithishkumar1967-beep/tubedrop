/**
 * TubeDrop — Express Server Entry Point
 */
"use strict";

require("dotenv").config();

const express = require("express");
const helmet  = require("helmet");
const morgan  = require("morgan");

const { configureCors }    = require("./config/cors.config");
const { globalRateLimiter } = require("./middleware/rateLimiter");
const { errorHandler }     = require("./middleware/errorHandler");
const { initFirebaseAdmin } = require("./config/firebase.config");
const logger               = require("./utils/logger");
const { ensureTempDir }    = require("./utils/fileCleanup");

const videoRoutes    = require("./routes/video.routes");
const downloadRoutes = require("./routes/download.routes");
const paymentRoutes  = require("./routes/payment.routes");
const healthRoutes   = require("./routes/health.routes");
const historyRoutes  = require("./routes/history.routes");
const userRoutes     = require("./routes/user.routes");

// Init external services
initFirebaseAdmin();
ensureTempDir();

const app  = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" }, contentSecurityPolicy: false }));
app.use(configureCors());
app.use(globalRateLimiter);

// Body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Logging
app.use(morgan("dev", { stream: { write: (m) => logger.http(m.trim()) } }));

// Routes
app.use("/api/health",   healthRoutes);
app.use("/api/video",    videoRoutes);
app.use("/api/download", downloadRoutes);
app.use("/api/payment",  paymentRoutes);
app.use("/api/history",  historyRoutes);
app.use("/api/user",     userRoutes);

// 404
app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found." }));

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`TubeDrop server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

module.exports = app;

"use strict";

const express = require("express");
const router = express.Router();
const { getVideoInfo } = require("../controllers/video.controller");
const { validate, videoInfoRules } = require("../middleware/validate.middleware");

// POST /api/video/info — public, validated
router.post("/info", validate(videoInfoRules), getVideoInfo);

module.exports = router;

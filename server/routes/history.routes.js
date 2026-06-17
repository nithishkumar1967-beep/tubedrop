"use strict";

const express = require("express");
const router = express.Router();
const { getDownloadHistory } = require("../controllers/history.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/", authenticate, getDownloadHistory);

module.exports = router;

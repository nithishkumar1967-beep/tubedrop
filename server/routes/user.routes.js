"use strict";

const express = require("express");
const router = express.Router();
const { getMe, syncUser } = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/me", authenticate, getMe);
router.post("/sync", authenticate, syncUser);

module.exports = router;

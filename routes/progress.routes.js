const express = require("express");
const { getUserProgress, updateProgress } = require("../controllers/progress.controller");
const { authenticate } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/:courseId", authenticate, getUserProgress);
router.put("/:courseId", authenticate, updateProgress);

module.exports = router;

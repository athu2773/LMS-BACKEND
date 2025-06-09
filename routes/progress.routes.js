const express = require("express");
const { getUserProgress, updateProgress, getCourseProgressAnalytics } = require("../controllers/progress.controller");
const { authenticate } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/:courseId", authenticate, getUserProgress);
router.put("/:courseId", authenticate, updateProgress);
// Add analytics endpoint for students to view their analytics (optional, for extensibility)
// router.get("/:courseId/analytics", authenticate, getCourseProgressAnalytics);

module.exports = router;

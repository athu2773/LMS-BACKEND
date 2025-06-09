const express = require("express");
const { getCourseCompletionRate, getAverageAssessmentScore } = require("../controllers/analytics.controller");
const { getCourseProgressAnalytics } = require("../controllers/progress.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/course/:courseId/completion", authenticate, authorizeRoles("admin", "instructor"), getCourseCompletionRate);
router.get("/course/:courseId/assessment-average", authenticate, authorizeRoles("admin", "instructor"), getAverageAssessmentScore);
router.get("/course/:courseId/progress-analytics", authenticate, authorizeRoles("admin", "instructor"), getCourseProgressAnalytics);

module.exports = router;

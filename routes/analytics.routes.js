const express = require("express");
const { getCourseCompletionRate, getAverageAssessmentScore } = require("../controllers/analytics.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/course/:courseId/completion", authenticate, authorizeRoles("admin", "instructor"), getCourseCompletionRate);
router.get("/course/:courseId/assessment-average", authenticate, authorizeRoles("admin", "instructor"), getAverageAssessmentScore);

module.exports = router;

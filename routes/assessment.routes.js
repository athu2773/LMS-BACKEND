const express = require("express");
const {
  createAssessment,
  getAssessmentsByCourse,
  getAssessmentById,
} = require("../controllers/assessment.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/course/:courseId", authenticate, getAssessmentsByCourse);
router.get("/:id", authenticate, getAssessmentById);
router.post("/", authenticate, authorizeRoles("instructor", "admin"), createAssessment);

module.exports = router;

const express = require("express");
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  approveCourse,
  rejectCourse,
} = require("../controllers/course.controller");

const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");
const router = express.Router();

router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.post("/", authenticate, authorizeRoles("instructor", "admin"), createCourse);
router.put("/:id", authenticate, authorizeRoles("instructor", "admin"), updateCourse);
router.delete("/:id", authenticate, authorizeRoles("instructor", "admin"), deleteCourse);
// Add endpoints for course approval workflow (admin only)
router.patch("/:id/approve", authenticate, authorizeRoles("admin"), approveCourse);
router.patch("/:id/reject", authenticate, authorizeRoles("admin"), rejectCourse);

module.exports = router;

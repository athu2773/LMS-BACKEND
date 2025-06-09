const express = require("express");
const router = express.Router();
const { getUsers } = require("../controllers/user.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth.middleware");

// Only admin and instructor can view all users
router.get("/", authenticate, authorizeRoles("admin", "instructor"), getUsers);

module.exports = router;
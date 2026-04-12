const { Router } = require("express");
const { enrollStudent, getTeacherDashboard } = require("../controllers/teacherController");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = Router();

router.get("/dashboard", authMiddleware, requireRole("teacher"), getTeacherDashboard);
router.post("/enroll", authMiddleware, requireRole("teacher"), enrollStudent);

module.exports = router;

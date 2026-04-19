const { Router } = require("express");
const { getCourses } = require("../controllers/lmsController");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = Router();

router.use(authMiddleware);

router.get("/", requireRole("teacher", "student", "parent", "admin"), getCourses);

module.exports = router;

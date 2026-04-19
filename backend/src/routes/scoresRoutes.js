const { Router } = require("express");
const { getScores, addScore, getAnalytics } = require("../controllers/scoresController");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = Router();

router.get("/analytics", authMiddleware, requireRole("teacher", "admin"), getAnalytics);
router.get("/", authMiddleware, getScores);
router.post("/", authMiddleware, requireRole("teacher"), addScore);

module.exports = router;

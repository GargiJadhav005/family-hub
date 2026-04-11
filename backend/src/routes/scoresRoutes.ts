import { Router } from "express";
import { getScores, addScore, getAnalytics } from "../controllers/scoresController";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.get("/analytics", authMiddleware, requireRole("teacher", "admin"), getAnalytics);
router.get("/", authMiddleware, getScores);
router.post("/", authMiddleware, requireRole("teacher"), addScore);

export default router;

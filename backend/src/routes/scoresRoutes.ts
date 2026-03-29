import { Router } from "express";
import { getScores, addScore } from "../controllers/scoresController";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, getScores);
router.post("/", authMiddleware, requireRole("teacher"), addScore);

export default router;

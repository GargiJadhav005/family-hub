import { Router } from "express";
import { listQuizzes, createQuiz, getQuiz, submitQuiz, getQuizResults } from "../controllers/quizController";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, listQuizzes);
router.post("/", authMiddleware, requireRole("teacher"), createQuiz);
router.get("/:id", authMiddleware, getQuiz);
router.post("/:id/submit", authMiddleware, requireRole("student"), submitQuiz);
router.get("/:id/results", authMiddleware, requireRole("teacher"), getQuizResults);

export default router;

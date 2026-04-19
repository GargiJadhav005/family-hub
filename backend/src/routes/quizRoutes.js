const { Router } = require("express");
const { listQuizzes, createQuiz, getQuiz, submitQuiz, getQuizResults } = require("../controllers/quizController");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = Router();

router.get("/", authMiddleware, listQuizzes);
router.post("/", authMiddleware, requireRole("teacher"), createQuiz);
router.get("/:id", authMiddleware, getQuiz);
router.post("/:id/submit", authMiddleware, requireRole("student"), submitQuiz);
router.get("/:id/results", authMiddleware, requireRole("teacher"), getQuizResults);

module.exports = router;

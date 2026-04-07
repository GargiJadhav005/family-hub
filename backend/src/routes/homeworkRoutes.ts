import { Router } from "express";
import { getHomework, createHomework, updateHomeworkStatus, getStudentAllHomeworkWithStatus } from "../controllers/homeworkController";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, getHomework);
router.post("/", authMiddleware, requireRole("teacher"), createHomework);
router.get("/student/all", authMiddleware, getStudentAllHomeworkWithStatus);
router.patch("/:id/status", authMiddleware, updateHomeworkStatus);

export default router;

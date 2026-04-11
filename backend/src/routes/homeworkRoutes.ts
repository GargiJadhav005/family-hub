import { Router } from "express";
import {
  getHomework,
  getHomeworkById,
  createHomework,
  updateHomework,
  deleteHomework,
  updateHomeworkStatus,
  getStudentAllHomeworkWithStatus,
} from "../controllers/homeworkController";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

// Get all homework (with role-based filtering)
router.get("/", authMiddleware, getHomework);

// Get student's homework with status
router.get("/student/all", authMiddleware, getStudentAllHomeworkWithStatus);

// Get single homework by ID
router.get("/:id", authMiddleware, getHomeworkById);

// Create homework (teacher only)
router.post("/", authMiddleware, requireRole("teacher"), createHomework);

// Update homework (teacher only, must be creator)
router.patch("/:id", authMiddleware, requireRole("teacher"), updateHomework);

// Delete homework (teacher only, must be creator)
router.delete("/:id", authMiddleware, requireRole("teacher"), deleteHomework);

// Update homework status (student)
router.patch("/:id/status", authMiddleware, updateHomeworkStatus);

export default router;

import { Router } from "express";
import { enrollStudent, getTeacherDashboard } from "../controllers/teacherController";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.get("/dashboard", authMiddleware, requireRole("teacher"), getTeacherDashboard);
router.post("/enroll", authMiddleware, requireRole("teacher"), enrollStudent);

export default router;

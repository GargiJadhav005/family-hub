import { Router } from "express";
import { enrollStudent } from "../controllers/teacherController";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.post("/enroll", authMiddleware, requireRole("teacher"), enrollStudent);

export default router;

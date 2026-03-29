import { Router } from "express";
import { getAttendance, markAttendance } from "../controllers/attendanceController";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, getAttendance);
router.post("/", authMiddleware, requireRole("teacher"), markAttendance);

export default router;

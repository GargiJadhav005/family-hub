import { Router } from "express";
import { getCourses } from "../controllers/lmsController";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", requireRole("teacher", "student", "parent", "admin"), getCourses);

export default router;

import { Router } from "express";
import { getStudents, getStudentById } from "../controllers/studentController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, getStudents);
router.get("/:id", authMiddleware, getStudentById);

export default router;

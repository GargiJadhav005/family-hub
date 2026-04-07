import { Router } from "express";
import {
  generateReportCard,
  listReportCards,
  getStudentReportCard,
} from "../controllers/reportCardController";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, listReportCards);
router.post(
  "/generate/:studentId",
  authMiddleware,
  requireRole("teacher"),
  generateReportCard
);
router.get("/:studentId", authMiddleware, getStudentReportCard);

export default router;

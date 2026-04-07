import { Router } from "express";
import { listInstructions, createInstruction } from "../controllers/instructionController";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, listInstructions);
router.post("/", authMiddleware, requireRole("teacher"), createInstruction);

export default router;

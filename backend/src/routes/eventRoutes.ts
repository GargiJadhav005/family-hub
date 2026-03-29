import { Router } from "express";
import { listEvents, createEvent, deleteEvent } from "../controllers/eventController";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

// Public: anyone can read events & notices
router.get("/", listEvents);

// Teacher-only: create and delete
router.post("/", authMiddleware, requireRole("teacher"), createEvent);
router.delete("/:id", authMiddleware, requireRole("teacher"), deleteEvent);

export default router;

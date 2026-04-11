import { Router } from "express";
import {
  listMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  updateMeetingStatus,
} from "../controllers/meetingController";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

// Get all meetings (role-based filtering)
router.get("/", authMiddleware, listMeetings);

// Create meeting (teacher/admin only)
router.post("/", authMiddleware, requireRole("teacher"), createMeeting);

// Update meeting details (teacher/admin only)
router.patch("/:id", authMiddleware, requireRole("teacher"), updateMeeting);

// Delete meeting (teacher/admin only)
router.delete("/:id", authMiddleware, requireRole("teacher"), deleteMeeting);

// Update meeting status (teacher/parent)
router.patch("/:id/status", authMiddleware, updateMeetingStatus);

export default router;

import { Router } from "express";
import { listMeetings, createMeeting, updateMeetingStatus } from "../controllers/meetingController";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, listMeetings);
router.post("/", authMiddleware, requireRole("teacher"), createMeeting);
router.patch("/:id/status", authMiddleware, requireRole("teacher"), updateMeetingStatus);

export default router;

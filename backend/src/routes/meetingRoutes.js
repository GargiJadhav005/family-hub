const { Router } = require("express");
const {
  listMeetings,
  createMeeting,
  updateMeetingStatus,
  rescheduleMeeting,
} = require("../controllers/meetingController");
const { authMiddleware, requireRole } = require("../middleware/auth");

const router = Router();

router.get("/", authMiddleware, listMeetings);
router.post("/", authMiddleware, requireRole("teacher", "admin"), createMeeting);
router.patch("/:id/status", authMiddleware, updateMeetingStatus);
router.patch("/:id/reschedule", authMiddleware, requireRole("teacher", "admin"), rescheduleMeeting);

module.exports = router;

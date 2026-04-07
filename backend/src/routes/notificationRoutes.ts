import { Router } from "express";
import {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotificationHandler,
  deleteAllNotifications,
} from "../controllers/notificationController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All notification routes require authentication
router.use(authMiddleware);

// GET notifications
router.get("/", getNotifications);
router.get("/unread", getUnreadNotifications);

// Mark as read
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);

// Delete notifications
router.delete("/:id", deleteNotificationHandler);
router.delete("/delete-all", deleteAllNotifications);

export default router;

import { Response } from "express";
import { Notification } from "../models";
import { AuthRequest } from "../middleware/auth";
import { markNotificationAsRead, deleteNotification } from "../utils/notification";

/**
 * GET /api/notifications
 * Get all notifications for current user (with pagination)
 */
export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ recipientId: userId });
    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      read: false,
    });

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        unreadCount,
      },
    });
  } catch (error) {
    console.error("GetNotifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/notifications/unread
 * Get only unread notifications
 */
export async function getUnreadNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user._id;
    const unreadNotifications = await Notification.find({
      recipientId: userId,
      read: false,
    }).sort({ createdAt: -1 });

    res.json({ notifications: unreadNotifications });
  } catch (error) {
    console.error("GetUnreadNotifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const success = await markNotificationAsRead(id);
    if (!success) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    res.json({ ok: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("MarkAsRead error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read
 */
export async function markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipientId: userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ ok: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("MarkAllAsRead error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
export async function deleteNotificationHandler(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    const success = await deleteNotification(id);
    if (!success) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    res.json({ ok: true, message: "Notification deleted" });
  } catch (error) {
    console.error("DeleteNotification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /api/notifications/delete-all
 * Delete all notifications for user
 */
export async function deleteAllNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user._id;

    const result = await Notification.deleteMany({ recipientId: userId });

    res.json({
      ok: true,
      message: `Deleted ${result.deletedCount} notifications`,
    });
  } catch (error) {
    console.error("DeleteAllNotifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

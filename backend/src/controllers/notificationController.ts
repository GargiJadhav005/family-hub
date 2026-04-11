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
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Query using $or to support both recipientId and userId fields
    const userQuery = { $or: [{ recipientId: userId }, { userId: userId }] };

    const notifications = await Notification.find(userQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(userQuery);
    const unreadCount = await Notification.countDocuments({
      ...userQuery,
      $or: [
        { recipientId: userId, read: false },
        { recipientId: userId, isRead: false },
        { userId: userId, read: false },
        { userId: userId, isRead: false },
      ],
    });

    res.json({
      notifications: notifications.map((n: any) => ({
        id: n._id.toString(),
        event: n.event,
        title: n.title,
        message: n.message,
        data: n.data || {},
        read: n.read || n.isRead || false,
        readAt: n.readAt,
        createdAt: n.createdAt,
      })),
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
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const userId = req.user._id;
    const unreadNotifications = await Notification.find({
      $or: [
        { recipientId: userId, read: false },
        { recipientId: userId, isRead: false },
        { userId: userId, read: false },
        { userId: userId, isRead: false },
      ],
    }).sort({ createdAt: -1 });

    res.json({
      notifications: unreadNotifications.map((n: any) => ({
        id: n._id.toString(),
        event: n.event,
        title: n.title,
        message: n.message,
        data: n.data || {},
        read: false,
        createdAt: n.createdAt,
      })),
    });
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
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const userId = req.user._id;

    // Update all notifications for this user (support both field names)
    await Notification.updateMany(
      { $or: [{ recipientId: userId }, { userId: userId }] },
      { read: true, isRead: true, readAt: new Date() }
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
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const userId = req.user._id;

    // Delete all notifications for this user (support both field names)
    const result = await Notification.deleteMany({
      $or: [{ recipientId: userId }, { userId: userId }],
    });

    res.json({
      ok: true,
      message: `Deleted ${result.deletedCount} notifications`,
    });
  } catch (error) {
    console.error("DeleteAllNotifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

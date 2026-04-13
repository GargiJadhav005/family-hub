const { Notification } = require("../models");
const { markNotificationAsRead, deleteNotification } = require("../utils/notification");

async function getNotifications(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
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
  } catch (err) {
    console.error("GetNotifications error:", err);
    res.status(500).json({ 
      error: "Failed to fetch notifications",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

async function getUnreadNotifications(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

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

async function markAsRead(req, res) {
  try {
    const { id } = req.params;

    const success = await markNotificationAsRead(id);
    if (!success) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ ok: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("MarkAsRead error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function markAllAsRead(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

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

async function deleteNotificationHandler(req, res) {
  try {
    const { id } = req.params;

    const success = await deleteNotification(id);
    if (!success) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ ok: true, message: "Notification deleted" });
  } catch (error) {
    console.error("DeleteNotification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteAllNotifications(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

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

module.exports = {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotificationHandler,
  deleteAllNotifications,
};

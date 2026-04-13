const { Router } = require("express");
const {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotificationHandler,
  deleteAllNotifications,
} = require("../controllers/notificationController");
const { authMiddleware } = require("../middleware/auth");

const router = Router();

router.use(authMiddleware);

router.get("/", getNotifications);
router.get("/unread", getUnreadNotifications);

router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);

router.delete("/:id", deleteNotificationHandler);
router.delete("/delete-all", deleteAllNotifications);

module.exports = router;

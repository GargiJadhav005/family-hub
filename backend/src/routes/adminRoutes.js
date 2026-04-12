const { Router } = require("express");
const { authMiddleware, requireRole } = require("../middleware/auth");
const {
  getDashboard,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  getEnquiries,
  respondToEnquiry,
  markEnquiryAsRead,
  deleteEnquiry,
} = require("../controllers/adminController");

const router = Router();

router.use(authMiddleware, requireRole("admin"));

router.get("/dashboard", getDashboard);

router.get("/users", getAllUsers);
router.post("/users", createUser);
router.patch("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);
router.patch("/users/:userId/reset-password", resetUserPassword);

router.get("/announcements", getAnnouncements);
router.post("/announcements", createAnnouncement);
router.patch("/announcements/:announcementId", updateAnnouncement);
router.delete("/announcements/:announcementId", deleteAnnouncement);

router.get("/enquiries", getEnquiries);
router.patch("/enquiries/:enquiryId/mark-read", markEnquiryAsRead);
router.patch("/enquiries/:enquiryId/respond", respondToEnquiry);
router.delete("/enquiries/:enquiryId", deleteEnquiry);

module.exports = router;

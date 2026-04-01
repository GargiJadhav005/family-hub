import { Router } from "express";
import { authMiddleware, requireRole } from "../middleware/auth";
import {
  getDashboard,
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  createAnnouncement,
  getAnnouncements,
  getEnquiries,
  respondToEnquiry,
  markEnquiryAsRead,
} from "../controllers/adminController";

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, requireRole("admin"));

// Dashboard
router.get("/dashboard", getDashboard);

// User management
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.get("/users/:userId", getUserById);
router.patch("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);

// Announcements
router.post("/announcements", createAnnouncement);
router.get("/announcements", getAnnouncements);

// Enquiries
router.get("/enquiries", getEnquiries);
router.patch("/enquiries/:enquiryId/mark-read", markEnquiryAsRead);
router.patch("/enquiries/:enquiryId/respond", respondToEnquiry);

export default router;

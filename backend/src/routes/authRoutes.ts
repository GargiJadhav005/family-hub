import { Router } from "express";
import {
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/me", authMiddleware, getMe);
router.post("/change-password", authMiddleware, changePassword);

export default router;

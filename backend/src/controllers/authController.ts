import { Request, Response } from "express";
import crypto from "crypto";
import { User } from "../models";
import { comparePasswords, hashPassword, signToken, toClientUser } from "../utils/auth";
import { AuthRequest } from "../middleware/auth";
import { sendPasswordResetEmail } from "../utils/email";
import { z } from "zod";

// ✅ Validation Schemas
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["teacher", "parent", "student", "admin"]).optional(),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

// ✅ Helper: generic auth error (prevents user enumeration)
const invalidAuth = (res: Response) =>
  res.status(401).json({ error: "Invalid credentials" });

/**
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const body = LoginSchema.parse(req.body);
    const { email, password, role } = body;

    // ✅ Always select passwordHash explicitly (safer schema practice)
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
      invalidAuth(res);
      return;
    }

    // ✅ Optional role check (extra security)
    if (role && user.role !== role) {
      invalidAuth(res);
      return;
    }

    // ✅ Check if account is active (IMPORTANT)
    if (user.isActive === false) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    // ✅ Password validation
    const isValidPassword = await comparePasswords(
      password,
      user.passwordHash
    );

    if (!isValidPassword) {
      invalidAuth(res);
      return;
    }

    // ✅ Generate token
    const token = signToken(user._id.toString(), user.role);

    // ✅ Remove sensitive data
    const clientUser = toClientUser(user);

    res.json({
      user: clientUser,
      token,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid input",
        details: err.errors,
      });
      return;
    }

    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/auth/me
 */
export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    // ✅ Optional: fetch fresh user (avoids stale JWT data)
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.isActive === false) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    const clientUser = toClientUser(user);

    res.json({
      user: clientUser,
      mustChangePassword: user.mustChangePassword || false,
    });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const body = ForgotPasswordSchema.parse(req.body);
    const { email } = body;

    // Find user by email (any role)
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({
        ok: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set token and expiry (1 hour)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
    
    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
    } catch (emailErr) {
      console.error("Failed to send reset email:", emailErr);
      // Don't expose email errors to user
    }

    res.json({
      ok: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid input",
        details: err.errors,
      });
      return;
    }

    console.error("ForgotPassword error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const body = ResetPasswordSchema.parse(req.body);
    const { token, newPassword } = body;

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        error: "Invalid or expired reset token",
      });
      return;
    }

    // Update password
    user.passwordHash = await hashPassword(newPassword);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.mustChangePassword = false;
    await user.save();

    res.json({
      ok: true,
      message: "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid input",
        details: err.errors,
      });
      return;
    }

    console.error("ResetPassword error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/auth/change-password
 * Change password (authenticated user)
 */
export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const body = ChangePasswordSchema.parse(req.body);
    const { currentPassword, newPassword } = body;

    // Get user with password hash
    const user = await User.findById(req.user._id).select("+passwordHash");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Verify current password
    const isValid = await comparePasswords(currentPassword, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    // Update password
    user.passwordHash = await hashPassword(newPassword);
    user.mustChangePassword = false;
    await user.save();

    res.json({
      ok: true,
      message: "Password changed successfully",
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: "Invalid input",
        details: err.errors,
      });
      return;
    }

    console.error("ChangePassword error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

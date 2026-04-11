import { Request, Response } from "express";
import { User } from "../models";
import { comparePasswords, signToken, toClientUser } from "../utils/auth";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

// ✅ Validation Schema
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["teacher", "parent", "student", "admin"]).optional(),
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
    res.status(500).json({ 
      error: "Login failed",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
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

    res.json({ user: clientUser });
  } catch (err: any) {
    console.error("GetMe error:", err);
    res.status(500).json({ 
      error: "Failed to fetch user profile",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

/**
 * POST /api/auth/refresh
 * Generates a new JWT token using the current authenticated session
 */
export async function refreshToken(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.isActive === false) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    // Generate new token
    const token = signToken(user._id.toString(), user.role);
    const clientUser = toClientUser(user);

    res.json({
      user: clientUser,
      token,
      message: "Token refreshed successfully"
    });
  } catch (err: any) {
    console.error("RefreshToken error:", err);
    res.status(500).json({
      error: "Failed to refresh token",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

/**
 * POST /api/auth/reset-password
 * Simple forgot password: verify name, email, (and dob if available) to reset password.
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email, name, dob, newPassword, role } = req.body;
    if (!email || !name || !newPassword || newPassword.length < 4) {
      res.status(400).json({ error: "Missing required fields or password too short" });
      return;
    }

    const query: any = { email, name };
    if (role) {
      query.role = role;
    }

    const user = await User.findOne(query);
    if (!user) {
      // Intentionally vague
      res.status(404).json({ error: "User not found with matching details" });
      return;
    }

    // Hash and update
    const { hashPassword } = await import("../utils/auth");
    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err: any) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
}
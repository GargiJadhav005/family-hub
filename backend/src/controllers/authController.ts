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

    res.json({ user: clientUser });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
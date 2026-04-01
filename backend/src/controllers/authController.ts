import { Request, Response } from "express";
import { User } from "../models";
import { comparePasswords, signToken, toClientUser } from "../utils/auth";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["teacher", "parent", "student", "admin"]).optional(),
});

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const body = LoginSchema.parse(req.body);
    const { email, password, role } = body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (role && user.role !== role) {
      res.status(401).json({ error: "Invalid role for this user" });
      return;
    }

    const isValidPassword = await comparePasswords(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken(user._id.toString(), user.role);
    const clientUser = toClientUser(user);

    res.json({
      user: clientUser,
      token,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: err.errors });
      return;
    }
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const clientUser = toClientUser(user);
    res.json({ user: clientUser });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

import { Request, Response, NextFunction } from "express";
import { verifyToken, AuthTokenPayload } from "../utils/auth";
import { User } from "../models";

/**
 * Extend Express Request
 */
export interface AuthRequest extends Request {
  user?: {
    _id: string;
    name: string;
    email: string;
    role: "admin" | "teacher" | "student" | "parent";
    meta?: Map<string, any> | Record<string, any>;
  };
  decoded?: AuthTokenPayload;
}

/**
 * Type-safe access to authenticated user (after auth middleware)
 */
export function getAuthUser(req: AuthRequest) {
  if (!req.user) {
    throw new Error("User not authenticated");
  }
  return req.user;
}

/**
 * Extract token safely from request
 */
function getTokenFromRequest(req: Request): string | null {
  // 1. Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  // 2. Cookies fallback
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(";");
    for (const c of cookies) {
      const [key, value] = c.trim().split("=");
      if (key === "token") {
        return decodeURIComponent(value);
      }
    }
  }

  return null;
}

/**
 * Main Authentication Middleware
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      res.status(401).json({ error: "Authentication token missing" });
      return;
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.sub) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const user = await User.findById(decoded.sub).lean();

    if (!user) {
      res.status(401).json({ error: "User no longer exists" });
      return;
    }

    // Attach safe user object (avoid sending sensitive data)
    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      meta: user.meta,
    };

    req.decoded = decoded;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

/**
 * Role-based Authorization Middleware
 * Example: requireRole("admin"), requireRole("teacher", "admin")
 */
export function requireRole(...roles: Array<"admin" | "teacher" | "student" | "parent">) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: "Access denied",
        requiredRoles: roles,
        userRole: req.user.role,
      });
      return;
    }

    next();
  };
}

/**
 * Optional: Admin-only shortcut middleware
 */
export const requireAdmin = requireRole("admin");

/**
 * Optional: Teacher + Admin access
 */
export const requireTeacherOrAdmin = requireRole("teacher", "admin");

/**
 * Optional: Parent + Student access
 */
export const requireUserAccess = requireRole("student", "parent", "admin");
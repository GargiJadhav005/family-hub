import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User, UserRole } from "../models";

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
}

export function signToken(userId: string, role: UserRole): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];

  const payload: AuthTokenPayload = {
    sub: userId,
    role,
  };

  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not configured");
      return null;
    }
    const decoded = jwt.verify(token, secret) as AuthTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function toClientUser(user: any) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    meta: user.meta || {},
  };
}

/**
 * Safely get a value from user meta, handling both Map and Record formats
 */
export function getMetaValue(meta: any, key: string): any {
  if (!meta) return undefined;
  // Handle Map format
  if (typeof meta.get === "function") {
    return meta.get(key);
  }
  // Handle Record format
  return meta[key];
}

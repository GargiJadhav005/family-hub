import jwt from 'jsonwebtoken';
import { getDb } from './db';
import type { DbUser, UserRole } from './types';
import { getAuthTokenFromRequest } from './http';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const db = await getDb();
  const users = db.collection<DbUser>('users');

  const doc = await users.findOne({ _id: new ObjectId(id) } as any);
  if (!doc) return null;

  return {
    ...(doc as any),
    _id: (doc as any)._id.toString(),
  };
}

export function toClientUser(user: DbUser) {
  // Shape compatible with frontend AuthContext.User
  return {
    id: user._id.toString(),
    name: user.name,
    role: user.role,
    email: user.email,
    avatar: user.avatar,
    meta: user.meta ?? {},
  };
}

export function signAuthToken(user: DbUser): string {
  const payload: AuthTokenPayload = {
    sub: user._id.toString(),
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });
}

export async function getAuthenticatedUser(req: any): Promise<DbUser | null> {
  const token = getAuthTokenFromRequest(req);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    const user = await findUserById(decoded.sub);
    if (!user) return null;
    return user;
  } catch {
    return null;
  }
}


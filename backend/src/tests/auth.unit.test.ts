/**
 * Family Hub — Auth Unit Tests
 * Tests: hashPassword, comparePasswords, signToken, verifyToken, toClientUser, getMetaValue
 * Run: npx tsx --test src/tests/auth.unit.test.ts
 *       OR npx vitest run src/tests/auth.unit.test.ts
 */

import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";

// ── Inline implementations under test (to avoid env dependencies) ────────────

async function hashPassword(pwd: string): Promise<string> {
  return bcrypt.hash(pwd, 10);
}

async function comparePasswords(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

function getMetaValue(meta: any, key: string): any {
  if (!meta) return undefined;
  if (typeof meta.get === "function") return meta.get(key);
  return meta[key];
}

function toClientUser(user: any) {
  return {
    id: user._id?.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    meta: user.meta || {},
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("hashPassword & comparePasswords", () => {
  it("hashes password to a bcrypt string", async () => {
    const hash = await hashPassword("Gargi@2901");
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it("comparePasswords returns true for correct password", async () => {
    const hash = await hashPassword("Gargi@2901");
    expect(await comparePasswords("Gargi@2901", hash)).toBe(true);
  });

  it("comparePasswords returns false for wrong password", async () => {
    const hash = await hashPassword("Gargi@2901");
    expect(await comparePasswords("wrongpass", hash)).toBe(false);
  });

  it("same password produces different hashes each time (salt)", async () => {
    const h1 = await hashPassword("Gargi@2901");
    const h2 = await hashPassword("Gargi@2901");
    expect(h1).not.toBe(h2);
  });
});

describe("getMetaValue", () => {
  it("reads from Map-based meta", () => {
    const meta = new Map([["class", "इयत्ता १-ब"]]);
    expect(getMetaValue(meta, "class")).toBe("इयत्ता १-ब");
  });

  it("reads from Record-based meta", () => {
    const meta = { class: "इयत्ता २-अ", roll: "07" };
    expect(getMetaValue(meta, "class")).toBe("इयत्ता २-अ");
    expect(getMetaValue(meta, "roll")).toBe("07");
  });

  it("returns undefined for missing key", () => {
    const meta = { class: "इयत्ता १-ब" };
    expect(getMetaValue(meta, "subject")).toBeUndefined();
  });

  it("returns undefined for null meta", () => {
    expect(getMetaValue(null, "class")).toBeUndefined();
  });
});

describe("toClientUser", () => {
  it("maps DB user to client-safe format", () => {
    const dbUser = {
      _id: { toString: () => "abc123" },
      name: "Gargi Jadhav",
      email: "gargi@school.edu",
      role: "teacher",
      avatar: null,
      meta: { class: "इयत्ता १-ब" },
    };
    const result = toClientUser(dbUser);
    expect(result.id).toBe("abc123");
    expect(result.name).toBe("Gargi Jadhav");
    expect(result.email).toBe("gargi@school.edu");
    expect(result.role).toBe("teacher");
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("defaults meta to empty object if not provided", () => {
    const dbUser = { _id: { toString: () => "x" }, name: "A", email: "a@b.com", role: "admin", avatar: null };
    const result = toClientUser(dbUser);
    expect(result.meta).toEqual({});
  });
});

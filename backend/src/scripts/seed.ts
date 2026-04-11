/**
 * seed.ts
 * Creates real test accounts in MongoDB for Family Hub.
 * Run with: npx tsx src/scripts/seed.ts
 *
 * Accounts created (all with same email/password for easy testing):
 *   admin    → gargi.jadhav005@gmail.com / Gargi@2901
 *   teacher  → gargi.jadhav005@gmail.com / Gargi@2901
 *   student  → gargi.jadhav005@gmail.com / Gargi@2901
 *   parent   → gargi.jadhav005@gmail.com / Gargi@2901
 *
 * Note: The User schema uses a compound unique index { email, role }
 * so the same email is allowed for different roles.
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const EMAIL = "gargi.jadhav005@gmail.com";
const PASSWORD = "Gargi@2901";
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set in .env");
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["teacher", "parent", "student", "admin"], required: true },
    avatar: { type: String, default: null },
    meta: { type: Map, of: String, default: new Map() },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
userSchema.index({ email: 1, role: 1 }, { unique: true });

// Avoid model re-registration
const User = mongoose.models.User || mongoose.model("User", userSchema);

async function createOrUpdate(
  name: string,
  role: "admin" | "teacher" | "student" | "parent",
  meta: Record<string, string> = {}
) {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const existing = await User.findOne({ email: EMAIL, role });
  if (existing) {
    await User.updateOne(
      { _id: existing._id },
      { $set: { name, passwordHash, isActive: true, meta: new Map(Object.entries(meta)) } }
    );
    console.log(`  ↺ Updated  [${role.padEnd(7)}] ${EMAIL}`);
    return existing;
  }
  const user = new User({
    name,
    email: EMAIL,
    passwordHash,
    role,
    meta: new Map(Object.entries(meta)),
  });
  await user.save();
  console.log(`  ✓ Created  [${role.padEnd(7)}] ${EMAIL}`);
  return user;
}

async function fixIndexes() {
  // The DB may have an old single-field email_1 unique index.
  // We need the compound { email: 1, role: 1 } index instead.
  try {
    const col = mongoose.connection.collection("users");
    const indexes = await col.indexes();
    const hasOldIndex = indexes.some(
      (idx: any) =>
        JSON.stringify(idx.key) === JSON.stringify({ email: 1 }) &&
        idx.unique === true
    );
    if (hasOldIndex) {
      await col.dropIndex("email_1");
      console.log("  ⚠️  Dropped old email_1 unique index");
    }
    // Ensure compound index exists
    await col.createIndex({ email: 1, role: 1 }, { unique: true });
    console.log("  ✓ Compound index { email, role } ready");
  } catch (err: any) {
    if (err?.codeName !== "IndexNotFound") {
      console.warn("  Index migration warning:", err?.message);
    }
  }
}

async function main() {
  console.log("\n🌱 Family Hub — Account Seeder\n");
  await mongoose.connect(MONGODB_URI as string);
  console.log("✓ Connected to MongoDB\n");

  // Fix indexes first
  await fixIndexes();

  console.log("\n📧 Email   :", EMAIL);
  console.log("🔑 Password:", PASSWORD);
  console.log("─────────────────────────────────");

  // Admin
  await createOrUpdate("Gargi Jadhav (Admin)", "admin");

  // Teacher — assigned to class इयत्ता १-ब by default
  await createOrUpdate("Gargi Jadhav (Teacher)", "teacher", {
    class: "इयत्ता १-ब",
    subject: "सर्व विषय",
  });

  // Student
  await createOrUpdate("Gargi Jadhav (Student)", "student", {
    class: "इयत्ता १-ब",
    roll: "01",
    section: "ब",
  });

  // Parent
  await createOrUpdate("Gargi Jadhav (Parent)", "parent", {
    class: "इयत्ता १-ब",
    child: "Gargi Jadhav (Student)",
  });

  console.log("─────────────────────────────────");
  console.log("\n✅ All accounts ready!\n");
  console.log("Login at: http://localhost:5173/login");
  console.log("  Admin   → role: admin");
  console.log("  Teacher → role: teacher");
  console.log("  Student → role: student");
  console.log("  Parent  → role: parent");
  console.log("\nAll use same email + password ↑\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});

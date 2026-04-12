/**
 * seed.js
 * Creates test accounts in MongoDB for Family Hub with USERNAME authentication.
 * Run with: node src/scripts/seed.js
 *
 * Accounts created:
 *   admin    → username: "admin" / password: "Admin@123"
 *   teacher  → username: "teacher.john" / password: "Teacher@123"
 *   student  → username: "student.jane" / password: "Student@123"
 *   parent   → username: "parent.mak" / password: "Parent@123"
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set in .env");
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["teacher", "parent", "student", "admin"], required: true },
    avatar: { type: String, default: null },
    meta: { type: Map, of: String, default: new Map() },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1, role: 1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);

const testAccounts = [
  {
    name: "Gargi Jadhav (Admin)",
    username: "admin",
    email: "admin@family-hub.local",
    password: "Admin@123",
    role: "admin",
    meta: {},
  },
  {
    name: "John Teacher",
    username: "teacher.john",
    email: "teacher@family-hub.local",
    password: "Teacher@123",
    role: "teacher",
    meta: {
      class: "इयत्ता १-ब",
      subject: "सर्व विषय",
    },
  },
  {
    name: "Jane Student",
    username: "student.jane",
    email: "student@family-hub.local",
    password: "Student@123",
    role: "student",
    meta: {
      class: "इयत्ता १-ब",
      roll: "01",
      section: "ब",
    },
  },
  {
    name: "Mak Parent",
    username: "parent.mak",
    email: "parent@family-hub.local",
    password: "Parent@123",
    role: "parent",
    meta: {
      class: "इयत्ता १-ब",
      child: "Jane Student",
    },
  },
];

async function createOrUpdate(account) {
  const passwordHash = await bcrypt.hash(account.password, 10);
  const existing = await User.findOne({ username: account.username });
  
  if (existing) {
    await User.updateOne(
      { _id: existing._id },
      { 
        $set: { 
          name: account.name,
          email: account.email,
          passwordHash, 
          isActive: true, 
          meta: new Map(Object.entries(account.meta)) 
        } 
      }
    );
    console.log(`  ↺ Updated  [${account.role.padEnd(7)}] @${account.username}`);
    return existing;
  }
  
  const user = new User({
    name: account.name,
    username: account.username,
    email: account.email,
    passwordHash,
    role: account.role,
    meta: new Map(Object.entries(account.meta)),
  });
  
  await user.save();
  console.log(`  ✓ Created  [${account.role.padEnd(7)}] @${account.username}`);
  return user;
}

async function fixIndexes() {
  try {
    const col = mongoose.connection.collection("users");
    const indexes = await col.indexes();
    
    // Drop old email_1 unique index if it exists
    const hasOldIndex = indexes.some(
      (idx) =>
        JSON.stringify(idx.key) === JSON.stringify({ email: 1 }) &&
        idx.unique === true
    );
    if (hasOldIndex) {
      await col.dropIndex("email_1");
      console.log("  ⚠️  Dropped old email_1 unique index");
    }
    
    // Ensure new indexes
    await col.createIndex({ username: 1 }, { unique: true });
    await col.createIndex({ email: 1, role: 1 });
    console.log("  ✓ Indexes ready: username (unique), email + role");
  } catch (err) {
    if (err?.codeName !== "IndexNotFound") {
      console.warn("  Index migration warning:", err?.message);
    }
  }
}

async function main() {
  console.log("\n🌱 Family Hub — Account Seeder (Username-based)\n");
  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB\n");

  await fixIndexes();

  console.log("\n📝 Test Accounts:");
  console.log("─────────────────────────────────");

  for (const account of testAccounts) {
    await createOrUpdate(account);
  }

  console.log("─────────────────────────────────");
  console.log("\n✅ All accounts ready!\n");
  console.log("Login Credentials:");
  console.log("─────────────────────────────────");
  
  for (const account of testAccounts) {
    console.log(`${account.role.toUpperCase()}`);
    console.log(`  Username: ${account.username}`);
    console.log(`  Password: ${account.password}`);
    console.log();
  }
  
  console.log("Login at: http://localhost:5173/login");
  console.log("─────────────────────────────────\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});

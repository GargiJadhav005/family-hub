require("dotenv").config();
const mongoose = require("mongoose");
const { User } = require("../models");
const { hashPassword, generateUsername } = require("../utils/auth");

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'family_hub' });
    console.log("✓ Connected to MongoDB");
    console.log("Seeding admin user...\n");

    const existingAdmin = await User.findOne({ username: "admin" });

    if (existingAdmin) {
      console.log("✓ Admin user already exists");
      console.log(`  Username: ${existingAdmin.username}`);
      console.log(`  Name: ${existingAdmin.name}`);
      console.log(`  Email: ${existingAdmin.email}`);
      console.log(`  Active: ${existingAdmin.isActive}`);
      await mongoose.disconnect();
      return;
    }

    const adminPassword = "Admin@123";
    const passwordHash = await hashPassword(adminPassword);
    const username = "admin";

    const admin = new User({
      name: "Admin User",
      username: username,
      email: "admin@family-hub.local",
      passwordHash,
      role: "admin",
      isActive: true,
    });

    await admin.save();

    console.log("✓ Admin user created successfully!");
    console.log(`
  👤 Username: ${admin.username}
  🔐 Password: Admin@123
  📧 Email: admin@family-hub.local
  
  ⚠️  Make sure to change the password after first login!
    `);

    await mongoose.disconnect();
  } catch (err) {
    console.error("✗ Error seeding admin:", err);
    process.exit(1);
  }
}

seedAdmin();

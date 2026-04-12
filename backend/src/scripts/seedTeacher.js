/**
 * ⚠️  DEPRECATED: Demo Teacher Seed Script
 * 
 * This file is DEPRECATED and should NOT be used in production.
 * Demo accounts have been removed from the system.
 * 
 * For production account creation, see DEPLOYMENT_CREDENTIALS.md
 * 
 * This file is kept for historical reference only.
 * Remove this file before final deployment.
 */

const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const { User } = require("../models/User");

const seedTeacher = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://gargijadhav005_db_user:Gargi%402901@cluster0.bz6q9n9.mongodb.net/?appName=Cluster0";
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");

    const existingTeacher = await User.findOne({ email: "teacher@familyhub.com" });
    if (existingTeacher) {
      console.log("✓ Teacher user already exists");
      await mongoose.disconnect();
      return;
    }

    const password = "Teacher123!";
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    const teacher = new User({
      name: "Ms. Gargi Teacher",
      email: "teacher@familyhub.com",
      passwordHash,
      role: "teacher",
      avatar: null,
      meta: new Map([["createdBy", "seedScript"]]),
      isActive: true,
    });

    await teacher.save();
    console.log("\n✓ Teacher user created successfully!");
    console.log("\n📧 Login Credentials:");
    console.log("   Email: teacher@familyhub.com");
    console.log("   Password: Teacher123!");
    console.log("\n✓ Change password after first login for security.");

    await mongoose.disconnect();
    console.log("\n✓ Database connection closed");
  } catch (error) {
    console.error("✗ Error seeding teacher:", error);
    process.exit(1);
  }
};

seedTeacher();

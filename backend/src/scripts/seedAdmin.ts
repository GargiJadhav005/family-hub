import "dotenv/config";
import { connectDB, disconnectDB } from "../utils/db";
import { User } from "../models";
import { hashPassword } from "../utils/auth";

async function seedAdmin() {
  try {
    await connectDB();
    console.log("Seeding admin user...\n");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@google.com" });

    if (existingAdmin) {
      console.log("✓ Admin user already exists");
      console.log(`  Email: ${existingAdmin.email}`);
      console.log(`  Name: ${existingAdmin.name}`);
      console.log(`  Active: ${existingAdmin.isActive}`);
      await disconnectDB();
      return;
    }

    // Create admin user
    const adminPassword = "Admin@123";
    const passwordHash = await hashPassword(adminPassword);

    const admin = new User({
      name: "Admin User",
      email: "admin@google.com",
      passwordHash,
      role: "admin",
      isActive: true,
    });

    await admin.save();

    console.log("✓ Admin user created successfully!");
    console.log(`
  📧 Email: admin@google.com
  🔐 Password: Admin@123
  
  ⚠️  Make sure to change the password after first login!
    `);

    await disconnectDB();
  } catch (err) {
    console.error("✗ Error seeding admin:", err);
    process.exit(1);
  }
}

seedAdmin();

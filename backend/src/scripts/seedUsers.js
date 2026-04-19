/**
 * ⚠️  DEPRECATED: Demo User Seed Script
 * 
 * This file is DEPRECATED and should NOT be used in production.
 * Demo accounts have been removed from the system.
 * 
 * For production account creation, see DEPLOYMENT_CREDENTIALS.md
 * 
 * This file is kept for historical reference only.
 * Remove this file before final deployment.
 */

const { User } = require("../models");
const { hashPassword } = require("../utils/auth");

const demoUsers = [
  {
    name: "Administrator",
    email: "admin@school.edu",
    password: "admin123",
    role: "admin",
    meta: {
      department: "Administration",
    },
  },
  {
    name: "Mr. Rajesh Kumar",
    email: "teacher1@school.edu",
    password: "teacher123",
    role: "teacher",
    meta: {
      department: "Mathematics",
      class: "10-A",
    },
  },
  {
    name: "Mrs. Priya Sharma",
    email: "teacher2@school.edu",
    password: "teacher123",
    role: "teacher",
    meta: {
      department: "English",
      class: "10-B",
    },
  },
  {
    name: "Mr. Amit Patel",
    email: "teacher3@school.edu",
    password: "teacher123",
    role: "teacher",
    meta: {
      department: "Science",
      class: "9-A",
    },
  },
  {
    name: "Arjun Verma",
    email: "student1@school.edu",
    password: "student123",
    role: "student",
    meta: {
      class: "10-A",
    },
  },
  {
    name: "Priya Singh",
    email: "student2@school.edu",
    password: "student123",
    role: "student",
    meta: {
      class: "10-B",
    },
  },
  {
    name: "Rahul Desai",
    email: "student3@school.edu",
    password: "student123",
    role: "student",
    meta: {
      class: "9-A",
    },
  },
  {
    name: "Mr. Vikram Verma",
    email: "parent1@school.edu",
    password: "parent123",
    role: "parent",
    meta: {
      relationship: "Father",
    },
  },
  {
    name: "Mrs. Anjali Singh",
    email: "parent2@school.edu",
    password: "parent123",
    role: "parent",
    meta: {
      relationship: "Mother",
    },
  },
  {
    name: "Mr. Suresh Desai",
    email: "parent3@school.edu",
    password: "parent123",
    role: "parent",
    meta: {
      relationship: "Father",
    },
  },
];

async function seedDemoUsers() {
  try {
    console.log("🌱 Checking for demo users...");

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({
        email: userData.email,
        role: userData.role,
      });

      if (existingUser) {
        console.log(
          `  ✓ ${userData.email} (${userData.role}) already exists`
        );
        continue;
      }

      const hashedPassword = await hashPassword(userData.password);

      const newUser = new User({
        ...userData,
        passwordHash: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await newUser.save();
      console.log(
        `  ✓ Created ${userData.email} (${userData.role})`
      );
    }

    console.log("\n✅ Demo users seeded successfully!");
    return true;
  } catch (err) {
    console.error("❌ Error seeding demo users:", err);
    return false;
  }
}

module.exports = { seedDemoUsers };

import { User } from "../models";
import { hashPassword } from "../utils/auth";

/**
 * Demo User Data - Create these on server startup if they don't exist
 * Uses compound unique index (email + role) allowing same email for different roles
 */
const demoUsers = [
  {
    name: "Administrator",
    email: "admin@school.edu",
    password: "admin123",
    role: "admin" as const,
    meta: {
      department: "Administration",
    },
  },
  {
    name: "Mr. Rajesh Kumar",
    email: "teacher1@school.edu",
    password: "teacher123",
    role: "teacher" as const,
    meta: {
      department: "Mathematics",
      class: "10-A",
    },
  },
  {
    name: "Mrs. Priya Sharma",
    email: "teacher2@school.edu",
    password: "teacher123",
    role: "teacher" as const,
    meta: {
      department: "English",
      class: "10-B",
    },
  },
  {
    name: "Mr. Amit Patel",
    email: "teacher3@school.edu",
    password: "teacher123",
    role: "teacher" as const,
    meta: {
      department: "Science",
      class: "9-A",
    },
  },
  {
    name: "Arjun Verma",
    email: "student1@school.edu",
    password: "student123",
    role: "student" as const,
    meta: {
      class: "10-A",
    },
  },
  {
    name: "Priya Singh",
    email: "student2@school.edu",
    password: "student123",
    role: "student" as const,
    meta: {
      class: "10-B",
    },
  },
  {
    name: "Rahul Desai",
    email: "student3@school.edu",
    password: "student123",
    role: "student" as const,
    meta: {
      class: "9-A",
    },
  },
  {
    name: "Mr. Vikram Verma",
    email: "parent1@school.edu",
    password: "parent123",
    role: "parent" as const,
    meta: {
      relationship: "Father",
    },
  },
  {
    name: "Mrs. Anjali Singh",
    email: "parent2@school.edu",
    password: "parent123",
    role: "parent" as const,
    meta: {
      relationship: "Mother",
    },
  },
  {
    name: "Mr. Suresh Desai",
    email: "parent3@school.edu",
    password: "parent123",
    role: "parent" as const,
    meta: {
      relationship: "Father",
    },
  },
];

/**
 * Seed database with demo users if they don't exist
 * Runs automatically on server startup
 * @returns {Promise<boolean>} - true if successful, false if error
 */
export async function seedDemoUsers(): Promise<boolean> {
  try {
    console.log("🌱 Checking for demo users...");

    for (const userData of demoUsers) {
      // Check if user with same email + role already exists (compound index)
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

      // Hash password before storing
      const hashedPassword = await hashPassword(userData.password);

      // Create new user
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

    console.log("✅ Demo users seeded successfully!\n");
    return true;
  } catch (error) {
    console.error("❌ Error seeding demo users:", error);
    return false;
  }
}

/**
 * Get all demo users with their credentials (for testing reference)
 */
export function getDemoUsersForTesting() {
  return demoUsers.map((user) => ({
    email: user.email,
    password: user.password,
    role: user.role,
    name: user.name,
  }));
}

/**
 * Clear all users from database (USE WITH CAUTION)
 */
export async function clearAllUsers(): Promise<number> {
  try {
    const result = await User.deleteMany({});
    console.log(`⚠️  Deleted ${result.deletedCount} users from database`);
    return result.deletedCount;
  } catch (error) {
    console.error("Error clearing users:", error);
    throw error;
  }
}

/**
 * Reset database to demo state (clears then reseeds)
 */
export async function resetToDemo(): Promise<boolean> {
  try {
    console.log("🔄 Resetting database to demo state...");
    await clearAllUsers();
    const success = await seedDemoUsers();
    console.log("✅ Database reset to demo state!");
    return success;
  } catch (error) {
    console.error("Error resetting database:", error);
    throw error;
  }
}

import "dotenv/config";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { User } from "../models/User";

const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://gargijadhav005_db_user:Gargi%402901@cluster0.bz6q9n9.mongodb.net/?appName=Cluster0";

async function debugAuth() {
  try {
    console.log("🔍 AUTH DEBUG SCRIPT\n");
    console.log("=" .repeat(70));

    // Connect to DB
    await mongoose.connect(MONGO_URI, { dbName: "family_hub" });
    console.log("✅ Connected to MongoDB\n");

    // Get teacher
    const teacher = await User.findOne({ email: "vv.chiplunkar@vainateya.edu" });

    if (!teacher) {
      console.log("❌ TEACHER NOT FOUND!");
      process.exit(1);
    }

    console.log("👨‍🏫 TEACHER FOUND:");
    console.log(`   Name: ${teacher.name}`);
    console.log(`   Email: ${teacher.email}`);
    console.log(`   Role: ${teacher.role}`);
    console.log(`   Password Hash exists: ${!!teacher.passwordHash}`);
    console.log(`   Password Hash length: ${teacher.passwordHash.length}`);
    console.log(`   Password Hash: ${teacher.passwordHash.substring(0, 30)}...`);
    console.log(`   Is Active: ${teacher.isActive}\n`);

    // Test password comparison
    console.log("🔐 PASSWORD TEST:");
    const testPassword = "Teacher@2025";
    console.log(`   Testing password: "${testPassword}"`);

    try {
      const isValid = await bcryptjs.compare(testPassword, teacher.passwordHash);
      console.log(`   ✅ Password matches: ${isValid}\n`);

      if (!isValid) {
        console.log("   ❌ Password does NOT match!");
        console.log("   This is the problem with login!\n");
      }
    } catch (err: any) {
      console.log(`   ❌ Error comparing passwords: ${err.message}\n`);
    }

    // Test signup flow
    console.log("📝 TESTING SIGNUP (hashing) FLOW:");
    const hashTest = await bcryptjs.hash("TestPassword123", 10);
    console.log(`   Generated hash: ${hashTest.substring(0, 30)}...`);

    const compareTest = await bcryptjs.compare("TestPassword123", hashTest);
    console.log(`   Verify matches: ${compareTest}\n`);

    // Check other users
    console.log("📊 USER COUNTS:");
    const teacherCount = await User.countDocuments({ role: "teacher" });
    const studentCount = await User.countDocuments({ role: "student" });
    const parentCount = await User.countDocuments({ role: "parent" });
    const adminCount = await User.countDocuments({ role: "admin" });
    
    console.log(`   Teachers: ${teacherCount}`);
    console.log(`   Students: ${studentCount}`);
    console.log(`   Parents: ${parentCount}`);
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Total: ${teacherCount + studentCount + parentCount + adminCount}\n`);

    // Sample data
    if (studentCount > 0) {
      const sampleStudent = await User.findOne({ role: "student" });
      console.log("🧑‍🎓 SAMPLE STUDENT:");
      console.log(`   Email: ${sampleStudent?.email}`);
      console.log(`   Name: ${sampleStudent?.name}`);
      console.log(`   Password Hash: ${sampleStudent?.passwordHash.substring(0, 30)}...\n`);
    }

    console.log("=" .repeat(70));
    console.log(
      "✅ DEBUG COMPLETE\n"
    );

    mongoose.connection.close();
  } catch (err: any) {
    console.error("❌ Debug Error:", err.message);
    process.exit(1);
  }
}

debugAuth();

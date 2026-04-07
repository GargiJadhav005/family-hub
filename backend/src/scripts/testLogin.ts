import "dotenv/config";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { User } from "../models/User";

const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://gargijadhav005_db_user:Gargi%402901@cluster0.bz6q9n9.mongodb.net/?appName=Cluster0";

async function testLogin() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: "family_hub" });
    console.log("✅ Connected to MongoDB\n");

    // Test teacher login
    const teacherEmail = "vv.chiplunkar@vainateya.edu";
    const teacherPassword = "Teacher@2025";

    const teacher = await User.findOne({ email: teacherEmail });

    if (!teacher) {
      console.log("❌ TEACHER NOT FOUND!");
      console.log(`   Searched for: ${teacherEmail}`);

      // List all users
      const allUsers = await User.find({}).limit(10);
      const totalUsers = await User.countDocuments({});
      console.log(`\n   Total users in DB: ${totalUsers}`);
      console.log(`   Sample users:`);
      allUsers.forEach((u) => {
        console.log(`   - ${u.email} (${u.role})`);
      });
      
      mongoose.connection.close();
      return;
    }

    console.log(`✅ TEACHER FOUND!`);
    console.log(`   Email: ${teacher.email}`);
    console.log(`   Name: ${teacher.name}`);
    console.log(`   Role: ${teacher.role}`);
    console.log(`   Password Hash Length: ${teacher.passwordHash.length}`);

    // Test password comparison
    console.log(`\n🔑 Testing Password...`);
    console.log(`   Trying password: "${teacherPassword}"`);

    const isPasswordValid = await bcryptjs.compare(
      teacherPassword,
      teacher.passwordHash
    );

    if (isPasswordValid) {
      console.log(`   ✅ PASSWORD IS CORRECT!`);
    } else {
      console.log(`   ❌ PASSWORD IS INCORRECT!`);
      console.log(
        `\n   Trying to hash and compare manually...`
      );

      // Try hashing the password
      const testHash = await bcryptjs.hash(teacherPassword, 10);
      console.log(`   Test hash: ${testHash.substring(0, 50)}...`);
      console.log(
        `   Stored hash: ${teacher.passwordHash.substring(0, 50)}...`
      );
    }

    console.log(`\n${"=".repeat(70)}`);
    console.log(
      `LOGIN TEST: ${isPasswordValid ? "✅ SUCCESS" : "❌ FAILED"}`
    );
    console.log(`${"=".repeat(70)}`);

    mongoose.connection.close();
  } catch (err: any) {
    console.error("❌ Error:", err.message);
  }
}

testLogin();

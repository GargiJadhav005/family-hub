import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { User } from "../models/User";

const seedTeacher = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://gargijadhav005_db_user:Gargi%402901@cluster0.bz6q9n9.mongodb.net/?appName=Cluster0";
    await mongoose.connect(mongoUri);
    console.log("? Connected to MongoDB");

    // Check if teacher already exists
    const existingTeacher = await User.findOne({ email: "teacher@familyhub.com" });
    if (existingTeacher) {
      console.log("? Teacher user already exists");
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const password = "Teacher123!";
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(password, salt);

    // Create teacher user
    const teacher = new User({
      name: "Ms. Gargi Teacher",
      email: "teacher@familyhub.com",
      passwordHash,
      role: "teacher",
      avatar: null,
      meta: {
        createdBy: "seedScript",
      },
      isActive: true,
    });

    await teacher.save();
    console.log("\n? Teacher user created successfully!");
    console.log("\n?? Login Credentials:");
    console.log("   Email: teacher@familyhub.com");
    console.log("   Password: Teacher123!");
    console.log("\n?? Change password after first login for security.");

    await mongoose.disconnect();
    console.log("\n? Database connection closed");
  } catch (error) {
    console.error("? Error seeding teacher:", error);
    process.exit(1);
  }
};

seedTeacher();

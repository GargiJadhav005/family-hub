import mongoose from "mongoose";
import {
  User,
  Student,
  Homework,
  HomeworkStatus,
  Attendance,
  Score,
  Quiz,
  Meeting,
} from "../models";

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "family_hub";

  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  try {
    await mongoose.connect(mongoUri, {
      dbName,
    });

    console.log("✓ Connected to MongoDB");

    // Create indexes for performance
    await createIndexes();
  } catch (err) {
    console.error("✗ Failed to connect to MongoDB:", err);
    throw err;
  }
}

/**
 * Create database indexes for query performance
 * Runs automatically on database connection
 */
async function createIndexes(): Promise<void> {
  try {
    console.log("🔍 Creating database indexes...");

    // User indexes - per-role email uniqueness (already in schema)
    await User.collection.createIndex({ email: 1, role: 1 }, { unique: true });

    // Student indexes
    await Student.collection.createIndex({ className: 1 });
    await Student.collection.createIndex({ studentUserId: 1 });
    await Student.collection.createIndex(
      { className: 1, studentUserId: 1 },
      { name: "student_class_user_idx" }
    );

    // Homework indexes
    await Homework.collection.createIndex({ className: 1 });
    await Homework.collection.createIndex({ createdByTeacherId: 1 });
    await Homework.collection.createIndex(
      { className: 1, createdByTeacherId: 1 },
      { name: "homework_class_teacher_idx" }
    );

    // HomeworkStatus indexes
    await HomeworkStatus.collection.createIndex({ studentId: 1 });
    await HomeworkStatus.collection.createIndex({ homeworkId: 1 });
    await HomeworkStatus.collection.createIndex(
      { studentId: 1, homeworkId: 1 },
      { unique: true, name: "homework_status_unique_idx" }
    );

    // Attendance indexes
    await Attendance.collection.createIndex({ studentId: 1 });
    await Attendance.collection.createIndex({ date: 1 });
    await Attendance.collection.createIndex(
      { studentId: 1, date: 1 },
      { name: "attendance_student_date_idx" }
    );

    // Score indexes
    await Score.collection.createIndex({ studentId: 1 });
    await Score.collection.createIndex({ date: 1 });
    await Score.collection.createIndex(
      { studentId: 1, date: 1 },
      { name: "score_student_date_idx" }
    );

    // Quiz indexes
    await Quiz.collection.createIndex({ className: 1 });
    await Quiz.collection.createIndex({ createdByTeacherId: 1 });

    // Meeting indexes
    await Meeting.collection.createIndex({ date: 1 });
    await Meeting.collection.createIndex({ status: 1 });

    console.log("✓ All database indexes created successfully!\n");
  } catch (error: any) {
    // Index creation errors are not fatal (indexes may already exist)
    if (error.code === 85) {
      // Index already exists with different options
      console.log("✓ Indexes already exist (or similar indexes present)\n");
    } else {
      console.warn("⚠️  Warning while creating indexes:", error.message);
    }
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log("? Disconnected from MongoDB");
  } catch (err) {
    console.error("? Failed to disconnect from MongoDB:", err);
    throw err;
  }
}

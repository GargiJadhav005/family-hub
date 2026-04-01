import "dotenv/config";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import { connectDB } from "./utils/db";
import { seedDemoUsers } from "./scripts/seedUsers";

// Import routes
import authRoutes from "./routes/authRoutes";
import studentRoutes from "./routes/studentRoutes";
import teacherRoutes from "./routes/teacherRoutes";
import homeworkRoutes from "./routes/homeworkRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import scoresRoutes from "./routes/scoresRoutes";
import eventRoutes from "./routes/eventRoutes";
import meetingRoutes from "./routes/meetingRoutes";
import instructionRoutes from "./routes/instructionRoutes";
import quizRoutes from "./routes/quizRoutes";
import adminRoutes from "./routes/adminRoutes";
import enquiryRoutes from "./routes/enquiryRoutes";
import notificationRoutes from "./routes/notificationRoutes";


const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/scores", scoresRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/instructions", instructionRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/notifications", notificationRoutes);


// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// Start server
async function start() {
  try {
    // Validate environment variables
    if (!process.env.JWT_SECRET) {
      console.error("❌ FATAL: JWT_SECRET environment variable is not set");
      console.error("ℹ️  Please set JWT_SECRET in your .env file");
      process.exit(1);
    }

    if (!process.env.MONGODB_URI) {
      console.error("❌ FATAL: MONGODB_URI environment variable is not set");
      console.error("ℹ️  Please set MONGODB_URI in your .env file");
      process.exit(1);
    }

    await connectDB();
    console.log("✓ Connected to MongoDB\n");

    // 🌱 Seed demo users on startup
    await seedDemoUsers();

    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`\n✅ Server running at http://localhost:${PORT}`);
      console.log(`🔗 CORS enabled for ${process.env.FRONTEND_URL || "http://localhost:5173"}\n`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();

export default app;

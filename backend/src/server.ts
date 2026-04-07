import "dotenv/config";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import { connectDB } from "./utils/db";

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
import reportCardRoutes from "./routes/reportCardRoutes";


const app: Express = express();
const PORT = 9000;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://10.204.104.102:5173",  // Also allow network IP
    "http://127.0.0.1:5173",       // Also allow loopback
  ],
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
app.use("/api/report-cards", reportCardRoutes);


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

    const server = app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`\n✅ Server running at http://localhost:${PORT}`);
      console.log(`🔗 CORS enabled for ${process.env.FRONTEND_URL || "http://localhost:5173"}\n`);
    });

    // Log server events
    server.on("clientError", (err: any) => {
      console.error("❌ Client error:", err.message);
    });

    server.on("connection", (socket) => {
      console.log("📡 New connection received");
      socket.on("data", (data) => {
        console.log("📨 Data received on socket");
      });
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();

export default app;

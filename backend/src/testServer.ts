import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const PORT = 5000;
const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://gargijadhav005_db_user:Gargi%402901@cluster0.bz6q9n9.mongodb.net/?appName=Cluster0";

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  console.log("✅ Health check endpoint called");
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Simple test endpoint
app.get("/api/test", (req, res) => {
  console.log("✅ Test endpoint called");
  res.json({ message: "Server is working!" });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Server Error" });
});

async function start() {
  try {
    console.log("🚀 Starting simple test server...\n");

    // Connect to MongoDB with timeout
    console.log("Connecting to MongoDB...");
    await Promise.race([
      mongoose.connect(MONGO_URI, { dbName: "family_hub" }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("MongoDB connection timeout")), 10000)
      ),
    ]);
    console.log("✅ Connected to MongoDB\n");

    // Start server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Test server running at http://localhost:${PORT}`);
      console.log(`🔗 Try: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err: any) {
    console.error("❌ Startup Error:", err.message);
    process.exit(1);
  }
}

start();

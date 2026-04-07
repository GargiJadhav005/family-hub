import "dotenv/config";
import http from "http";

console.log("🚀 Starting minimal HTTP server...\n");

const server = http.createServer((req, res) => {
  console.log(`📨 Request: ${req.method} ${req.url}`);
  
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Minimal HTTP server listening on http://0.0.0.0:${PORT}`);
  console.log(`🔗 Try: curl http://localhost:${PORT}/health\n`);
});

server.on("error", (err: any) => {
  console.error("❌ Server error:", err);
});

// Keep process alive
setTimeout(() => {
  console.log("\nServer is still running...");
}, 5000);

import app from "./app.js";
import env from "./config/env.js";
import prisma from "./lib/prisma.js";

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on http://localhost:${PORT}`);
});

// Graceful Shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log("🔒 HTTP server closed.");
    await prisma.$disconnect();
    console.log("💾 Database connection closed.");
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("⚠️ Forcefully terminating process after timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

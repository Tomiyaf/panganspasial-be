import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import env from "./config/env.js";
import { globalLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { sendSuccess, sendError } from "./utils/response.js";
import prisma from "./lib/prisma.js";

const app = express();

// Security HTTP headers (configured for Swagger UI compatibility)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        env.NODE_ENV === "development" ||
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

// Global Rate Limiter
app.use(globalLimiter);

// Request body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// HTTP Request Logger
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
}

// Serve uploaded static files
app.use("/uploads", express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

// Health Check Endpoint
app.get("/health", async (req, res, next) => {
  try {
    let dbStatus = "ok";
    let postgisVersion = null;

    try {
      const result = await prisma.$queryRaw`SELECT PostGIS_Version() AS version;`;
      postgisVersion = result[0]?.version || null;
    } catch (e) {
      dbStatus = `disconnected: ${e.message}`;
    }

    return sendSuccess(res, {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: dbStatus,
      postgisVersion,
    }, "API server is healthy");
  } catch (error) {
    next(error);
  }
});

// Root Endpoint
app.get("/", (req, res) => {
  return sendSuccess(res, {
    name: "Panganspasial.id Backend API",
    version: "1.0.0",
    docs: "/api/docs",
  }, "Welcome to Panganspasial.id API");
});

import apiRouter from "./routes/index.js";

// Mount API Routes
app.use("/api", apiRouter);

// 404 Handler for undefined routes
app.use((req, res) => {
  return sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404, "ROUTE_NOT_FOUND");
});

// Global Error Handling Middleware
app.use(errorHandler);

// Export app for tests and server entry point
export default app;
export { app };


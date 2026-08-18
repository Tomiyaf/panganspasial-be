import { sendError } from "../utils/response.js";
import { ZodError } from "zod";

export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // Handle Zod Schema Validation Error
  if (err instanceof ZodError) {
    const errorMessages = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return sendError(res, "Validation Error", 400, "VALIDATION_ERROR", errorMessages);
  }

  // Handle Prisma Known Request Errors
  if (err.code && typeof err.code === "string" && err.code.startsWith("P")) {
    if (err.code === "P2002") {
      const target = err.meta?.target || "field";
      return sendError(res, `Unique constraint violation on ${target}`, 409, "CONFLICT_ERROR", err.meta);
    }
    if (err.code === "P2025") {
      return sendError(res, "Record not found", 404, "NOT_FOUND", err.meta);
    }
    if (err.code === "P2003") {
      return sendError(res, "Foreign key constraint failed", 400, "FOREIGN_KEY_ERROR", err.meta);
    }
  }

  // Handle explicitly thrown HTTP errors with status
  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || (statusCode >= 500 ? "INTERNAL_ERROR" : "BAD_REQUEST");
  const message = err.message || "An unexpected error occurred";

  return sendError(
    res,
    message,
    statusCode,
    errorCode,
    process.env.NODE_ENV === "development" ? err.stack : undefined
  );
};

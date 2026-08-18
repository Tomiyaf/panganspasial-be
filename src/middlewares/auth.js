import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { sendError } from "../utils/response.js";
import prisma from "../lib/prisma.js";

/**
 * Middleware to authenticate JWT token from Authorization header
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Access denied. No authorization token provided.", 401, "UNAUTHORIZED");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return sendError(res, "Access denied. Invalid token format.", 401, "UNAUTHORIZED");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Verify user is still active in database
    const user = await prisma.user.findUnique({
      where: { id: BigInt(decoded.userId) },
      include: { role: true },
    });

    if (!user || !user.is_active) {
      return sendError(res, "Invalid token or inactive user account.", 401, "UNAUTHORIZED");
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, "Token has expired. Please log in again.", 401, "TOKEN_EXPIRED");
    }
    return sendError(res, "Invalid authorization token.", 401, "INVALID_TOKEN");
  }
};

/**
 * Middleware factory to authorize specific roles
 * @param  {...string} roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Authentication required.", 401, "UNAUTHORIZED");
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return sendError(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
        403,
        "FORBIDDEN"
      );
    }

    next();
  };
};

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import env from "../config/env.js";

export class AuthService {
  /**
   * Admin Login
   * @param {string} email
   * @param {string} password
   */
  static async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      error.code = "AUTH_FAILED";
      throw error;
    }

    if (!user.is_active) {
      const error = new Error("Account is deactivated. Please contact the administrator.");
      error.status = 403;
      error.code = "ACCOUNT_INACTIVE";
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      error.code = "AUTH_FAILED";
      throw error;
    }

    const payload = {
      userId: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role.name,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    };
  }

  /**
   * Get user profile by ID
   * @param {bigint|number|string} userId
   */
  static async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      include: { role: true },
    });

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      error.code = "USER_NOT_FOUND";
      throw error;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      is_active: user.is_active,
      created_at: user.created_at,
    };
  }
}

export default AuthService;

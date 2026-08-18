import AuthService from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";

export class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return sendSuccess(res, result, "Login successful", 200);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const profile = await AuthService.getProfile(req.user.id);
      return sendSuccess(res, profile, "User profile retrieved", 200);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;

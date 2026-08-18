import UserService from "../services/userService.js";
import { sendSuccess } from "../utils/response.js";

export class UserController {
  static async getUsers(req, res, next) {
    try {
      const users = await UserService.getUsers();
      return sendSuccess(res, users, "Users retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const user = await UserService.getUserById(req.params.id);
      return sendSuccess(res, user, "User retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async createUser(req, res, next) {
    try {
      const user = await UserService.createUser(req.body);
      return sendSuccess(res, user, "User created successfully", 201);
    } catch (e) {
      next(e);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      return sendSuccess(res, user, "User updated successfully");
    } catch (e) {
      next(e);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      await UserService.deleteUser(req.params.id);
      return sendSuccess(res, null, "User deleted successfully");
    } catch (e) {
      next(e);
    }
  }

  static async getDashboardSummary(req, res, next) {
    try {
      const summary = await UserService.getDashboardSummary();
      return sendSuccess(res, summary, "Admin dashboard summary retrieved");
    } catch (e) {
      next(e);
    }
  }
}

export default UserController;

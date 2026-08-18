import FarmService from "../services/farmService.js";
import { sendSuccess } from "../utils/response.js";

export class FarmController {
  static async getFarms(req, res, next) {
    try {
      const result = await FarmService.getFarms(req.query);
      return sendSuccess(res, result.items, "Farms retrieved successfully", 200, result.pagination);
    } catch (e) {
      next(e);
    }
  }

  static async getFarmById(req, res, next) {
    try {
      const data = await FarmService.getFarmById(req.params.id);
      return sendSuccess(res, data, "Farm detail retrieved successfully");
    } catch (e) {
      next(e);
    }
  }

  static async createFarm(req, res, next) {
    try {
      const data = await FarmService.createFarm(req.body);
      return sendSuccess(res, data, "Farm created successfully", 201);
    } catch (e) {
      next(e);
    }
  }

  static async updateFarm(req, res, next) {
    try {
      const data = await FarmService.updateFarm(req.params.id, req.body);
      return sendSuccess(res, data, "Farm updated successfully");
    } catch (e) {
      next(e);
    }
  }

  static async deleteFarm(req, res, next) {
    try {
      await FarmService.deleteFarm(req.params.id);
      return sendSuccess(res, null, "Farm deleted successfully");
    } catch (e) {
      next(e);
    }
  }
}

export default FarmController;

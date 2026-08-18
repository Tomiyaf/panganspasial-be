import LivestockService from "../services/livestockService.js";
import { sendSuccess } from "../utils/response.js";

export class LivestockController {
  static async getLivestockByFarm(req, res, next) {
    try {
      const data = await LivestockService.getLivestockByFarm(req.params.farmId);
      return sendSuccess(res, data, "Livestock records retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async getLivestockById(req, res, next) {
    try {
      const data = await LivestockService.getLivestockById(req.params.id);
      return sendSuccess(res, data, "Livestock detail retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async createLivestock(req, res, next) {
    try {
      const data = await LivestockService.createLivestock(req.params.farmId, req.body);
      return sendSuccess(res, data, "Livestock record created successfully", 201);
    } catch (e) {
      next(e);
    }
  }

  static async updateLivestock(req, res, next) {
    try {
      const data = await LivestockService.updateLivestock(req.params.id, req.body);
      return sendSuccess(res, data, "Livestock record updated successfully");
    } catch (e) {
      next(e);
    }
  }

  static async deleteLivestock(req, res, next) {
    try {
      await LivestockService.deleteLivestock(req.params.id);
      return sendSuccess(res, null, "Livestock record deleted successfully");
    } catch (e) {
      next(e);
    }
  }
}

export default LivestockController;

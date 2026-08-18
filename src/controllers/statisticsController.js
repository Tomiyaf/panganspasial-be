import StatisticsService from "../services/statisticsService.js";
import { sendSuccess } from "../utils/response.js";

export class StatisticsController {
  static async getOverview(req, res, next) {
    try {
      const data = await StatisticsService.getOverviewKPI(req.query);
      return sendSuccess(res, data, "Dashboard KPI overview retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async getFarmsByDistrict(req, res, next) {
    try {
      const data = await StatisticsService.getFarmsByDistrict();
      return sendSuccess(res, data, "Farm statistics by district retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async getLivestockStats(req, res, next) {
    try {
      const data = await StatisticsService.getLivestockStats(req.query);
      return sendSuccess(res, data, "Livestock statistics retrieved");
    } catch (e) {
      next(e);
    }
  }
}

export default StatisticsController;

import SdssService from "../services/sdssService.js";
import { sendSuccess } from "../utils/response.js";

export class SdssController {
  // Public recommendation endpoint (TASK-050)
  static async getRecommendations(req, res, next) {
    try {
      const results = await SdssService.calculateRecommendations({ persist: false });
      return sendSuccess(res, results, "SDSS district recommendations retrieved");
    } catch (e) {
      next(e);
    }
  }

  // Admin recalculate & persist endpoint (TASK-051)
  static async calculateAndPersist(req, res, next) {
    try {
      const results = await SdssService.calculateRecommendations({ persist: true });
      return sendSuccess(res, results, "SDSS recommendations calculated and persisted successfully");
    } catch (e) {
      next(e);
    }
  }

  // Criteria CRUD (TASK-047)
  static async getCriteria(req, res, next) {
    try {
      const data = await SdssService.getCriteria();
      return sendSuccess(res, data, "SDSS criteria retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async createCriterion(req, res, next) {
    try {
      const data = await SdssService.createCriterion(req.body);
      return sendSuccess(res, data, "SDSS criterion created", 201);
    } catch (e) {
      next(e);
    }
  }

  static async updateCriterion(req, res, next) {
    try {
      const data = await SdssService.updateCriterion(req.params.id, req.body);
      return sendSuccess(res, data, "SDSS criterion updated");
    } catch (e) {
      next(e);
    }
  }

  static async deleteCriterion(req, res, next) {
    try {
      await SdssService.deleteCriterion(req.params.id);
      return sendSuccess(res, null, "SDSS criterion deleted");
    } catch (e) {
      next(e);
    }
  }

  // Weight rule creation (TASK-048)
  static async createWeightRule(req, res, next) {
    try {
      const data = await SdssService.createWeightRule(req.params.criteriaId, req.body);
      return sendSuccess(res, data, "SDSS weight rule created", 201);
    } catch (e) {
      next(e);
    }
  }

  static async deleteWeightRule(req, res, next) {
    try {
      await SdssService.deleteWeightRule(req.params.id);
      return sendSuccess(res, null, "SDSS weight rule deleted");
    } catch (e) {
      next(e);
    }
  }
}

export default SdssController;

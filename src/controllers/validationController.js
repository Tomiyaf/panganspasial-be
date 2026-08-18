import ValidationService from "../services/validationService.js";
import { sendSuccess } from "../utils/response.js";

export class ValidationController {
  static async getValidations(req, res, next) {
    try {
      const result = await ValidationService.getValidations(req.query);
      return sendSuccess(res, result.items, "Validation records retrieved", 200, result.pagination);
    } catch (e) {
      next(e);
    }
  }

  static async getValidationById(req, res, next) {
    try {
      const data = await ValidationService.getValidationById(req.params.id);
      return sendSuccess(res, data, "Validation detail retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async createValidation(req, res, next) {
    try {
      const data = await ValidationService.createValidation(req.user.id, req.body);
      return sendSuccess(res, data, "Validation record created", 201);
    } catch (e) {
      next(e);
    }
  }

  static async updateValidation(req, res, next) {
    try {
      const data = await ValidationService.updateValidation(req.params.id, req.user.id, req.body);
      return sendSuccess(res, data, "Validation record updated");
    } catch (e) {
      next(e);
    }
  }
}

export default ValidationController;

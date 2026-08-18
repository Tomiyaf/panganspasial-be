import MasterDataService from "../services/masterDataService.js";
import { sendSuccess } from "../utils/response.js";

export class MasterDataController {
  // ==================== FARM CATEGORIES ====================
  static async getFarmCategories(req, res, next) {
    try {
      const data = await MasterDataService.getFarmCategories();
      return sendSuccess(res, data, "Farm categories retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async getFarmCategoryById(req, res, next) {
    try {
      const data = await MasterDataService.getFarmCategoryById(req.params.id);
      return sendSuccess(res, data, "Farm category retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async createFarmCategory(req, res, next) {
    try {
      const data = await MasterDataService.createFarmCategory(req.body);
      return sendSuccess(res, data, "Farm category created", 201);
    } catch (e) {
      next(e);
    }
  }

  static async updateFarmCategory(req, res, next) {
    try {
      const data = await MasterDataService.updateFarmCategory(req.params.id, req.body);
      return sendSuccess(res, data, "Farm category updated");
    } catch (e) {
      next(e);
    }
  }

  static async deleteFarmCategory(req, res, next) {
    try {
      await MasterDataService.deleteFarmCategory(req.params.id);
      return sendSuccess(res, null, "Farm category deleted");
    } catch (e) {
      next(e);
    }
  }

  // ==================== FARM SCALES ====================
  static async getFarmScales(req, res, next) {
    try {
      const data = await MasterDataService.getFarmScales();
      return sendSuccess(res, data, "Farm scales retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async getFarmScaleById(req, res, next) {
    try {
      const data = await MasterDataService.getFarmScaleById(req.params.id);
      return sendSuccess(res, data, "Farm scale retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async createFarmScale(req, res, next) {
    try {
      const data = await MasterDataService.createFarmScale(req.body);
      return sendSuccess(res, data, "Farm scale created", 201);
    } catch (e) {
      next(e);
    }
  }

  static async updateFarmScale(req, res, next) {
    try {
      const data = await MasterDataService.updateFarmScale(req.params.id, req.body);
      return sendSuccess(res, data, "Farm scale updated");
    } catch (e) {
      next(e);
    }
  }

  static async deleteFarmScale(req, res, next) {
    try {
      await MasterDataService.deleteFarmScale(req.params.id);
      return sendSuccess(res, null, "Farm scale deleted");
    } catch (e) {
      next(e);
    }
  }

  // ==================== LIVESTOCK CATEGORIES ====================
  static async getLivestockCategories(req, res, next) {
    try {
      const data = await MasterDataService.getLivestockCategories();
      return sendSuccess(res, data, "Livestock categories retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async getLivestockCategoryById(req, res, next) {
    try {
      const data = await MasterDataService.getLivestockCategoryById(req.params.id);
      return sendSuccess(res, data, "Livestock category retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async createLivestockCategory(req, res, next) {
    try {
      const data = await MasterDataService.createLivestockCategory(req.body);
      return sendSuccess(res, data, "Livestock category created", 201);
    } catch (e) {
      next(e);
    }
  }

  static async updateLivestockCategory(req, res, next) {
    try {
      const data = await MasterDataService.updateLivestockCategory(req.params.id, req.body);
      return sendSuccess(res, data, "Livestock category updated");
    } catch (e) {
      next(e);
    }
  }

  static async deleteLivestockCategory(req, res, next) {
    try {
      await MasterDataService.deleteLivestockCategory(req.params.id);
      return sendSuccess(res, null, "Livestock category deleted");
    } catch (e) {
      next(e);
    }
  }

  // ==================== LIVESTOCK TYPES ====================
  static async getLivestockTypes(req, res, next) {
    try {
      const data = await MasterDataService.getLivestockTypes(req.query.category_id);
      return sendSuccess(res, data, "Livestock types retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async getLivestockTypeById(req, res, next) {
    try {
      const data = await MasterDataService.getLivestockTypeById(req.params.id);
      return sendSuccess(res, data, "Livestock type retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async createLivestockType(req, res, next) {
    try {
      const data = await MasterDataService.createLivestockType(req.body);
      return sendSuccess(res, data, "Livestock type created", 201);
    } catch (e) {
      next(e);
    }
  }

  static async updateLivestockType(req, res, next) {
    try {
      const data = await MasterDataService.updateLivestockType(req.params.id, req.body);
      return sendSuccess(res, data, "Livestock type updated");
    } catch (e) {
      next(e);
    }
  }

  static async deleteLivestockType(req, res, next) {
    try {
      await MasterDataService.deleteLivestockType(req.params.id);
      return sendSuccess(res, null, "Livestock type deleted");
    } catch (e) {
      next(e);
    }
  }

  // ==================== LIVESTOCK SUBTYPES ====================
  static async getLivestockSubtypes(req, res, next) {
    try {
      const data = await MasterDataService.getLivestockSubtypes(req.query.type_id);
      return sendSuccess(res, data, "Livestock subtypes retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async getLivestockSubtypeById(req, res, next) {
    try {
      const data = await MasterDataService.getLivestockSubtypeById(req.params.id);
      return sendSuccess(res, data, "Livestock subtype retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async createLivestockSubtype(req, res, next) {
    try {
      const data = await MasterDataService.createLivestockSubtype(req.body);
      return sendSuccess(res, data, "Livestock subtype created", 201);
    } catch (e) {
      next(e);
    }
  }

  static async updateLivestockSubtype(req, res, next) {
    try {
      const data = await MasterDataService.updateLivestockSubtype(req.params.id, req.body);
      return sendSuccess(res, data, "Livestock subtype updated");
    } catch (e) {
      next(e);
    }
  }

  static async deleteLivestockSubtype(req, res, next) {
    try {
      await MasterDataService.deleteLivestockSubtype(req.params.id);
      return sendSuccess(res, null, "Livestock subtype deleted");
    } catch (e) {
      next(e);
    }
  }
}

export default MasterDataController;

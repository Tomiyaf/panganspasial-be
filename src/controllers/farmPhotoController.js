import FarmPhotoService from "../services/farmPhotoService.js";
import { sendSuccess, sendError } from "../utils/response.js";

export class FarmPhotoController {
  static async getPhotosByFarm(req, res, next) {
    try {
      const photos = await FarmPhotoService.getPhotosByFarm(req.params.farmId);
      return sendSuccess(res, photos, "Farm photos retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async uploadPhoto(req, res, next) {
    try {
      if (!req.file) {
        return sendError(res, "No photo file uploaded. Please attach an image in 'photo' field.", 400, "MISSING_FILE");
      }

      const photo = await FarmPhotoService.addPhoto(req.params.farmId, req.file, req.body);
      return sendSuccess(res, photo, "Photo uploaded successfully", 201);
    } catch (e) {
      next(e);
    }
  }

  static async updatePhoto(req, res, next) {
    try {
      const photo = await FarmPhotoService.updatePhoto(req.params.id, req.body);
      return sendSuccess(res, photo, "Photo updated successfully");
    } catch (e) {
      next(e);
    }
  }

  static async deletePhoto(req, res, next) {
    try {
      await FarmPhotoService.deletePhoto(req.params.id);
      return sendSuccess(res, null, "Photo deleted successfully");
    } catch (e) {
      next(e);
    }
  }
}

export default FarmPhotoController;

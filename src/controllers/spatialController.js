import SpatialService from "../services/spatialService.js";
import { sendSuccess } from "../utils/response.js";

export class SpatialController {
  static async getFarmsGeoJSON(req, res, next) {
    try {
      const geojson = await SpatialService.getFarmsGeoJSON(req.query);
      return res.status(200).json(geojson);
    } catch (e) {
      next(e);
    }
  }

  static async getDistrictsGeoJSON(req, res, next) {
    try {
      const geojson = await SpatialService.getDistrictsGeoJSON();
      return res.status(200).json(geojson);
    } catch (e) {
      next(e);
    }
  }

  static async getVillagesGeoJSON(req, res, next) {
    try {
      const geojson = await SpatialService.getVillagesGeoJSON(req.query.district_id);
      return res.status(200).json(geojson);
    } catch (e) {
      next(e);
    }
  }

  static async getDistrictDetail(req, res, next) {
    try {
      const data = await SpatialService.getDistrictDetail(req.params.id);
      return sendSuccess(res, data, "District spatial detail retrieved");
    } catch (e) {
      next(e);
    }
  }

  static async getHeatmap(req, res, next) {
    try {
      const data = await SpatialService.getHeatmapData(req.query);
      return sendSuccess(res, data, "Heatmap points calculated successfully");
    } catch (e) {
      next(e);
    }
  }
}

export default SpatialController;

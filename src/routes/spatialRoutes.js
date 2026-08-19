import { Router } from "express";
import SpatialController from "../controllers/spatialController.js";
import { validate } from "../middlewares/validate.js";
import {
  getSpatialFarmsQuerySchema,
  getVillagesQuerySchema,
} from "../validators/spatialValidator.js";

const router = Router();

// WebGIS Spatial Endpoints (TASK-035, TASK-038, TASK-039, TASK-040, TASK-045)
router.get("/spatial/farms", validate(getSpatialFarmsQuerySchema), SpatialController.getFarmsGeoJSON);
router.get("/spatial/districts", SpatialController.getDistrictsGeoJSON);
router.get("/spatial/villages", validate(getVillagesQuerySchema), SpatialController.getVillagesGeoJSON);
router.get("/spatial/districts/:id", SpatialController.getDistrictDetail);

// Heatmap endpoint (TASK-045, TASK-046)
router.get("/heatmap", SpatialController.getHeatmap);

export default router;

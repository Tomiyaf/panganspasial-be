import { Router } from "express";
import FarmController from "../controllers/farmController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  getFarmsQuerySchema,
  createFarmSchema,
  updateFarmSchema,
} from "../validators/farmValidator.js";

const router = Router();

// Public Farm Endpoints (TASK-024, TASK-025)
router.get("/farms", validate(getFarmsQuerySchema), FarmController.getFarms);
router.get("/farms/:id", FarmController.getFarmById);

// Admin Farm Endpoints (TASK-026)
router.get("/admin/farms", authenticate, authorize("Admin"), validate(getFarmsQuerySchema), FarmController.getFarms);
router.get("/admin/farms/:id", authenticate, authorize("Admin"), FarmController.getFarmById);
router.post("/admin/farms", authenticate, authorize("Admin"), validate(createFarmSchema), FarmController.createFarm);
router.patch("/admin/farms/:id", authenticate, authorize("Admin"), validate(updateFarmSchema), FarmController.updateFarm);
router.delete("/admin/farms/:id", authenticate, authorize("Admin"), FarmController.deleteFarm);

export default router;

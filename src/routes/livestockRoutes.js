import { Router } from "express";
import LivestockController from "../controllers/livestockController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createLivestockSchema,
  updateLivestockSchema,
} from "../validators/livestockValidator.js";

const router = Router();

// Public livestock endpoints
router.get("/farms/:farmId/livestock", LivestockController.getLivestockByFarm);
router.get("/livestock/:id", LivestockController.getLivestockById);

// Admin livestock endpoints (TASK-028)
router.post(
  "/admin/farms/:farmId/livestock",
  authenticate,
  authorize("Admin"),
  validate(createLivestockSchema),
  LivestockController.createLivestock
);
router.patch(
  "/admin/livestock/:id",
  authenticate,
  authorize("Admin"),
  validate(updateLivestockSchema),
  LivestockController.updateLivestock
);
router.delete(
  "/admin/livestock/:id",
  authenticate,
  authorize("Admin"),
  LivestockController.deleteLivestock
);

export default router;

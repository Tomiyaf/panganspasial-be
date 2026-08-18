import { Router } from "express";
import MasterDataController from "../controllers/masterDataController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createNameDescSchema,
  updateNameDescSchema,
  createLivestockTypeSchema,
  updateLivestockTypeSchema,
  createLivestockSubtypeSchema,
  updateLivestockSubtypeSchema,
} from "../validators/masterDataValidator.js";

const router = Router();

// ==================== FARM CATEGORIES ====================
router.get("/farm-categories", MasterDataController.getFarmCategories);
router.get("/farm-categories/:id", MasterDataController.getFarmCategoryById);
router.post(
  "/admin/farm-categories",
  authenticate,
  authorize("Admin"),
  validate(createNameDescSchema),
  MasterDataController.createFarmCategory
);
router.patch(
  "/admin/farm-categories/:id",
  authenticate,
  authorize("Admin"),
  validate(updateNameDescSchema),
  MasterDataController.updateFarmCategory
);
router.delete(
  "/admin/farm-categories/:id",
  authenticate,
  authorize("Admin"),
  MasterDataController.deleteFarmCategory
);

// ==================== FARM SCALES ====================
router.get("/farm-scales", MasterDataController.getFarmScales);
router.get("/farm-scales/:id", MasterDataController.getFarmScaleById);
router.post(
  "/admin/farm-scales",
  authenticate,
  authorize("Admin"),
  validate(createNameDescSchema),
  MasterDataController.createFarmScale
);
router.patch(
  "/admin/farm-scales/:id",
  authenticate,
  authorize("Admin"),
  validate(updateNameDescSchema),
  MasterDataController.updateFarmScale
);
router.delete(
  "/admin/farm-scales/:id",
  authenticate,
  authorize("Admin"),
  MasterDataController.deleteFarmScale
);

// ==================== LIVESTOCK CATEGORIES ====================
router.get("/livestock-categories", MasterDataController.getLivestockCategories);
router.get("/livestock-categories/:id", MasterDataController.getLivestockCategoryById);
router.post(
  "/admin/livestock-categories",
  authenticate,
  authorize("Admin"),
  validate(createNameDescSchema),
  MasterDataController.createLivestockCategory
);
router.patch(
  "/admin/livestock-categories/:id",
  authenticate,
  authorize("Admin"),
  validate(updateNameDescSchema),
  MasterDataController.updateLivestockCategory
);
router.delete(
  "/admin/livestock-categories/:id",
  authenticate,
  authorize("Admin"),
  MasterDataController.deleteLivestockCategory
);

// ==================== LIVESTOCK TYPES ====================
router.get("/livestock-types", MasterDataController.getLivestockTypes);
router.get("/livestock-types/:id", MasterDataController.getLivestockTypeById);
router.post(
  "/admin/livestock-types",
  authenticate,
  authorize("Admin"),
  validate(createLivestockTypeSchema),
  MasterDataController.createLivestockType
);
router.patch(
  "/admin/livestock-types/:id",
  authenticate,
  authorize("Admin"),
  validate(updateLivestockTypeSchema),
  MasterDataController.updateLivestockType
);
router.delete(
  "/admin/livestock-types/:id",
  authenticate,
  authorize("Admin"),
  MasterDataController.deleteLivestockType
);

// ==================== LIVESTOCK SUBTYPES ====================
router.get("/livestock-subtypes", MasterDataController.getLivestockSubtypes);
router.get("/livestock-subtypes/:id", MasterDataController.getLivestockSubtypeById);
router.post(
  "/admin/livestock-subtypes",
  authenticate,
  authorize("Admin"),
  validate(createLivestockSubtypeSchema),
  MasterDataController.createLivestockSubtype
);
router.patch(
  "/admin/livestock-subtypes/:id",
  authenticate,
  authorize("Admin"),
  validate(updateLivestockSubtypeSchema),
  MasterDataController.updateLivestockSubtype
);
router.delete(
  "/admin/livestock-subtypes/:id",
  authenticate,
  authorize("Admin"),
  MasterDataController.deleteLivestockSubtype
);

export default router;

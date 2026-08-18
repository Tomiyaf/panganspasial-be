import { Router } from "express";
import FarmPhotoController from "../controllers/farmPhotoController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { photoUpload } from "../middlewares/upload.js";

const router = Router();

// Public photo view
router.get("/farms/:farmId/photos", FarmPhotoController.getPhotosByFarm);

// Admin photo endpoints (TASK-030)
router.post(
  "/admin/farms/:farmId/photos",
  authenticate,
  authorize("Admin"),
  photoUpload.single("photo"),
  FarmPhotoController.uploadPhoto
);
router.patch(
  "/admin/farm-photos/:id",
  authenticate,
  authorize("Admin"),
  FarmPhotoController.updatePhoto
);
router.delete(
  "/admin/farm-photos/:id",
  authenticate,
  authorize("Admin"),
  FarmPhotoController.deletePhoto
);

export default router;

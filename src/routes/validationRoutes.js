import { Router } from "express";
import ValidationController from "../controllers/validationController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

// All validation endpoints are admin protected (TASK-032)
router.get("/admin/validations", authenticate, authorize("Admin"), ValidationController.getValidations);
router.get("/admin/validations/:id", authenticate, authorize("Admin"), ValidationController.getValidationById);
router.post("/admin/validations", authenticate, authorize("Admin"), ValidationController.createValidation);
router.patch("/admin/validations/:id", authenticate, authorize("Admin"), ValidationController.updateValidation);

export default router;

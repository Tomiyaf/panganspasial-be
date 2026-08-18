import { Router } from "express";
import SdssController from "../controllers/sdssController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

// Public recommendation endpoint (TASK-050)
router.get("/recommendations", SdssController.getRecommendations);

// Admin SDSS criteria and calculation endpoints (TASK-047, 048, 051)
router.post("/admin/recommendations/calculate", authenticate, authorize("Admin"), SdssController.calculateAndPersist);
router.get("/admin/sdss/criteria", authenticate, authorize("Admin"), SdssController.getCriteria);
router.post("/admin/sdss/criteria", authenticate, authorize("Admin"), SdssController.createCriterion);
router.patch("/admin/sdss/criteria/:id", authenticate, authorize("Admin"), SdssController.updateCriterion);
router.delete("/admin/sdss/criteria/:id", authenticate, authorize("Admin"), SdssController.deleteCriterion);
router.post("/admin/sdss/criteria/:criteriaId/weights", authenticate, authorize("Admin"), SdssController.createWeightRule);
router.delete("/admin/sdss/weights/:id", authenticate, authorize("Admin"), SdssController.deleteWeightRule);

export default router;

import { Router } from "express";
import StatisticsController from "../controllers/statisticsController.js";

const router = Router();

// Dashboard Statistics Endpoints (TASK-041 to TASK-044)
router.get("/statistics/overview", StatisticsController.getOverview);
router.get("/statistics/farms", StatisticsController.getFarmsByDistrict);
router.get("/statistics/livestock", StatisticsController.getLivestockStats);

export default router;

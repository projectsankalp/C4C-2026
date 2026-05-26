import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";

const router = Router();

router.get("/", AnalyticsController.getImpact);
router.get("/impact", AnalyticsController.getImpact);
router.get("/districts", AnalyticsController.getDistrictStats);
router.get("/categories", AnalyticsController.getCategoryStats);

export default router;

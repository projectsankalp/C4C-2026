import { Router } from "express";
import { AIController } from "../controllers/ai.controller";

const router = Router();
router.post("/match", AIController.match);
router.post("/price", AIController.price);
router.post("/translate", AIController.translate);
export default router;

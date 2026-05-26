import { Router } from "express";
import { DemoController } from "../controllers/demo.controller";
import { demoAuth } from "../middleware/demoAuth";

const router = Router();

router.post("/reset", demoAuth, DemoController.reset);

export default router;

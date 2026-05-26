import { Router } from "express";
import { BarterController } from "../controllers/barter.controller";

const router = Router();
router.get("/", BarterController.list);
router.post("/", BarterController.create);
router.patch("/:id/close", BarterController.close);
export default router;

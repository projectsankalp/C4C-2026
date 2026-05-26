import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";

const router = Router();
router.get("/overview", AdminController.overview);
router.get("/activity", AdminController.activity);
export default router;

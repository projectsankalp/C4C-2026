import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const router = Router();

router.get("/by-phone/:phone", UserController.getByPhone);
router.patch("/by-phone/:phone", UserController.patchByPhone);

export default router;

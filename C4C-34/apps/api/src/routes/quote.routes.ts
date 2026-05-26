import { Router } from "express";
import { RequestController } from "../controllers/request.controller";

const router = Router();

router.post("/:id/accept", RequestController.acceptQuote);
router.post("/:id/reject", RequestController.rejectQuote);

export default router;

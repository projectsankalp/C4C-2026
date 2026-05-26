import { Router } from "express";
import { ProcessStepController } from "../controllers/processStep.controller";

const router = Router({ mergeParams: true });
router.get("/", ProcessStepController.list);
router.post("/", ProcessStepController.create);
router.delete("/:stepId", ProcessStepController.remove);
export default router;

import { Router } from "express";
import { RequestController } from "../controllers/request.controller";

const router = Router();

router.post("/", RequestController.create);
router.get("/", RequestController.list);
router.get("/:id", RequestController.get);
router.post("/:id/quotes", RequestController.submitQuote);
router.get("/:id/quotes", RequestController.listQuotes);

export default router;

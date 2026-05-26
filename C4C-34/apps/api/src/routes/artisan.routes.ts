import { Router } from "express";
import { ArtisanController } from "../controllers/artisan.controller";

const router = Router();

router.post("/find-or-create", ArtisanController.findOrCreate);
router.get("/", ArtisanController.getArtisans);
router.get("/:id", ArtisanController.getArtisan);

export default router;

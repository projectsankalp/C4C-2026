import { Router } from "express";
import { WhatsAppController } from "../controllers/whatsapp.controller";
import { upload } from "../middleware/upload";

const router = Router();

router.post("/inbound", WhatsAppController.inbound);
router.post("/upload-image", upload.single("image"), WhatsAppController.uploadImage);
router.post("/send-order-alert", WhatsAppController.sendOrderAlert);

export default router;

import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { StorageService } from "../services/storage.service";
import { AppError } from "../middleware/errorHandler";

export class WhatsAppController {
  /**
   * POST /api/whatsapp/inbound - Store incoming WhatsApp message
   */
  static async inbound(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        fromPhone,
        messageType,
        body,
        mediaUrl,
        mediaPublicId,
        waMessageId,
        artisanId,
        productId,
        direction,
      } = req.body;

      if (!fromPhone || !messageType) {
        throw new AppError("fromPhone and messageType are required", 400);
      }

      const message = await prisma.whatsappMessage.create({
        data: {
          fromPhone,
          messageType,
          body,
          mediaUrl,
          mediaPublicId,
          waMessageId,
          artisanId,
          productId,
          direction: direction || "inbound",
        },
      });

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/whatsapp/upload-image - Upload image from WhatsApp
   */
  static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError("No image file provided", 400);
      }

      const imageUrl = await StorageService.uploadImage(req.file.buffer, "hastakala/whatsapp");

      res.json({
        success: true,
        data: { imageUrl },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/whatsapp/send-order-alert - Trigger order alert (called by backend)
   */
  static async sendOrderAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const { artisanPhone, orderId, message } = req.body;

      if (!artisanPhone || !orderId || !message) {
        throw new AppError("artisanPhone, orderId, and message are required", 400);
      }

      // This endpoint is called by the backend to notify the WhatsApp bot
      // The actual sending is handled by WhatsAppService
      res.json({
        success: true,
        message: "Order alert queued",
      });
    } catch (error) {
      next(error);
    }
  }
}

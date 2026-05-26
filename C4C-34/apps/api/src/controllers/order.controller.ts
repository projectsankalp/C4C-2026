import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { OrderStatus } from "../types/enums";
import { WhatsAppService } from "../services/whatsapp.service";

export class OrderController {
  /**
   * POST /api/orders - Create new order
   */
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, buyerName, buyerPhone, buyerAddress, quantity = 1 } = req.body;

      if (!productId || !buyerName || !buyerPhone || !buyerAddress) {
        throw new AppError("All fields are required", 400);
      }

      // Get product
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { artisan: true },
      });

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      if (product.status !== "approved") {
        throw new AppError("Product not available for purchase", 400);
      }

      if (product.quantity < quantity) {
        throw new AppError("Insufficient stock", 400);
      }

      // Calculate total
      const totalAmount = Number(product.price) * quantity;

      // Create order
      const order = await prisma.order.create({
        data: {
          productId,
          artisanId: product.artisanId,
          buyerName,
          buyerPhone,
          buyerAddress,
          quantity,
          totalAmount,
          status: OrderStatus.NEW,
        },
        include: {
          product: true,
          artisan: true,
        },
      });

      // Update product quantity
      await prisma.product.update({
        where: { id: productId },
        data: {
          quantity: product.quantity - quantity,
          ...(product.quantity - quantity === 0 && { status: "sold_out" }),
        },
      });

      // Send WhatsApp notification to artisan
      await WhatsAppService.sendOrderAlert(
        product.artisan.phone,
        order.id,
        product.title,
        quantity,
        Number(totalAmount),
        buyerName,
      );

      res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/:id - Get order by ID
   */
  static async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          product: true,
          artisan: {
            select: {
              id: true,
              name: true,
              phone: true,
              district: true,
            },
          },
        },
      });

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}

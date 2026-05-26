import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { AppError } from "../middleware/errorHandler";

/**
 * Seller-facing endpoints for the WhatsApp bot.
 *
 *   GET  /api/sellers/:id/products       — full product list (any status)
 *   PATCH /api/products/:id/stock        — quick stock update
 */
export class SellerController {
  static async listProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await prisma.product.findMany({
        where: { artisanId: String(req.params.id) },
        orderBy: { createdAt: "desc" },
        take: 25,
      });
      res.json({ success: true, data: { products } });
    } catch (error) {
      next(error);
    }
  }

  static async updateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { quantity } = req.body || {};
      if (quantity === undefined || quantity === null) {
        throw new AppError("quantity is required", 400);
      }
      const qty = Number(quantity);
      if (!Number.isFinite(qty) || qty < 0) {
        throw new AppError("quantity must be a non-negative number", 400);
      }

      const updated = await prisma.product.update({
        where: { id: String(req.params.id) },
        data: {
          quantity: qty,
          status: qty === 0 ? "sold_out" : "approved",
        } as any,
      });
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
}

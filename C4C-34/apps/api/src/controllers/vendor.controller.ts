import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { ProductStatus, ApprovalAction } from "../types/enums";
import { WhatsAppService } from "../services/whatsapp.service";

export class VendorController {
  /**
   * GET /api/vendor/stats - Dashboard statistics
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [pendingApprovals, activeArtisans, ordersThisWeek, totalRevenue, products] =
        await Promise.all([
          prisma.product.count({
            where: { status: ProductStatus.PENDING_APPROVAL },
          }),
          prisma.artisan.count({
            where: { isVerified: true },
          }),
          prisma.order.count({
            where: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          }),
          prisma.order.aggregate({
            _sum: { totalAmount: true },
          }),
          prisma.product.findMany({
            select: { district: true },
            where: { status: ProductStatus.APPROVED },
          }),
        ]);

      const districtsCovered = new Set(products.map((p: any) => p.district).filter(Boolean)).size;

      res.json({
        success: true,
        data: {
          pendingProducts: pendingApprovals,
          approvedProducts: await prisma.product.count({
            where: { status: ProductStatus.APPROVED },
          }),
          activeArtisans,
          ordersThisWeek,
          totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
          districtsCovered,
          estimatedArtisanIncomeGain: "2.1x",
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/vendor/products/pending - Get pending products
   */
  static async getPendingProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await prisma.product.findMany({
        where: { status: ProductStatus.PENDING_APPROVAL },
        include: {
          artisan: {
            select: {
              id: true,
              name: true,
              phone: true,
              district: true,
              isVerified: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/vendor/products/:id - Update product
   */
  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const { title, description, price, quantity, category, tags } = req.body;

      const product = await prisma.product.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(price && { price }),
          ...(quantity !== undefined && { quantity }),
          ...(category && { category }),
          ...(tags && { tags }),
          updatedAt: new Date(),
        },
        include: { artisan: true },
      });

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/vendor/products/:id/approve - Approve product
   */
  static async approveProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const { reviewerName = "Karigar Sakhi", comment } = req.body;

      const product = await prisma.product.update({
        where: { id },
        data: { status: ProductStatus.APPROVED, approvedAt: new Date() },
        include: { artisan: true },
      });

      // Log approval
      await prisma.productApproval.create({
        data: {
          productId: id,
          reviewerName,
          action: ApprovalAction.APPROVED,
          comment,
        },
      });

      // Notify artisan with the public product link
      const publicUrl = `${process.env.CLIENT_PUBLIC_WEB_URL || "https://cyberkunju.com"}/products/${product.id}`;
      await WhatsAppService.sendApprovalNotification(product.artisan.phone, product.title, true, publicUrl);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/vendor/products/:id/reject - Reject product
   */
  static async rejectProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const { reason, reviewerName = "Karigar Sakhi" } = req.body;

      const product = await prisma.product.update({
        where: { id },
        data: { status: ProductStatus.REJECTED, rejectionReason: reason },
        include: { artisan: true },
      });

      // Log rejection
      await prisma.productApproval.create({
        data: {
          productId: id,
          reviewerName,
          action: ApprovalAction.REJECTED,
          reason,
        },
      });

      // Notify artisan
      await WhatsAppService.sendApprovalNotification(product.artisan.phone, product.title, false);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/vendor/orders - Get all orders
   */
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, limit = "50", offset = "0" } = req.query;

      const where: any = {};
      if (status) where.status = status;

      const orders = await prisma.order.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        take: Number(limit),
        skip: Number(offset),
      });

      const total = await prisma.order.count({ where });

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            total,
            limit: Number(limit),
            offset: Number(offset),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/vendor/orders/:id/status - Update order status
   */
  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const { status } = req.body;

      if (!status) {
        throw new AppError("Status is required", 400);
      }

      const order = await prisma.order.update({
        where: { id },
        data: { status },
        include: {
          product: true,
          artisan: true,
        },
      });

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/vendor/artisans - Get all artisans
   */
  static async getArtisans(req: Request, res: Response, next: NextFunction) {
    try {
      const { district, verified } = req.query;

      const where: any = {};
      if (district) where.district = district;
      if (verified !== undefined) where.isVerified = verified === "true";

      const artisans = await prisma.artisan.findMany({
        where,
        include: {
          _count: {
            select: {
              products: true,
              orders: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({
        success: true,
        data: artisans,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/vendor/artisans/:id/verify - Verify artisan
   */
  static async verifyArtisan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };

      const artisan = await prisma.artisan.update({
        where: { id },
        data: { isVerified: true },
      });

      res.json({
        success: true,
        data: artisan,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/vendor/artisans/:id - Update artisan details
   */
  static async updateArtisan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const { name, district, village, craftType, story, profileImageUrl } = req.body;

      const artisan = await prisma.artisan.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(district && { district }),
          ...(village && { village }),
          ...(craftType && { craftType }),
          ...(story && { story }),
          ...(profileImageUrl && { profileImageUrl }),
        },
      });

      res.json({
        success: true,
        data: artisan,
      });
    } catch (error) {
      next(error);
    }
  }
}

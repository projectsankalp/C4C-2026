import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";

export class AnalyticsController {
  /**
   * GET /api/analytics/impact - Get impact metrics
   */
  static async getImpact(req: Request, res: Response, next: NextFunction) {
    try {
      const [totalArtisans, totalProducts, totalOrders, totalRevenue, verifiedArtisans] =
        await Promise.all([
          prisma.artisan.count(),
          prisma.product.count({ where: { status: "approved" } }),
          prisma.order.count(),
          prisma.order.aggregate({ _sum: { totalAmount: true } }),
          prisma.artisan.count({ where: { isVerified: true } }),
        ]);

      // Calculate estimated middleman savings (40% of direct price)
      const directRevenue = Number(totalRevenue._sum.totalAmount || 0);
      const estimatedMiddlemanPrice = directRevenue * 0.4;
      const directIncomeGain = directRevenue - estimatedMiddlemanPrice;

      res.json({
        success: true,
        data: {
          totalArtisans,
          verifiedArtisans,
          totalProducts,
          totalOrders,
          directRevenue,
          estimatedMiddlemanPrice,
          directIncomeGain,
          incomeMultiplier:
            estimatedMiddlemanPrice > 0 ? directRevenue / estimatedMiddlemanPrice : 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/districts - Get district-wise stats
   */
  static async getDistrictStats(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await prisma.product.findMany({
        where: { status: "approved" },
        select: { district: true, price: true },
      });

      const districtMap = new Map<string, { count: number; revenue: number }>();

      products.forEach((product: any) => {
        const district = product.district || "Unknown";
        const current = districtMap.get(district) || { count: 0, revenue: 0 };
        districtMap.set(district, {
          count: current.count + 1,
          revenue: current.revenue + Number(product.price),
        });
      });

      const districts = Array.from(districtMap.entries()).map(([name, stats]) => ({
        district: name,
        productCount: stats.count,
        totalRevenue: stats.revenue,
      }));

      res.json({
        success: true,
        data: districts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/categories - Get category-wise stats
   */
  static async getCategoryStats(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await prisma.product.findMany({
        where: { status: "approved" },
        select: { category: true },
      });

      const categoryMap = new Map<string, number>();

      products.forEach((product: any) => {
        const category = product.category || "Other";
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });

      const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
        category: name,
        count,
      }));

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { normalizeIndianPhone } from "../utils/normalizePhone";

export class ArtisanController {
  /**
   * POST /api/artisans/find-or-create - Find or create artisan by phone
   */
  static async findOrCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, name, district, language, craftType } = req.body;

      if (!phone) {
        return res.status(400).json({
          success: false,
          error: { message: "Phone is required", code: "VALIDATION_ERROR" },
        });
      }

      const normalizedPhone = normalizeIndianPhone(phone);
      let artisan = await prisma.artisan.findUnique({ where: { phone: normalizedPhone } });

      if (!artisan) {
        artisan = await prisma.artisan.create({
          data: {
            phone: normalizedPhone,
            name: name || `Artisan ${normalizedPhone.slice(-4)}`,
            district: district || "Unknown",
            language: language || "kn",
            craftType: craftType || "Handmade Crafts",
          },
        });
      }

      res.status(artisan.createdAt.getTime() === artisan.updatedAt.getTime() ? 201 : 200).json({
        success: true,
        data: artisan,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/artisans/:id - Get artisan profile
   */
  static async getArtisan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };

      const artisan = await prisma.artisan.findUnique({
        where: { id },
        include: {
          products: {
            where: { status: "approved" },
            orderBy: { createdAt: "desc" },
          },
          _count: {
            select: {
              products: { where: { status: "approved" } },
              orders: true,
            },
          },
        },
      });

      if (!artisan) {
        return res.status(404).json({
          success: false,
          error: { message: "Artisan not found" },
        });
      }

      res.json({
        success: true,
        data: artisan,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/artisans - Get all verified artisans
   */
  static async getArtisans(req: Request, res: Response, next: NextFunction) {
    try {
      const { district } = req.query;

      const where: any = { isVerified: true };
      if (district) where.district = district;

      const artisans = await prisma.artisan.findMany({
        where,
        include: {
          _count: {
            select: {
              products: { where: { status: "approved" } },
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
}

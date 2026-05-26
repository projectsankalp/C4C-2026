import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { AppError } from "../middleware/errorHandler";

export class BarterController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status = "open", skill, limit = "20", offset = "0" } = req.query;
      const where: any = { status };
      if (skill) {
        where.OR = [
          { offerSkill: { contains: skill as string, mode: "insensitive" } },
          { needSkill: { contains: skill as string, mode: "insensitive" } },
        ];
      }
      const [listings, total] = await Promise.all([
        prisma.barterListing.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: Number(limit),
          skip: Number(offset),
        }),
        prisma.barterListing.count({ where }),
      ]);
      res.json({ success: true, data: { listings, total } });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { posterName, posterPhone, offerSkill, needSkill, description, district, language } =
        req.body;
      if (!posterName || !offerSkill || !needSkill)
        throw new AppError("posterName, offerSkill and needSkill are required", 400);
      const listing = await prisma.barterListing.create({
        data: {
          posterName,
          posterPhone,
          offerSkill,
          needSkill,
          description,
          district,
          language: language || "en",
        },
      });
      res.status(201).json({ success: true, data: listing });
    } catch (error) {
      next(error);
    }
  }

  static async close(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await prisma.barterListing.update({
        where: { id: String(req.params.id) },
        data: { status: "closed" },
      });
      res.json({ success: true, data: listing });
    } catch (error) {
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { AppError } from "../middleware/errorHandler";

export class ProcessStepController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = String(req.params.productId);
      const steps = await prisma.processStep.findMany({
        where: { productId },
        orderBy: { stepNumber: "asc" },
      });
      res.json({ success: true, data: steps });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = String(req.params.productId);
      const { title, description, imageUrl, videoUrl } = req.body;
      if (!title || !description) throw new AppError("title and description are required", 400);
      const count = await prisma.processStep.count({ where: { productId } });
      const step = await prisma.processStep.create({
        data: {
          productId,
          stepNumber: count + 1,
          title,
          description,
          imageUrl,
          videoUrl,
        },
      });
      res.status(201).json({ success: true, data: step });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.processStep.delete({ where: { id: String(req.params.stepId) } });
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";

export class DemoController {
  /**
   * POST /api/demo/reset - Reset demo state for rehearsal.
   */
  static async reset(req: Request, res: Response, next: NextFunction) {
    try {
      const demoApi = (prisma as any).demo;
      if (!demoApi?.reset) {
        return res.status(501).json({
          success: false,
          error: {
            message: "Demo reset is not supported by this database adapter",
            code: "DEMO_RESET_UNAVAILABLE",
          },
        });
      }

      const result = await demoApi.reset();

      res.json({
        success: true,
        message: "Demo state reset",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

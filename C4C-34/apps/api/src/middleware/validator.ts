import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";

export const validate = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Validation failed",
            details: error.issues.map((err) => ({
              path: err.path.join("."),
              message: err.message,
            })),
          },
        });
      }
      next(error);
    }
  };
};

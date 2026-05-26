import { Request, Response, NextFunction } from "express";

export function demoAuth(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.DEMO_API_KEY;

  if (!expected) return next();

  if (req.header("x-demo-api-key") !== expected) {
    return res.status(401).json({
      success: false,
      error: {
        message: "Unauthorized demo request",
        code: "UNAUTHORIZED",
      },
    });
  }

  next();
}

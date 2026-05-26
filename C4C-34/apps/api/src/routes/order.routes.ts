import { Router, Request, Response, NextFunction } from "express";
import { OrderController } from "../controllers/order.controller";

const router = Router();

// List orders (filter by buyerPhone or artisanId)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = (await import("../config/database")).default;
    const { buyerPhone, artisanId, limit = "20" } = req.query;
    const where: any = {};
    if (buyerPhone) where.buyerPhone = String(buyerPhone);
    if (artisanId) where.artisanId = String(artisanId);
    const orders = await prisma.order.findMany({
      where,
      include: { product: true, artisan: true },
      orderBy: { createdAt: "desc" },
      take: Number(limit),
    });
    res.json({ success: true, data: { orders } });
  } catch (err) { next(err); }
});

router.post("/", OrderController.createOrder);
router.get("/:id", OrderController.getOrder);

export default router;

import { Router, Request, Response, NextFunction } from "express";
import { ProductController } from "../controllers/product.controller";
import { SellerController } from "../controllers/seller.controller";

const router = Router();

// Trending products (most ordered)
router.get("/trending", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = (await import("../config/database")).default;
    const orders = await prisma.order.findMany({ include: { product: true } });
    // Count orders per product
    const countMap: Record<string, { count: number; product: any }> = {};
    for (const o of orders) {
      const pid = (o as any).productId;
      if (!countMap[pid]) countMap[pid] = { count: 0, product: (o as any).product };
      countMap[pid].count += Number((o as any).quantity ?? 1);
    }
    const trending = Object.values(countMap)
      .filter(e => e.product)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(e => ({
        id: e.product.id,
        title: e.product.title,
        price: e.product.price,
        category: e.product.category,
        district: e.product.district,
        imageUrl: e.product.imageUrl,
        orderCount: e.count,
      }));
    res.json({ success: true, data: { trending } });
  } catch (error) { next(error); }
});

// Public routes
router.get("/", ProductController.getProducts);
router.get("/:id", ProductController.getProduct);

// WhatsApp draft creation
router.post("/draft", ProductController.createDraft);

// Quick stock-update (used by seller's "My Products" flow on WhatsApp)
router.patch("/:id/stock", SellerController.updateStock);

// Delete product (used by seller's "My Products" flow on WhatsApp)
router.delete("/:id", ProductController.deleteProduct);

export default router;

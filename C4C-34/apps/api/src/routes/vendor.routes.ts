import { Router, Request, Response, NextFunction } from "express";
import { VendorController } from "../controllers/vendor.controller";

const router = Router();

// Dashboard stats
router.get("/stats", VendorController.getStats);

// Earnings summary for a seller
router.get("/earnings", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { artisanId, phone } = req.query;
    if (!artisanId && !phone) return res.status(400).json({ success: false, error: { message: "artisanId or phone required" } });
    const prisma = (await import("../config/database")).default;
    let where: any = { paymentStatus: "paid" };
    if (artisanId) {
      where.artisanId = String(artisanId);
    } else {
      const artisan = await prisma.artisan.findUnique({ where: { phone: String(phone) } });
      if (!artisan) return res.json({ success: true, data: { totalEarnings: 0, monthEarnings: 0, totalOrders: 0, monthOrders: 0, recentOrders: [] } });
      where.artisanId = artisan.id;
    }
    const orders = await prisma.order.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    const totalEarnings = orders.reduce((s: number, o: any) => s + Number(o.totalAmount), 0);
    const thisMonth = orders.filter((o: any) => {
      const d = new Date(o.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthEarnings = thisMonth.reduce((s: number, o: any) => s + Number(o.totalAmount), 0);
    res.json({
      success: true,
      data: {
        totalEarnings,
        monthEarnings,
        totalOrders: orders.length,
        monthOrders: thisMonth.length,
        recentOrders: orders.slice(0, 5).map((o: any) => ({
          id: o.id,
          product: o.product?.title ?? "Product",
          amount: o.totalAmount,
          status: o.status,
          date: o.createdAt,
        })),
      },
    });
  } catch (error) { next(error); }
});

// Product management
router.get("/products/pending", VendorController.getPendingProducts);
router.patch("/products/:id", VendorController.updateProduct);
router.patch("/products/:id/approve", VendorController.approveProduct);
router.patch("/products/:id/reject", VendorController.rejectProduct);

// Order management
router.get("/orders", VendorController.getOrders);
router.patch("/orders/:id/status", VendorController.updateOrderStatus);

// Artisan management
router.get("/artisans", VendorController.getArtisans);
router.patch("/artisans/:id", VendorController.updateArtisan);
router.patch("/artisans/:id/verify", VendorController.verifyArtisan);

export default router;

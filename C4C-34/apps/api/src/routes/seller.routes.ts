import { Router, Request, Response, NextFunction } from "express";
import { SellerController } from "../controllers/seller.controller";
import { authRequired } from "../middleware/auth";

const router = Router();

// Session verify — returns seller info from token
router.get("/me", authRequired, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, email: phone, role } = req.user!;
    if (role !== "seller") {
      return res.status(403).json({ success: false, error: { message: "Not a seller session" } });
    }
    // phone is stored in the email field of the token for OTP-based login
    res.json({
      success: true,
      data: {
        phone,
        artisanId: userId !== phone ? userId : null,
        name: null,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/sellers/by-phone/:phone/products
 * WhatsApp-bot helper: look up the seller's Artisan record by their WhatsApp
 * phone (digits only) and return all of their products in one call.
 *
 * The bot used to call /api/users/by-phone (which returned a User row, not
 * an Artisan) and tried to derive an artisanId from it — that always
 * failed and "My Products" was always empty. This endpoint fixes that.
 */
router.get(
  "/by-phone/:phone/products",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const prisma = (await import("../config/database")).default;
      const { normalizeIndianPhone } = await import("../utils/normalizePhone");
      const phone = normalizeIndianPhone(String(req.params.phone || ""));
      if (!phone) {
        return res.status(400).json({
          success: false,
          error: { message: "phone is required" },
        });
      }
      const artisan = await prisma.artisan.findUnique({
        where: { phone },
        include: {
          products: {
            orderBy: { createdAt: "desc" },
            take: 50,
          },
        },
      });
      if (!artisan) {
        return res.json({
          success: true,
          data: { artisan: null, products: [] },
        });
      }
      const products = (artisan.products || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        quantity: p.quantity,
        category: p.category,
        status: p.status,
        imageUrl: p.imageUrl,
        createdAt: p.createdAt,
      }));
      res.json({
        success: true,
        data: {
          artisan: {
            id: artisan.id,
            name: artisan.name,
            phone: artisan.phone,
            district: artisan.district,
            isVerified: artisan.isVerified,
          },
          products,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/:id/products", SellerController.listProducts);

export default router;

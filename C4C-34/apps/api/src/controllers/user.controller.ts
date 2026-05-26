import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { normalizeIndianPhone } from "../utils/normalizePhone";
import { AppError } from "../middleware/errorHandler";
import { userStore } from "../services/userStore.service";

/**
 * Phone-keyed user profile used by the WhatsApp bot.
 *
 * We store conversational profile facts (language, role(s), name, district,
 * craft, interests, onboarding flag) in a small in-memory + persisted record
 * keyed by phone number — independent of the existing artisan/buyer data
 * models so:
 *   - Buyers don't need an artisan row
 *   - A single phone can be both buyer + seller (multiple roles)
 *   - First-contact lookups never throw on missing artisan
 */
export class UserController {
  /**
   * GET /api/users/by-phone/:phone
   */
  static async getByPhone(req: Request, res: Response, next: NextFunction) {
    try {
      const phone = normalizeIndianPhone(String(req.params.phone));
      if (!phone) throw new AppError("Phone is required", 400);

      const profile = await userStore.get(phone);
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: { message: "No profile for this phone yet", code: "NOT_FOUND" },
        });
      }

      // If they have an artisan record, surface the artisan id too so the
      // bot can list /api/sellers/:id/products and /api/vendor/orders.
      let artisanId: string | undefined;
      if (profile.role === "seller" || (profile.roles ?? []).includes("seller")) {
        const artisan = await prisma.artisan.findUnique({ where: { phone } });
        if (artisan) artisanId = artisan.id;
      }

      res.json({
        success: true,
        data: { ...profile, phone, artisanId },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/by-phone/:phone
   */
  static async patchByPhone(req: Request, res: Response, next: NextFunction) {
    try {
      const phone = normalizeIndianPhone(String(req.params.phone));
      if (!phone) throw new AppError("Phone is required", 400);

      const updated = await userStore.upsert(phone, req.body || {});

      // If the user is a seller, mirror the basics into the canonical
      // artisan table so existing endpoints (/api/products, /api/vendor/*)
      // pick them up automatically.
      if (updated.role === "seller" || (updated.roles ?? []).includes("seller")) {
        const existing = await prisma.artisan.findUnique({ where: { phone } });
        if (existing) {
          await prisma.artisan.update({
            where: { id: existing.id },
            data: {
              name: updated.name ?? existing.name,
              district: updated.district ?? existing.district,
              language: updated.language ?? existing.language,
              craftType: updated.craftCategory ?? existing.craftType,
            },
          });
        } else {
          await prisma.artisan.create({
            data: {
              phone,
              name: updated.name || `Artisan ${phone.slice(-4)}`,
              district: updated.district || "Unknown",
              language: updated.language || "en",
              craftType: updated.craftCategory || "Handmade Crafts",
              isVerified: true, // demo: auto-verify so request-matching works
            },
          });
        }
      }

      const artisan = await prisma.artisan.findUnique({ where: { phone } });
      res.json({
        success: true,
        data: { ...updated, phone, artisanId: artisan?.id },
      });
    } catch (error) {
      next(error);
    }
  }
}

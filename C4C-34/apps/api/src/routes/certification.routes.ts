import { Router, Request, Response, NextFunction } from "express";
import { userStore } from "../services/userStore.service";
import { normalizeIndianPhone } from "../utils/normalizePhone";
import { AppError } from "../middleware/errorHandler";

const router = Router();

/**
 * POST /api/certify
 * Mark a seller as certified (called by admin or community webhook).
 * Also triggers a WhatsApp notification via the bot's /certify endpoint.
 *
 * Body: { phone: string, promoCode?: string }
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, promoCode } = req.body || {};
    if (!phone) throw new AppError("phone is required", 400);

    const normalized = normalizeIndianPhone(String(phone));

    // Update the user store
    await userStore.upsert(normalized, {
      isCertified: true,
      promoCode: promoCode || "HK-CERT-ADMIN",
    });

    // Notify the bot to send the unlock message to the seller
    const botUrl = process.env.WA_BOT_URL || process.env.WHATSAPP_BOT_URL;
    const botSecret = process.env.WHATSAPP_BOT_SECRET || "";

    let botNotified = false;
    if (botUrl) {
      try {
        const resp = await fetch(`${botUrl}/certify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-bot-secret": botSecret,
          },
          body: JSON.stringify({ phone: normalized }),
        });
        botNotified = resp.ok;
      } catch (err) {
        console.warn("[certify] Could not notify bot:", err);
      }
    }

    res.json({
      success: true,
      data: {
        phone: normalized,
        isCertified: true,
        botNotified,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/certify/status/:phone
 * Check certification status for a phone number.
 */
router.get("/status/:phone", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const normalized = normalizeIndianPhone(String(req.params.phone));
    const profile = await userStore.get(normalized);
    res.json({
      success: true,
      data: {
        phone: normalized,
        isCertified: profile?.isCertified ?? false,
        promoCode: profile?.promoCode,
        name: profile?.name,
        role: profile?.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

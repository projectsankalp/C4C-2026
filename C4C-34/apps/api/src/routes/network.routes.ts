import { Router, Request, Response } from "express";
import { WhatsAppService } from "../services/whatsapp.service";

/**
 * Network / community-collaboration endpoints.
 */

const router = Router();

router.get("/communities", (_req: Request, res: Response) => {
  res.json({ success: true, data: { communities: [] } });
});

router.get("/communities/:id", (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { message: "Community network not yet wired to the database" },
  });
});

router.get("/requests", (_req: Request, res: Response) => {
  res.json({ success: true, data: { requests: [] } });
});

/**
 * POST /api/network/requests
 * Buyer posts a talent/craft request. Matching artisans get a WhatsApp ping.
 *
 * Body: { buyerName, buyerPhone, craftType, description }
 */
router.post("/requests", async (req: Request, res: Response) => {
  try {
    const { buyerName, buyerPhone, craftType, description } = req.body || {};
    if (!buyerName || !craftType || !description) {
      return res.status(400).json({ success: false, error: { message: "buyerName, craftType, and description are required" } });
    }

    const prisma = (await import("../config/database")).default;

    // Store as a barter_listing entry (repurposed: offer_skill = "Buyer request", need_skill = craftType)
    const listing = await prisma.barterListing.create({
      data: {
        posterName: buyerName,
        posterPhone: buyerPhone || null,
        offerSkill: "Buyer request",
        needSkill: craftType,
        description,
        status: "open",
      },
    });

    // Find artisans whose craftType matches (case-insensitive contains)
    const artisans = await prisma.artisan.findMany({
      where: {
        craftType: { contains: craftType, mode: "insensitive" },
        isVerified: true,
        phone: { not: "" },
      },
      select: { phone: true, name: true, language: true },
      take: 20,
    });

    // Ping each matched artisan via bot
    const message = `🎨 *HastKala — Talent Request*\n\nSomeone needs *${craftType}* work!\n\n📝 "${description}"\n\n👤 Posted by: ${buyerName}${buyerPhone ? `\n📞 Contact: ${buyerPhone}` : ""}\n\n_Reply MENU to see your dashboard or open HastKala to respond._`;

    const notified: string[] = [];
    await Promise.allSettled(
      artisans.map(async (a: { phone: string; name: string | null }) => {
        await WhatsAppService.sendBroadcastMessage(a.phone, message);
        notified.push(a.phone);
      })
    );

    res.json({
      success: true,
      data: {
        listingId: listing.id,
        craftType,
        artisansNotified: notified.length,
      },
    });
  } catch (error) {
    console.error("[network/requests]", error);
    res.status(500).json({ success: false, error: { message: "Failed to process talent request" } });
  }
});

router.patch("/requests/:id", (_req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: { message: "Collaboration requests not yet wired to the database" },
  });
});

export default router;

import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { AppError } from "../middleware/errorHandler";

const CERT_THRESHOLD = 150; // points needed for certification

export class CommunityController {
  static async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const [total, certified, sellers] = await Promise.all([
        prisma.communityMember.count({}),
        prisma.communityMember.count({ where: { isCertified: true } }),
        prisma.communityMember.count({ where: { stage: "seller" } }),
      ]);
      res.json({
        success: true,
        data: { totalMembers: total, certified, activeSellers: sellers, threshold: CERT_THRESHOLD },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/community/members?status=pending|certified|all
   * Powers the admin Members tab. Defaults to "pending" so the most useful
   * view (people waiting for approval) is the cheap path.
   */
  static async listMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const status = String(req.query.status ?? "pending").toLowerCase();
      const where =
        status === "certified"
          ? { isCertified: true }
          : status === "all"
          ? {}
          : { isCertified: false }; // pending

      const members = await prisma.communityMember.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 200,
      });

      // Best-effort: tag members whose phone matches an artisan record so the
      // admin can see "this came in via WhatsApp" at a glance.
      const phones = members
        .map((m: { phone: string | null }) => m.phone)
        .filter((p: string | null): p is string => Boolean(p));
      const artisans = phones.length
        ? await prisma.artisan.findMany({ where: { phone: { in: phones } }, select: { phone: true } })
        : [];
      const fromBot = new Set(artisans.map((a: { phone: string }) => a.phone));

      const data = members.map((m: { phone: string | null }) => ({
        ...m,
        source: m.phone && fromBot.has(m.phone) ? "whatsapp_profile" : "manual",
      }));

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async join(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, phone, location, skills, language } = req.body;
      if (!name) throw new AppError("name is required", 400);

      // Check if already a member
      if (phone) {
        const existing = await prisma.communityMember.findUnique({ where: { phone } });
        if (existing) return res.json({ success: true, data: existing, alreadyMember: true });
      }

      const member = await prisma.communityMember.create({
        data: { name, phone, location, skills, language: language || "en", stage: "learn" },
      });
      res.status(201).json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  }

  static async modules(req: Request, res: Response, next: NextFunction) {
    try {
      const modules = await prisma.learningModule.findMany({ orderBy: { orderIndex: "asc" } });
      res.json({ success: true, data: modules });
    } catch (error) {
      next(error);
    }
  }

  static async completeModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId, moduleId } = req.body;
      if (!memberId || !moduleId) throw new AppError("memberId and moduleId are required", 400);

      const mod = await prisma.learningModule.findUnique({ where: { id: moduleId } });
      if (!mod) throw new AppError("Module not found", 404);

      // Upsert completion (idempotent)
      await prisma.moduleCompletion.upsert({
        where: { memberId_moduleId: { memberId, moduleId } },
        create: { memberId, moduleId },
        update: {},
      });

      // Add points
      const member = await prisma.communityMember.update({
        where: { id: memberId },
        data: { points: { increment: mod.pointsReward }, stage: "contribute" },
      });

      // Auto-certify if threshold reached
      if (!member.isCertified && member.points >= CERT_THRESHOLD) {
        await CommunityController._issueCert(memberId);
      }

      res.json({ success: true, data: { points: member.points, certified: member.isCertified } });
    } catch (error) {
      next(error);
    }
  }

  static async certify(req: Request, res: Response, next: NextFunction) {
    try {
      const memberId = req.params.memberId as string;
      const cert = await CommunityController._issueCert(memberId);
      res.json({ success: true, data: cert });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/community/reject/:memberId
   * Admin marks a pending community member as rejected. We DON'T delete the
   * row (so we can audit later); we set stage="rejected" and notify the bot
   * to send a polite decline message + reset the seller's session.
   */
  static async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const memberId = req.params.memberId as string;
      const reason: string | undefined = req.body?.reason;

      const member = await prisma.communityMember.findUnique({ where: { id: memberId } });
      if (!member) throw new AppError("Member not found", 404);
      if (member.isCertified) {
        throw new AppError("Member is already certified; cannot reject", 400);
      }

      const updated = await prisma.communityMember.update({
        where: { id: memberId },
        data: { stage: "rejected" },
      });

      // Best-effort: tell the bot to message the seller. Bot exposes /reject
      // (added alongside this endpoint) which sends the decline copy and
      // resets the conversation state.
      if (member.phone) {
        const botUrl = process.env.WA_BOT_URL || process.env.WHATSAPP_BOT_URL;
        const botSecret = process.env.WHATSAPP_BOT_SECRET || "";
        if (botUrl) {
          try {
            await fetch(`${botUrl}/reject`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-bot-secret": botSecret,
              },
              body: JSON.stringify({ phone: member.phone, reason }),
            });
          } catch (err) {
            console.warn("[community.reject] Could not notify bot:", err);
          }
        }
      }

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async getMember(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await prisma.communityMember.findUnique({
        where: { id: String(req.params.memberId) },
      });
      if (!member) throw new AppError("Member not found", 404);
      res.json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  }

  private static async _issueCert(memberId: string) {
    const certNumber = `HK-${Date.now().toString(36).toUpperCase()}`;
    const member = await prisma.communityMember.findUnique({ where: { id: memberId } });

    const [cert] = await Promise.all([
      prisma.certification.create({ data: { memberId, certNumber } }),
      prisma.communityMember.update({
        where: { id: memberId },
        data: { isCertified: true, certifiedAt: new Date(), stage: "seller" },
      }),
    ]);

    // Link to artisan table — when certified, mark their artisan record as verified
    if (member?.phone) {
      const artisan = await prisma.artisan.findUnique({ where: { phone: member.phone } });
      if (artisan) {
        await prisma.artisan.update({
          where: { id: artisan.id },
          data: { isVerified: true, verificationStatus: "verified" },
        });
      }
    }

    // Notify the WhatsApp bot so the seller gets the unlock message + cert PDF.
    // Best-effort: if the bot is unreachable we still consider certification
    // successful — admin can re-trigger if needed.
    if (member?.phone) {
      const botUrl = process.env.WA_BOT_URL || process.env.WHATSAPP_BOT_URL;
      const botSecret = process.env.WHATSAPP_BOT_SECRET || "";
      if (botUrl) {
        try {
          await fetch(`${botUrl}/certify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-bot-secret": botSecret,
            },
            body: JSON.stringify({ phone: member.phone }),
          });
        } catch (err) {
          console.warn("[community.certify] Could not notify bot:", err);
        }
      }
    }

    return cert;
  }
}

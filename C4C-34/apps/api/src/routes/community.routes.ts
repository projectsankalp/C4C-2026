import { Router } from "express";
import { CommunityController } from "../controllers/community.controller";

const router = Router();
router.get("/stats", CommunityController.stats);
// NOTE: list route MUST come before /:memberId, otherwise Express treats
// "members" as a path parameter and the /members/:memberId handler runs.
router.get("/members", (_req, res, next) => { res.setHeader("Cache-Control", "no-store"); next(); }, CommunityController.listMembers);
router.get("/members/:memberId", CommunityController.getMember);
router.post("/join", CommunityController.join);
router.get("/modules", CommunityController.modules);
router.post("/complete-module", CommunityController.completeModule);
router.post("/certify/:memberId", CommunityController.certify);
router.post("/reject/:memberId", CommunityController.reject);

// POST /api/community/reset-phone — called by bot on RESET command so the
// seller shows up as pending again in /admin on next onboarding.
router.post("/reset-phone", async (req, res, next) => {
  try {
    const prisma = (await import("../config/database")).default;
    const { normalizeIndianPhone } = await import("../utils/normalizePhone");
    const phone = normalizeIndianPhone(String(req.body?.phone || ""));
    if (!phone) return res.status(400).json({ success: false, error: { message: "phone required" } });
    await prisma.communityMember.updateMany({
      where: { phone },
      data: { isCertified: false, certifiedAt: null, stage: "learn", points: 0 },
    });
    res.json({ success: true });
  } catch (e) { next(e); }
});
export default router;

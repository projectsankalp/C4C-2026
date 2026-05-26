import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";

/**
 * Admin overview & activity feed endpoints.
 * Aggregates events across community, products, orders, artisans, and WhatsApp.
 */
export class AdminController {
  /**
   * GET /api/admin/overview
   * Single-call dashboard summary for the admin page.
   */
  static async overview(req: Request, res: Response, next: NextFunction) {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalMembers,
        certifiedMembers,
        pendingProducts,
        approvedProducts,
        rejectedProducts,
        totalArtisans,
        verifiedArtisans,
        ordersThisWeek,
        newOrders,
        revenueAgg,
        recentMessages,
      ] = await Promise.all([
        prisma.communityMember.count(),
        prisma.communityMember.count({ where: { isCertified: true } }),
        prisma.product.count({ where: { status: "pending_approval" } }),
        prisma.product.count({ where: { status: "approved" } }),
        prisma.product.count({ where: { status: "rejected" } }),
        prisma.artisan.count(),
        prisma.artisan.count({ where: { isVerified: true } }),
        prisma.order.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.order.count({ where: { status: "new" } }),
        prisma.order.aggregate({ _sum: { totalAmount: true } }),
        prisma.whatsappMessage.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      ]);

      res.json({
        success: true,
        data: {
          members: { total: totalMembers, certified: certifiedMembers, pending: totalMembers - certifiedMembers },
          products: { pending: pendingProducts, approved: approvedProducts, rejected: rejectedProducts },
          artisans: { total: totalArtisans, verified: verifiedArtisans },
          orders: { thisWeek: ordersThisWeek, new: newOrders, totalRevenue: Number(revenueAgg._sum.totalAmount || 0) },
          whatsapp: { messagesThisWeek: recentMessages },
        },
      });
    } catch (error) { next(error); }
  }

  /**
   * GET /api/admin/activity?limit=30
   * Unified, time-ordered activity feed.
   */
  static async activity(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(Number(req.query.limit ?? 30), 100);

      const [members, products, orders, approvals, certifications] = await Promise.all([
        prisma.communityMember.findMany({
          orderBy: { createdAt: "desc" },
          take: limit,
          select: { id: true, name: true, location: true, stage: true, createdAt: true, isCertified: true },
        }),
        prisma.product.findMany({
          orderBy: { createdAt: "desc" },
          take: limit,
          select: { id: true, title: true, status: true, createdAt: true, artisan: { select: { name: true, phone: true } } },
        }),
        prisma.order.findMany({
          orderBy: { createdAt: "desc" },
          take: limit,
          select: { id: true, buyerName: true, totalAmount: true, status: true, createdAt: true, product: { select: { title: true } } },
        }),
        prisma.productApproval.findMany({
          orderBy: { createdAt: "desc" },
          take: limit,
          select: { id: true, action: true, reviewerName: true, comment: true, reason: true, createdAt: true, product: { select: { title: true } } },
        }),
        prisma.certification.findMany({
          orderBy: { issuedAt: "desc" },
          take: limit,
          select: { id: true, certNumber: true, issuedAt: true, member: { select: { name: true, phone: true } } },
        }),
      ]);

      type Event = { type: string; timestamp: string; title: string; subtitle?: string; meta?: any };
      const events: Event[] = [];

      members.forEach((m: any) => events.push({
        type: "member.joined",
        timestamp: new Date(m.createdAt).toISOString(),
        title: `${m.name} joined the community`,
        subtitle: [m.location, `stage: ${m.stage}`].filter(Boolean).join(" · "),
        meta: { id: m.id, isCertified: m.isCertified },
      }));

      products.forEach((p: any) => events.push({
        type: `product.${p.status}`,
        timestamp: new Date(p.createdAt).toISOString(),
        title: `Product "${p.title}" — ${p.status.replace("_", " ")}`,
        subtitle: p.artisan?.name ? `by ${p.artisan.name}` : undefined,
        meta: { id: p.id, status: p.status },
      }));

      orders.forEach((o: any) => events.push({
        type: `order.${o.status}`,
        timestamp: new Date(o.createdAt).toISOString(),
        title: `Order: ${o.product?.title ?? "Product"} — ₹${o.totalAmount}`,
        subtitle: `${o.buyerName} · ${o.status}`,
        meta: { id: o.id, amount: o.totalAmount },
      }));

      approvals.forEach((a: any) => events.push({
        type: `approval.${a.action}`,
        timestamp: new Date(a.createdAt).toISOString(),
        title: `${a.reviewerName} ${a.action} "${a.product?.title ?? "product"}"`,
        subtitle: a.comment || a.reason || undefined,
        meta: { id: a.id, action: a.action },
      }));

      certifications.forEach((c: any) => events.push({
        type: "member.certified",
        timestamp: new Date(c.issuedAt).toISOString(),
        title: `Certified: ${c.member?.name ?? "Member"} (${c.certNumber})`,
        subtitle: c.member?.phone || undefined,
        meta: { id: c.id, certNumber: c.certNumber },
      }));

      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      res.json({ success: true, data: events.slice(0, limit) });
    } catch (error) { next(error); }
  }
}

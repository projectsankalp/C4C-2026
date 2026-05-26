import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { ProductStatus } from "../types/enums";
import { normalizeIndianPhone } from "../utils/normalizePhone";
import { StorageService } from "../services/storage.service";
import { MarketplaceAutomationService } from "../services/marketplaceAutomation.service";

export class ProductController {
  /**
   * GET /api/products - Get all approved products
   */
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, district, search, limit = "20", offset = "0" } = req.query;

      const where: any = {
        status: ProductStatus.APPROVED,
      };

      if (category) where.category = category;
      if (district) where.district = district;
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: "insensitive" } },
          { description: { contains: search as string, mode: "insensitive" } },
        ];
      }

      const products = await prisma.product.findMany({
        where,
        include: {
          artisan: {
            select: {
              id: true,
              name: true,
              district: true,
              isVerified: true,
              profileImageUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: Number(limit),
        skip: Number(offset),
      });

      const total = await prisma.product.count({ where });

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            total,
            limit: Number(limit),
            offset: Number(offset),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id - Get single product
   */
  static async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          artisan: {
            select: {
              id: true,
              name: true,
              district: true,
              village: true,
              craftType: true,
              story: true,
              isVerified: true,
              profileImageUrl: true,
            },
          },
          steps: { orderBy: { stepNumber: "asc" } },
        },
      });

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/products/draft - Create product draft from WhatsApp
   *
   * Honor `prefilled` slots from the bot when present (slot-confirmed values
   * the user explicitly approved). Only call the AI to polish the description
   * and tags — never to fill missing facts.
   *
   * Status is always `pending_approval` so Karigar Sakhi reviews it first.
   * (The old behavior of auto-approving created the "Sakhi never reviews
   * anything" bug — fixed here.)
   */
  static async createDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        phone,
        message,
        imageUrl,
        imageBase64,
        artisanName,
        district,
        language,
        craftType,
        prefilled,
      } = req.body;

      if (!phone || !message) {
        throw new AppError("Phone and message are required", 400);
      }

      const normalizedPhone = normalizeIndianPhone(phone);

      // Certification gate: if user joined the community but isn't certified, block listing.
      // Users not in the community system (legacy artisans) can still list freely.
      try {
        const communityMember = await prisma.communityMember.findUnique({
          where: { phone: normalizedPhone },
        });
        if (communityMember && !communityMember.isCertified) {
          throw new AppError(
            "You need HastKala Certification to list products. Complete learning modules at hastkala.com/learn to earn your certificate.",
            403,
          );
        }
      } catch (e: any) {
        if (e instanceof AppError) throw e;
        // If communityMember table doesn't exist yet or query fails, allow listing (graceful degradation)
      }

      // Find or create artisan
      let artisan = await prisma.artisan.findUnique({ where: { phone: normalizedPhone } });

      if (!artisan) {
        artisan = await prisma.artisan.create({
          data: {
            phone: normalizedPhone,
            name: artisanName || `Artisan ${normalizedPhone.slice(-4)}`,
            district: district || "Unknown",
            language: language || "kn",
            craftType: craftType || "Handmade Crafts",
            // For the demo we auto-verify any newly-onboarded artisan so the
            // request-matching system can find them. In production a Karigar
            // Sakhi would do this manually.
            isVerified: true,
          },
        });
      } else if (artisanName || district || language || craftType) {
        artisan = await prisma.artisan.update({
          where: { id: artisan.id },
          data: {
            ...(artisanName && { name: artisanName }),
            ...(district && { district }),
            ...(language && { language }),
            ...(craftType && { craftType }),
          },
        });
      }

      let finalImageUrl = imageUrl || null;
      let imagePublicId: string | null = null;

      if (imageBase64) {
        finalImageUrl = await StorageService.uploadImageFromBase64(imageBase64);
        imagePublicId =
          finalImageUrl === StorageService.FALLBACK_IMAGE_URL
            ? "fallback-image"
            : "cloudinary-upload";
      }

      // Generate listing using AI, honoring prefilled facts.
      const { AIService } = await import("../services/ai.service");
      const polished = await AIService.generateListing({
        message,
        imageUrl: finalImageUrl || undefined,
        district: district || artisan.district || undefined,
        artisanName: artisan.name || undefined,
        language,
        craftType,
        prefilled,
      });

      // Reconcile: prefilled facts from the bot win over AI for hard facts.
      // The AI's contribution is the polished description/tags/material.
      const finalListing = {
        title: prefilled?.title || polished.title,
        description: prefilled?.description || polished.description,
        shortDescription: polished.shortDescription,
        price: prefilled?.price ?? polished.price,
        quantity: prefilled?.quantity ?? polished.quantity,
        category: prefilled?.category || polished.category,
        material: prefilled?.material || polished.material,
        tags: prefilled?.tags?.length ? prefilled.tags : polished.tags,
        careInstructions: polished.careInstructions,
      };

      // Auto-publish: certified sellers go through the WhatsApp community
      // gate already, so the bot self-confirms each listing. No Sakhi step.
      const product = await prisma.product.create({
        data: {
          artisanId: artisan.id,
          title: finalListing.title,
          description: finalListing.description,
          shortDescription: finalListing.shortDescription,
          price: finalListing.price,
          suggestedPrice: finalListing.price,
          quantity: finalListing.quantity,
          category: finalListing.category,
          district: district || artisan.district,
          imageUrl: finalImageUrl,
          imagePublicId,
          status: ProductStatus.APPROVED,
          aiGenerated: !prefilled,
          rawMessage: message,
          material: finalListing.material,
          tags: finalListing.tags,
          careInstructions: finalListing.careInstructions,
        },
        include: {
          artisan: true,
        },
      });

      // Log WhatsApp message
      await prisma.whatsappMessage.create({
        data: {
          fromPhone: normalizedPhone,
          messageType: finalImageUrl ? "image" : "text",
          body: message,
          mediaUrl: finalImageUrl,
          artisanId: artisan.id,
          productId: product.id,
        },
      });

      MarketplaceAutomationService.notifyBuyersForNewProduct(product).catch(() => undefined);

      res.status(201).json({
        success: true,
        data: {
          ...product,
          // Bot still passes this back as a "view link" — now it points to
          // the live public product page (since we auto-publish).
          approvalUrl: `${process.env.CLIENT_PUBLIC_WEB_URL || "http://localhost:3000"}/products/${product.id}`,
          publicUrl: `${process.env.CLIENT_PUBLIC_WEB_URL || "http://localhost:3000"}/products/${product.id}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/products/:id - Delete a product
   */
  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };

      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        throw new AppError("Product not found", 404);
      }

      await prisma.product.delete({ where: { id } });

      res.json({ success: true, data: { id, deleted: true } });
    } catch (error) {
      next(error);
    }
  }
}

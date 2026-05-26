import { Request, Response, NextFunction } from "express";
import { requestStore } from "../services/requestStore.service";
import { userStore } from "../services/userStore.service";
import { normalizeIndianPhone } from "../utils/normalizePhone";
import { AppError } from "../middleware/errorHandler";
import { WhatsAppService } from "../services/whatsapp.service";
import { MarketplaceAutomationService } from "../services/marketplaceAutomation.service";

export class RequestController {
  /**
   * POST /api/requests
   * Buyer creates a new bulk/custom-order request.
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        buyerPhone,
        brief,
        category,
        quantity,
        budgetMin,
        budgetMax,
        deliveryDate,
        location,
      } = req.body || {};

      if (!buyerPhone || !brief) {
        throw new AppError("buyerPhone and brief are required", 400);
      }

      const phone = normalizeIndianPhone(buyerPhone);
      const buyerProfile = await userStore.get(phone);

      const created = await requestStore.createRequest({
        buyerPhone: phone,
        buyerName: buyerProfile?.name,
        brief,
        category: category ?? autoCategorize(brief),
        quantity,
        budgetMin,
        budgetMax,
        deliveryDate,
        location,
      });

      MarketplaceAutomationService.notifySellersForBuyerRequest(created).catch(() => undefined);

      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/requests
   *   - ?buyerPhone=...        list a buyer's requests
   *   - ?matchSellerPhone=...  list open requests that match a seller
   */
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.query.buyerPhone) {
        const phone = normalizeIndianPhone(req.query.buyerPhone as string);
        const list = await requestStore.listByBuyer(phone);
        return res.json({ success: true, data: list });
      }
      if (req.query.matchSellerPhone) {
        const phone = normalizeIndianPhone(req.query.matchSellerPhone as string);
        const list = await requestStore.listForSeller(phone);
        return res.json({ success: true, data: list });
      }
      // No filter: empty for safety (don't expose all buyer requests).
      return res.json({ success: true, data: [] });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/requests/:id
   */
  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await requestStore.getRequest(String(req.params.id));
      if (!record) throw new AppError("Request not found", 404);
      res.json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/requests/:id/quotes
   */
  static async submitQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = String(req.params.id);
      const request = await requestStore.getRequest(requestId);
      if (!request) throw new AppError("Request not found", 404);
      if (request.status !== "open") {
        throw new AppError("This request is no longer accepting quotes", 400);
      }

      const { sellerPhone, price, deliveryNote, quoteNote } = req.body || {};
      if (!sellerPhone || !price) {
        throw new AppError("sellerPhone and price are required", 400);
      }
      const phone = normalizeIndianPhone(sellerPhone);
      const sellerProfile = await userStore.get(phone);

      const quote = await requestStore.createQuote({
        requestId,
        sellerPhone: phone,
        sellerName: sellerProfile?.name || `Seller ${phone.slice(-4)}`,
        price: Number(price),
        deliveryNote,
        quoteNote,
      });

      // Notify the buyer that a new quote has come in.
      const text = formatBuyerNewQuote(request, quote);
      WhatsAppService.sendBroadcastMessage(request.buyerPhone, text).catch(() => undefined);

      res.status(201).json({ success: true, data: quote });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/requests/:id/quotes
   */
  static async listQuotes(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await requestStore.listQuotes(String(req.params.id));
      res.json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/quotes/:id/accept
   */
  static async acceptQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const quote = await requestStore.acceptQuote(String(req.params.id));
      if (!quote) throw new AppError("Quote not found", 404);

      // Notify the winning seller.
      const text = `🎉 Your quote was accepted!\n\nQuote ID: ${quote.id}\nAmount: ₹${quote.price}\n\nKarigar Sakhi will reach out to coordinate delivery.`;
      WhatsAppService.sendBroadcastMessage(quote.sellerPhone, text).catch(() => undefined);

      res.json({ success: true, data: quote });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/quotes/:id/reject
   */
  static async rejectQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const quote = await requestStore.rejectQuote(String(req.params.id));
      if (!quote) throw new AppError("Quote not found", 404);
      res.json({ success: true, data: quote });
    } catch (error) {
      next(error);
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function autoCategorize(brief: string): string | undefined {
  const t = brief.toLowerCase();
  if (/\b(idli|idly|dosa|laddu|sweets?|food|snack|cake|biriyani)\b/.test(t)) return "Food Products";
  if (/\b(saree|kurti|dupatta|fabric|cloth|cotton|silk|textile)\b/.test(t)) return "Textiles";
  if (/\b(necklace|earring|bangle|jewel|ornament)\b/.test(t)) return "Jewellery";
  if (/\b(bag|tote|purse|jute)\b/.test(t)) return "Bags & Accessories";
  if (/\b(lamp|decor|wall hanging|home)\b/.test(t)) return "Home Decor";
  if (/\b(diya|festival|return gift|wedding|housewarming)\b/.test(t)) return "Festive Items";
  if (/\b(pot|pottery|terracotta|clay)\b/.test(t)) return "Pottery";
  return undefined;
}

function formatBuyerNewQuote(r: any, q: any): string {
  return [
    `📨 *New quote received*`,
    ``,
    `Request: _${r.brief}_`,
    `Seller: ${q.sellerName}`,
    `Price: ₹${q.price}`,
    q.deliveryNote ? `Delivery: ${q.deliveryNote}` : "",
    "",
    `Reply *MENU → 5 Request Bulk Order* to view all quotes.`,
  ]
    .filter(Boolean)
    .join("\n");
}

import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler";
import { normalizeIndianPhone } from "../utils/normalizePhone";
import { generateToken } from "../middleware/auth";

// In-memory OTP store: phone → { otp, expiresAt }
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export class OtpController {
  /**
   * POST /api/otp/send — Generate OTP and send via WhatsApp bot
   */
  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.body;
      if (!phone) throw new AppError("Phone number is required", 400);

      const normalized = normalizeIndianPhone(phone);
      // Indian numbers must be 10 digits → normalized to 12-digit "91XXXXXXXXXX".
      // Reject anything else with a clean 400 instead of dispatching a bot send
      // for an empty number that the bot will silently drop.
      if (!/^91[6-9]\d{9}$/.test(normalized)) {
        throw new AppError("Invalid Indian phone number", 400);
      }

      const otp = generateOtp();
      otpStore.set(normalized, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS });

      // Send OTP via WhatsApp bot
      const botUrl = process.env.WA_BOT_URL || "http://localhost:5001";
      const botSecret = process.env.WHATSAPP_BOT_SECRET || "wa-demo-secret";

      const message = `🔐 Your HastKala login OTP is: *${otp}*\n\nValid for 5 minutes. Do not share this with anyone.`;

      let delivery = {
        delivered: false,
        reason: "not-attempted",
        status: 0,
      };

      try {
        const botResponse = await fetch(`${botUrl}/send-message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-bot-secret": botSecret,
          },
          body: JSON.stringify({ phone: normalized, message }),
        });
        const botPayload = (await botResponse.json().catch(() => null)) as any;
        const delivered = botResponse.ok && botPayload?.data?.delivered !== false;
        delivery = {
          delivered,
          reason: delivered
            ? "sent"
            : botPayload?.data?.reason || botPayload?.error?.message || "bot-unavailable",
          status: botResponse.status,
        };
      } catch (err: any) {
        console.warn("OTP WhatsApp delivery failed:", err?.message);
        delivery = {
          delivered: false,
          reason: "bot-unreachable",
          status: 0,
        };
      }

      console.log(`\n[DEV] OTP for ${normalized}: ${otp}\n`);

      res.json({
        success: true,
        data: {
          message: delivery.delivered
            ? "OTP sent via WhatsApp"
            : "OTP generated. WhatsApp delivery is pending.",
          phone: normalized,
          delivery,
          ...(process.env.NODE_ENV !== "production" ? { devOtp: otp } : {}),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/otp/verify — Verify OTP and return artisan data
   */
  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) throw new AppError("Phone and OTP are required", 400);

      const normalized = normalizeIndianPhone(phone);
      const stored = otpStore.get(normalized);

      if (!stored) throw new AppError("No OTP found. Please request a new one.", 400);
      if (Date.now() > stored.expiresAt) {
        otpStore.delete(normalized);
        throw new AppError("OTP expired. Please request a new one.", 400);
      }
      if (stored.otp !== otp.trim()) {
        throw new AppError("Invalid OTP", 400);
      }

      // OTP valid — clear it
      otpStore.delete(normalized);

      // Find artisan by phone
      const prisma = (await import("../config/database")).default;
      const artisan = await prisma.artisan.findUnique({ where: { phone: normalized } });

      // Issue session token
      const token = generateToken({
        userId: artisan?.id ?? normalized,
        email: normalized, // phone-based login uses phone as identifier
        role: "seller",
      });

      res.json({
        success: true,
        data: {
          verified: true,
          token,
          artisanId: artisan?.id ?? null,
          name: artisan?.name ?? null,
          phone: normalized,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

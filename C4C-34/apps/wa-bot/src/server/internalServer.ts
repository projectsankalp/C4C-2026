/**
 * Internal HTTP server — listens on PORT (default 5001).
 *
 * Endpoints:
 *   GET  /health                       — liveness probe
 *   GET  /sessions                     — list active conversation sessions
 *   POST /send-message                 — generic WhatsApp send (backend → bot)
 *   POST /internal/send-order-alert    — typed order-alert variant
 *   POST /simulator/message            — drive the engine from a browser/curl
 *   POST /demo/run                     — replay the canonical add-product flow
 *   GET  /simulator/*                  — static simulator UI
 */
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import QRCode from "qrcode";
import { z } from "zod";
import { config } from "../config";
import { log } from "../utils/logger";
import { processMessage } from "../conversations/engine";
import { getMessages } from "../conversations/messages";
import { listSessions, resetSession, getSession } from "../conversations/state";
import { handleCertificationUnlock } from "../conversations/flows/certification";
import { toIndianInternational, normalizePhone } from "../utils/phone";
import { getWhatsAppClient } from "../openwa/sharedClient";
import { getLatestQr } from "../openwa/createClient";
import { translateForUser } from "../services/translationService";
import { synthesizeSpeech } from "../services/ttsService";
import { translateAndSpeak } from "../services/indicSpeechService";
import type { IncomingMessage, OrderAlertPayload, Language } from "../types";

const orderAlertSchema = z.object({
  to: z.string().min(8),
  productTitle: z.string().min(1),
  quantity: z.number().int().positive(),
  amount: z.number().int().nonnegative(),
  buyerCity: z.string().optional(),
  buyerName: z.string().optional(),
  orderId: z.string().optional(),
});

const sendMessageSchema = z
  .object({
    to: z.string().optional(),
    phone: z.string().optional(),
    message: z.string().min(1),
  })
  .refine((d) => Boolean(d.to || d.phone), {
    message: "Either 'to' or 'phone' is required",
  });

const simulatorSchema = z.object({
  phone: z.string().min(8),
  body: z.string().optional().default(""),
  imageUrl: z.string().url().optional(),
  hasImage: z.boolean().optional(),
  hasAudio: z.boolean().optional(),
});

export function buildInternalServer() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "5mb" }));

  // ---- Health ----
  app.get("/health", (_req, res) => {
    res.json({
      success: true,
      data: {
        service: "hastkala-wa-bot",
        whatsappReady: Boolean(getWhatsAppClient()),
        sessionId: config.sessionId,
        demoMode: config.demoMode,
        time: new Date().toISOString(),
      },
    });
  });

  // ---- WhatsApp pairing QR (HTML page + raw PNG) ----
  // Open /wabot/qr in a browser; refreshes itself every 10s. /wabot/qr.png is the bare image.
  app.get("/qr.png", async (_req, res) => {
    const latest = getLatestQr();
    if (!latest) {
      res.status(404).send("No QR available. Either WhatsApp is already authenticated, or the bot hasn't requested one yet.");
      return;
    }
    try {
      const buf = await QRCode.toBuffer(latest.qr, { errorCorrectionLevel: "M", margin: 2, scale: 8 });
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "no-store");
      res.send(buf);
    } catch (err) {
      log.error("WA_QR_RENDER_FAILED", { error: String(err) });
      res.status(500).send("Failed to render QR");
    }
  });

  app.get("/qr", (_req, res) => {
    const latest = getLatestQr();
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    if (!latest) {
      const ready = Boolean(getWhatsAppClient());
      res.send(`<!doctype html><html><head><meta charset="utf-8"><title>Hastkala WhatsApp</title>
<meta http-equiv="refresh" content="5">
<style>body{font-family:system-ui;background:#0b0b0b;color:#eee;display:grid;place-items:center;min-height:100vh;margin:0}main{max-width:32rem;text-align:center;padding:2rem}h1{font-size:1.25rem;margin:.5rem 0}p{opacity:.7;line-height:1.6}</style>
</head><body><main><h1>${ready ? "WhatsApp is connected." : "Waiting for WhatsApp..."}</h1>
<p>${ready ? "No QR scan needed. The bot is ready to receive messages." : "The bot will produce a QR within 30 seconds. This page auto-refreshes every 5s."}</p></main></body></html>`);
      return;
    }
    const ageSec = Math.floor((Date.now() - latest.receivedAt) / 1000);
    res.send(`<!doctype html><html><head><meta charset="utf-8"><title>Scan to link WhatsApp</title>
<meta http-equiv="refresh" content="10">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:system-ui;background:#0b0b0b;color:#eee;display:grid;place-items:center;min-height:100vh;margin:0}
main{max-width:24rem;text-align:center;padding:2rem}
h1{font-size:1.25rem;margin:0 0 1rem}
img{width:100%;height:auto;background:#fff;padding:1rem;border-radius:.75rem;display:block}
p{opacity:.7;line-height:1.6;margin:1rem 0 0}
small{opacity:.4;display:block;margin-top:.5rem}
</style></head><body><main>
<h1>Scan with WhatsApp to link the bot</h1>
<img src="/wabot/qr.png?ts=${latest.receivedAt}" alt="WhatsApp QR">
<p>Open WhatsApp on your phone &rarr; <strong>Settings &rarr; Linked devices &rarr; Link a device</strong>, then scan.</p>
<small>QR generated ${ageSec}s ago. Auto-refresh every 10s.</small>
</main></body></html>`);
  });

  // ---- Debug ----
  app.get("/debug/chats", async (_req, res) => {
    const client = getWhatsAppClient();
    if (!client) {
      return res.json({ success: false, error: { message: "WhatsApp client not connected" } });
    }
    try {
      const chats = await client.getChats();
      const summary = chats.slice(0, 20).map((chat: any) => ({
        id: chat.id?._serialized,
        name: chat.name,
        isGroup: chat.isGroup,
        unreadCount: chat.unreadCount,
        lastMessage: chat.lastMessage?.body?.slice(0, 60),
        timestamp: chat.timestamp,
      }));
      return res.json({ success: true, data: { count: chats.length, recent: summary } });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { message: error?.message || "Could not fetch chats" },
      });
    }
  });

  app.get("/debug/resolve/:chatId", async (req, res) => {
    const client = getWhatsAppClient();
    if (!client) {
      return res.json({ success: false, error: { message: "WhatsApp client not connected" } });
    }
    try {
      const chatId = decodeURIComponent(req.params.chatId);
      const contact: any = await client.getContactById(chatId);
      return res.json({
        success: true,
        data: {
          chatId,
          name: contact?.name,
          pushname: contact?.pushname,
          number: contact?.number,
          id: contact?.id?._serialized,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { message: error?.message || "Could not resolve" },
      });
    }
  });

  // ---- Generic send-message (called by Person 4 backend) ----
  app.post("/send-message", requireBotSecret, async (req: Request, res: Response) => {
    const parsed = sendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid send-message payload",
          details: parsed.error.flatten(),
          code: "VALIDATION_ERROR",
        },
      });
    }

    const phone = toIndianInternational(parsed.data.to || parsed.data.phone || "");
    const result = await deliverWhatsAppMessage(phone, parsed.data.message);
    const status = result.delivered ? 200 : 202;
    return res.status(status).json({ success: true, data: result });
  });

  // ---- Certify a seller (called by backend/admin when cohort is completed) ----
  // POST /certify  { phone: "919876543210", certPdfUrl?: "https://..." }
  // Bot sends: congratulations + certificate PDF + first onboarding question.
  app.post("/certify", requireBotSecret, async (req: Request, res: Response) => {    const phone = toIndianInternational(String(req.body?.phone || ""));
    const certPdfUrl: string | undefined = req.body?.certPdfUrl;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: { message: "phone is required", code: "VALIDATION_ERROR" },
      });
    }

    // Build the sequence of messages to send
    const messages = handleCertificationUnlock(phone, certPdfUrl);

    // Read the user's language + replyMode for translation/TTS routing
    const sess = getSession(phone);
    const lang: Language = sess.language || "en";
    const mode = sess.replyMode || "both";
    const includeVoice = mode !== "text";
    const skipTextForVoiceMode = mode === "voice";

    let delivered = false;
    let lastError: string | undefined;

    for (const msg of messages) {
      // Translate the bot's English copy into the user's language. For en
      // this is a no-op; for hi/kn we have hand-translated packs already
      // (so the source string IS in hi/kn — translateForUser short-circuits);
      // for ta/ml runtime translation kicks in.
      const translatedText = await translateForUser(msg.text, { targetLanguage: lang });
      const captionTranslated = msg.mediaCaption
        ? await translateForUser(msg.mediaCaption, { targetLanguage: lang })
        : undefined;

      if (msg.mediaUrl) {
        // Document with caption (e.g. certificate PDF)
        const docResult = await deliverWhatsAppDocument(
          phone,
          msg.mediaUrl,
          captionTranslated || translatedText,
        );
        if (!docResult.delivered) {
          const textResult = await deliverWhatsAppMessage(phone, translatedText);
          delivered = textResult.delivered;
          lastError = docResult.error;
        } else {
          delivered = true;
        }
        // Document caption sent already; no separate voice note for the
        // PDF group (would clutter the chat).
        continue;
      }

      // Plain text — send text first (unless voice-only mode), then voice.
      if (!skipTextForVoiceMode) {
        const result = await deliverWhatsAppMessage(phone, translatedText);
        delivered = result.delivered;
        if (result.error) lastError = result.error;
      } else {
        delivered = true; // voice will mark it
      }

      if (includeVoice) {
        try {
          const voice = await synthesizeCertificationVoice(translatedText, lang);
          if (voice) {
            await deliverWhatsAppVoiceNote(phone, voice);
          }
        } catch (ttsErr: any) {
          log.warn("CERTIFY_TTS_FAILED", { message: ttsErr?.message });
        }
      }
    }

    log.info("SELLER_CERTIFIED_NOTIFICATION", {
      phone: maskPhone(phone),
      delivered,
      messageCount: messages.length,
    });

    return res.json({
      success: true,
      data: { phone: maskPhone(phone), delivered, messageCount: messages.length, error: lastError },
    });
  });

  // ---- Reject a community-member application (called by /admin Reject) ----
  // POST /reject  { phone: "919876543210", reason?: string }
  // Sends a polite "thanks but you weren't approved this time" message and
  // resets the seller's session so they're not stuck in SELLER_COMMUNITY_WAITING.
  app.post("/reject", requireBotSecret, async (req: Request, res: Response) => {
    const phone = toIndianInternational(String(req.body?.phone || ""));
    const reason: string | undefined =
      typeof req.body?.reason === "string" ? req.body.reason : undefined;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: { message: "phone is required", code: "VALIDATION_ERROR" },
      });
    }

    const sess = getSession(phone);
    const lang: Language = sess.language || "en";

    // Polite, language-respectful decline copy. Kept in English here; the
    // translateForUser pipeline localizes it for hi/kn/ta/ml at delivery.
    const baseMsg =
      "Namaste 🙏 Thank you for your interest in joining HastKala as a seller. " +
      "After reviewing your application, our team isn't able to certify you at this time." +
      (reason ? `\n\n_Note: ${reason}_` : "") +
      "\n\nYou're still welcome on HastKala — you can browse, buy from artisans, " +
      "and reach out to us if anything changes. Reply *START* anytime to begin again.";

    const translatedText = await translateForUser(baseMsg, { targetLanguage: lang });
    const result = await deliverWhatsAppMessage(phone, translatedText);

    // Reset their session so a fresh START actually starts fresh.
    try {
      resetSession(phone);
    } catch (err: any) {
      log.warn("REJECT_RESET_FAILED", { message: err?.message });
    }

    log.info("SELLER_REJECTED_NOTIFICATION", {
      phone: maskPhone(phone),
      delivered: result.delivered,
    });

    return res
      .status(result.delivered ? 200 : 202)
      .json({ success: true, data: { phone: maskPhone(phone), delivered: result.delivered } });
  });

  // ---- Revoke a seller's certificate (demo helper) ----
  // POST /revoke  { phone: "919876543210", silent?: boolean }
  // Resets isCertified=false, onboardingComplete=false, clears the in-memory
  // session, and (unless silent=true) sends a one-line WhatsApp message to
  // tell the seller their account was reset for the demo.
  app.post("/revoke", requireBotSecret, async (req: Request, res: Response) => {
    const phone = toIndianInternational(String(req.body?.phone || ""));
    const silent = Boolean(req.body?.silent);

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: { message: "phone is required", code: "VALIDATION_ERROR" },
      });
    }

    // 1. Reset the in-memory session entirely
    resetSession(phone);

    // 2. Tell the backend to clear isCertified + onboardingComplete via the
    //    standard PATCH /api/users/by-phone/:phone endpoint
    let backendCleared = false;
    try {
      const resp = await fetch(`${config.backendUrl}/api/users/by-phone/${phone}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isCertified: false,
          onboardingComplete: false,
          // Don't wipe name/address/contact — they survive across demo runs
        }),
      });
      backendCleared = resp.ok;
    } catch (err: any) {
      log.warn("REVOKE_BACKEND_PATCH_FAILED", { message: err?.message });
    }

    // 3. (Optional) tell the user
    let delivered = false;
    if (!silent) {
      const text =
        "🔄 *Your seller account has been reset for the demo.*\n\nReply *HI* to start over from the beginning.";
      const result = await deliverWhatsAppMessage(phone, text);
      delivered = result.delivered;
    }

    log.info("SELLER_REVOKED", {
      phone: maskPhone(phone),
      backendCleared,
      delivered,
      silent,
    });

    return res.json({
      success: true,
      data: {
        phone: maskPhone(phone),
        backendCleared,
        delivered,
        silent,
      },
    });
  });

  // ---- Order alert (typed contract) ----
  app.post("/internal/send-order-alert", requireBotSecret, async (req: Request, res: Response) => {
    const parsed = orderAlertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid order alert payload", details: parsed.error.flatten() },
      });
    }

    const payload: OrderAlertPayload = parsed.data;
    const phone = toIndianInternational(payload.to);
    // Use English copy for backend-triggered alerts; the recipient's
    // session language isn't known here unless we look it up.
    // We could fetch it from /api/users/by-phone/:phone for accuracy.
    const text = getMessages("en").orderAlert(payload);

    const result = await deliverWhatsAppMessage(phone, text, {
      orderId: payload.orderId,
      amount: payload.amount,
    });

    return res.status(result.delivered ? 200 : 200).json({
      success: true,
      data: result,
    });
  });

  // ---- Simulator endpoint ----
  app.post("/simulator/message", async (req: Request, res: Response) => {
    const parsed = simulatorSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid simulator payload", details: parsed.error.flatten() },
      });
    }

    const phone = normalizePhone(parsed.data.phone);
    const incoming: IncomingMessage = {
      phone,
      body: parsed.data.body ?? "",
      hasImage: Boolean(parsed.data.hasImage || parsed.data.imageUrl),
      hasAudio: Boolean(parsed.data.hasAudio),
      imageUrl: parsed.data.imageUrl,
      source: "simulator",
    };

    const replies = await processMessage(incoming);

    return res.json({
      success: true,
      data: {
        replies: replies.map((r) => ({
          text: r.text,
          state: r.state,
          media: r.media,
        })),
      },
    });
  });

  // ---- Sessions list ----
  app.get("/sessions", (_req, res) => {
    const all = listSessions();
    res.json({
      success: true,
      data: {
        count: all.length,
        sessions: all.map((s) => ({
          phone: maskPhone(s.phone),
          state: s.state,
          role: s.role,
          language: s.language,
          name: s.name,
          onboarded: s.onboardingComplete,
          lastSeen: new Date(s.lastMessageAt).toISOString(),
        })),
      },
    });
  });

  // ---- Demo conductor: scripted seller add-product flow ----
  app.post("/demo/run", async (req: Request, res: Response) => {
    const phone = normalizePhone(req.body?.phone || "919876543210");
    resetSession(phone);

    const transcript: { step: string; replies: any[] }[] = [];
    async function step(label: string, msg: Partial<IncomingMessage>) {
      const incoming: IncomingMessage = {
        phone,
        body: msg.body ?? "",
        hasImage: msg.hasImage ?? false,
        hasAudio: msg.hasAudio ?? false,
        imageUrl: msg.imageUrl,
        source: "simulator",
      };
      const replies = await processMessage(incoming);
      transcript.push({
        step: label,
        replies: replies.map((r) => ({ text: r.text, state: r.state })),
      });
    }

    // Walk through full first-time → seller → add-product flow.
    await step("user-greeting", { body: "hi" });
    await step("user-language", { body: "1" });
    await step("user-role", { body: "1" });
    await step("user-tutorial", { body: "1" });
    await step("user-name", { body: "Lakshmi" });
    await step("user-district", { body: "Dakshina Kannada" });
    await step("user-craft", { body: "5" });
    await step("user-shg", { body: "2" });
    await step("user-sakhi", { body: "1" });
    await step("user-add-product", { body: "1" });
    await step("user-photo", {
      hasImage: true,
      imageUrl:
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80",
    });
    await step("user-done", { body: "DONE" });
    await step("user-details", { body: "Handmade coconut shell lamp, ₹600, 2 pieces available" });
    await step("user-confirm", { body: "1" });

    res.json({
      success: true,
      data: { phone: maskPhone(phone), transcript },
    });
  });

  // ---- Static simulator UI ----
  const simulatorDir = path.resolve(__dirname, "..", "simulator", "public");
  app.use("/simulator", express.static(simulatorDir));
  app.get("/", (_req, res) => res.redirect("/simulator/"));

  // ---- Demo certificate PDF ----
  // The certify.cmd / certify.ps1 helpers use this URL so the bot's
  // WhatsApp client can fetch the PDF from the same machine.
  // The PDF lives in the workspace root: <repo>/certificatedemo.pdf
  app.get("/demo/certificate.pdf", (_req, res) => {
    const pdfPath = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "certificatedemo.pdf",
    );
    if (!require("fs").existsSync(pdfPath)) {
      log.warn("DEMO_CERT_PDF_MISSING", { pdfPath });
      return res.status(404).json({
        success: false,
        error: { message: "certificatedemo.pdf not found at workspace root" },
      });
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="HastKala-Seller-Certificate.pdf"',
    );
    return res.sendFile(pdfPath);
  });

  // ---- 404 ----
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
    });
  });

  return app;
}

function requireBotSecret(req: Request, res: Response, next: NextFunction) {
  const provided = req.header("x-bot-secret");
  if (provided && provided === config.botSecret) {
    return next();
  }
  return res.status(401).json({
    success: false,
    error: { message: "Missing or invalid x-bot-secret header", code: "UNAUTHORIZED" },
  });
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return phone;
  return `${digits.slice(0, 4)}****${digits.slice(-3)}`;
}

interface DeliveryResult {
  delivered: boolean;
  reason?: "no-client" | "send-failed";
  previewText?: string;
  error?: string;
}

async function deliverWhatsAppMessage(
  phone: string,
  text: string,
  meta: Record<string, unknown> = {},
): Promise<DeliveryResult> {
  const whatsappClient = getWhatsAppClient();
  if (!whatsappClient) {
    log.warn("WA_SEND_NO_CLIENT", { to: phone, ...meta, textPreview: text.slice(0, 60) });
    return { delivered: false, reason: "no-client", previewText: text };
  }

  try {
    const chatId = `${phone}@c.us`;
    await whatsappClient.sendMessage(chatId, text);
    log.info("WA_SEND_OK", { to: phone, ...meta, textLen: text.length });
    return { delivered: true };
  } catch (error: any) {
    log.error("WA_SEND_FAILED", { to: phone, message: error?.message });
    return {
      delivered: false,
      reason: "send-failed",
      previewText: text,
      error: error?.message || String(error),
    };
  }
}

/**
 * Send a document/file attachment via WhatsApp.
 * Falls back gracefully if the client can't send documents.
 */
async function deliverWhatsAppDocument(
  phone: string,
  mediaUrl: string,
  caption: string,
): Promise<DeliveryResult> {
  const whatsappClient = getWhatsAppClient();
  if (!whatsappClient) {
    return { delivered: false, reason: "no-client" };
  }

  try {
    const { MessageMedia } = await import("whatsapp-web.js");
    const media = await MessageMedia.fromUrl(mediaUrl, { unsafeMime: true });
    const chatId = `${phone}@c.us`;
    await whatsappClient.sendMessage(chatId, media, { caption });
    log.info("WA_DOCUMENT_SENT", { to: phone, mediaUrl, captionLen: caption.length });
    return { delivered: true };
  } catch (error: any) {
    log.warn("WA_DOCUMENT_FAILED", { to: phone, mediaUrl, message: error?.message });
    return {
      delivered: false,
      reason: "send-failed",
      error: error?.message || String(error),
    };
  }
}

/**
 * Generate a voice note for a certification message in the user's language.
 *   ta/ml → unified gpt-audio call (translateAndSpeak) for native accent.
 *   en/hi/kn → standard TTS via gpt-4o-mini-tts.
 * Returns null on failure.
 */
async function synthesizeCertificationVoice(
  translatedText: string,
  language: Language,
): Promise<{ buffer: Buffer; mimetype: string } | null> {
  if (language === "ta" || language === "ml") {
    const result = await translateAndSpeak({ text: translatedText, language });
    if (result) {
      return { buffer: result.audioBuffer, mimetype: result.audioMimetype };
    }
  }
  const synth = await synthesizeSpeech({ text: translatedText, language });
  return synth ?? null;
}

/**
 * Send a voice note as a real WhatsApp Push-To-Talk bubble.
 * Used by /certify to deliver TTS audio alongside text.
 */
async function deliverWhatsAppVoiceNote(
  phone: string,
  voice: { buffer: Buffer; mimetype: string },
): Promise<void> {
  const whatsappClient = getWhatsAppClient();
  if (!whatsappClient) return;
  try {
    const { MessageMedia } = await import("whatsapp-web.js");
    const base64 = voice.buffer.toString("base64");
    const mime = voice.mimetype || "audio/ogg; codecs=opus";
    const filename = mime.startsWith("audio/wav") ? "voice.wav" : "voice.ogg";
    const media = new MessageMedia(mime, base64, filename);
    const chatId = `${phone}@c.us`;
    await whatsappClient.sendMessage(chatId, media, { sendAudioAsVoice: true });
    log.info("CERTIFY_VOICE_SENT", { to: phone, bytes: voice.buffer.length });
  } catch (error: any) {
    log.warn("CERTIFY_VOICE_SEND_FAILED", { to: phone, message: error?.message });
  }
}

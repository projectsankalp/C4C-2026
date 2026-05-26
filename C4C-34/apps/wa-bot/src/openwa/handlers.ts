/**
 * Wires whatsapp-web.js message events to the transport-agnostic conversation engine.
 */
import type { Client, Message } from "whatsapp-web.js";
import { config } from "../config";
import { log } from "../utils/logger";
import { isAllowed, normalizePhone } from "../utils/phone";
import { processMessage } from "../conversations/engine";
import { getSession } from "../conversations/state";
import { resolveMedia } from "./media";
import type { IncomingMessage } from "../types";

export function registerMessageHandler(client: Client): void {
  client.on("message_create", async (message: Message) => {
    try {
      const rawFrom = (message as any).from || "";
      const fromMe = (message as any).fromMe;

      if (fromMe) return;

      // Skip group + status messages.
      if (rawFrom.endsWith("@g.us")) {
        log.debug("MESSAGE_IGNORED_GROUP", { rawFrom });
        return;
      }
      if (
        rawFrom.endsWith("@newsletter") ||
        rawFrom.endsWith("@broadcast") ||
        rawFrom === "status@broadcast"
      ) {
        return;
      }

      // Resolve LID → real phone.
      let phone = "";
      let replyToChatId = rawFrom;
      let resolvedVia: "raw" | "contact" = "raw";

      if (rawFrom.endsWith("@lid")) {
        try {
          const contact: any = await message.getContact();
          const realChatId = contact?.id?._serialized as string | undefined;
          const idUser = contact?.id?.user as string | undefined;
          phone = normalizePhone(idUser || realChatId || contact?.number || "");
          if (realChatId && realChatId.endsWith("@c.us")) {
            replyToChatId = realChatId;
          }
          resolvedVia = "contact";
        } catch (error: any) {
          log.warn("LID_RESOLUTION_FAILED", { rawFrom, message: error?.message });
        }
      } else {
        phone = normalizePhone(rawFrom);
      }

      log.debug("MSG_CREATE_RAW", {
        rawFrom,
        type: (message as any).type,
        bodyPreview: (message.body || "").slice(0, 60),
        resolvedPhone: phone,
        resolvedVia,
      });

      if (!phone) {
        log.warn("MESSAGE_NO_PHONE", { rawFrom });
        return;
      }

      if (!isAllowed(phone, config.allowedTestNumbers, config.demoMode)) {
        log.warn("MESSAGE_BLOCKED_NOT_ALLOWLISTED", { phone });
        return;
      }

      const media = await resolveMedia(message);

      const incoming: IncomingMessage = {
        phone,
        body: message.body || "",
        hasImage: Boolean(media.imageUrl),
        hasAudio: Boolean(media.audioReceived),
        imageUrl: media.imageUrl,
        imageBuffer: media.imageBuffer,
        imageMimetype: media.imageMimetype,
        audioBuffer: media.audioBuffer,
        audioMimetype: media.audioMimetype,
        source: "whatsapp",
      };

      const replies = await processMessage(incoming);

      // Read replyMode AFTER processMessage so picker selections take effect
      // immediately on their reply.
      const liveSession = getSession(phone);
      const replyMode = liveSession.replyMode || "both";
      // "voice" mode: skip text bubbles when we have a voice promise/voice
      // for the same reply. Banners (transcript) and media-bearing replies
      // (PDF) and replies with no audio still get text — silence isn't an
      // option for those.
      const skipTextForVoiceMode = replyMode === "voice";

      /**
       * Two-pass send so the user sees text bubbles ASAP:
       *
       *   Pass 1: send every text bubble immediately, capture the voice
       *           promise (if any) for later.
       *   Pass 2: await each voice promise in order and send the voice
       *           note alongside the corresponding text bubble.
       *
       * Why this matters: TTS for a long Indic prompt can take 4-7 seconds.
       * If we awaited voice before sending text, the user would stare at a
       * silent chat for 10+ seconds across multi-bubble replies. With this
       * split, text typically arrives in <1s and voice trickles in after.
       */
      const pendingVoices: Array<{
        index: number;
        promise: Promise<{ buffer: Buffer; mimetype: string } | null>;
      }> = [];

      for (let i = 0; i < replies.length; i++) {
        const reply = replies[i];

        // Voice-only mode: skip the text bubble when we have audio for it.
        // Banners (🎙️) and replies with media (PDF) always send text.
        const hasVoice = (reply.voice && reply.voice.buffer.length > 0) || Boolean(reply.voicePromise);
        const sendText =
          !skipTextForVoiceMode ||
          !hasVoice ||
          reply.text.startsWith("🎙️") ||
          Boolean(reply.media);

        // 1. Send text bubble first (when allowed by mode)
        if (sendText) {
          await client.sendMessage(replyToChatId, reply.text);
          log.info("REPLY_SENT", {
            phone,
            to: replyToChatId,
            state: reply.state,
            textLen: reply.text.length,
          });
        }

        // 2a. If voice is already resolved (ta/ml unified path), send right after the text.
        if (reply.voice && reply.voice.buffer.length > 0) {
          await sendVoiceNote(client, replyToChatId, reply.voice, reply.state, phone);
          continue;
        }

        // 2b. If voice is still being synthesized, queue the promise for the second pass.
        if (reply.voicePromise) {
          pendingVoices.push({ index: i, promise: reply.voicePromise });
        }
      }

      // 3. Await pending voice synthesis and send each voice note. We do
      //    these sequentially so they arrive in the same order as the
      //    text bubbles they belong to.
      for (const { index, promise } of pendingVoices) {
        try {
          const voice = await promise;
          if (voice && voice.buffer.length > 0) {
            await sendVoiceNote(client, replyToChatId, voice, replies[index].state, phone);
          }
        } catch (voiceErr: any) {
          log.warn("VOICE_PROMISE_REJECTED", { message: voiceErr?.message });
        }
      }
    } catch (error: any) {
      log.error("HANDLER_UNCAUGHT", {
        message: error?.message,
        stack: String(error?.stack || "").slice(0, 400),
      });
      try {
        if (message?.from) {
          await client.sendMessage(
            message.from,
            "Sorry, something went wrong on our side. Reply RESET to start over.",
          );
        }
      } catch {
        /* ignore */
      }
    }
  });
}

/**
 * Send a single voice note as a real WhatsApp Push-To-Talk bubble.
 * Failures are logged and swallowed so a TTS hiccup never breaks the flow.
 */
async function sendVoiceNote(
  client: Client,
  replyToChatId: string,
  voice: { buffer: Buffer; mimetype: string },
  state: string,
  phone: string,
): Promise<void> {
  try {
    const { MessageMedia } = await import("whatsapp-web.js");
    const base64 = voice.buffer.toString("base64");
    const mime = voice.mimetype || "audio/ogg; codecs=opus";
    // Filename extension hints WhatsApp's renderer to display as a real
    // voice note. WAV from gpt-audio gets .wav, OGG/Opus from tts gets .ogg.
    const filename = mime.startsWith("audio/wav") ? "voice.wav" : "voice.ogg";
    const media = new MessageMedia(mime, base64, filename);
    await client.sendMessage(replyToChatId, media, {
      sendAudioAsVoice: true,
    });
    log.info("VOICE_REPLY_SENT", {
      phone,
      state,
      bytes: voice.buffer.length,
      mime,
    });
  } catch (ttsErr: any) {
    log.warn("VOICE_REPLY_FAILED", { message: ttsErr?.message });
  }
}

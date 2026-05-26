/**
 * Media handling for whatsapp-web.js messages.
 *
 *   - text:   message.body has content. No media.
 *   - image:  hasMedia=true and type is 'image'. We download the bytes,
 *             upload to the backend, and surface the resulting URL.
 *             On failure we fall back to a placeholder so the flow continues.
 *   - audio:  hasMedia=true and type is 'ptt' or 'audio'. Decrypted bytes
 *             go to the Whisper transcription service (handled in engine).
 */
import type { Message } from "whatsapp-web.js";
import { log } from "../utils/logger";
import { uploadImage, PLACEHOLDER_PRODUCT_IMAGE } from "../services/uploadService";

export interface ResolvedMedia {
  /** Public HTTPS URL the engine can store on the product. */
  imageUrl?: string;
  /** Raw image bytes (for re-upload or local processing if needed). */
  imageBuffer?: Buffer;
  imageMimetype?: string;
  audioReceived?: boolean;
  audioBuffer?: Buffer;
  audioMimetype?: string;
}

export async function resolveMedia(message: Message): Promise<ResolvedMedia> {
  if (!message.hasMedia) {
    return {};
  }

  const messageType = (message as any).type as string | undefined;

  // ---- Image ----
  if (messageType === "image" || messageType === "sticker") {
    log.info("MEDIA_IMAGE_RECEIVED", { type: messageType });
    try {
      const downloaded = await message.downloadMedia();
      if (!downloaded) throw new Error("downloadMedia returned null");
      const buffer = Buffer.from(downloaded.data, "base64");
      log.info("MEDIA_IMAGE_DECRYPTED", { bytes: buffer.length, mimetype: downloaded.mimetype });

      // Upload to backend → Cloudinary → public URL.
      const url = await uploadImage(buffer, downloaded.mimetype);
      return {
        imageUrl: url,
        imageBuffer: buffer,
        imageMimetype: downloaded.mimetype,
      };
    } catch (error: any) {
      log.warn("MEDIA_IMAGE_FAILED", {
        message: error?.message,
        hint: "Falling back to placeholder URL.",
      });
      return { imageUrl: PLACEHOLDER_PRODUCT_IMAGE };
    }
  }

  // ---- Audio (voice notes + uploaded audio) ----
  if (messageType === "ptt" || messageType === "audio") {
    log.info("MEDIA_AUDIO_RECEIVED", { type: messageType });
    try {
      const downloaded = await message.downloadMedia();
      if (!downloaded) throw new Error("downloadMedia returned null");
      const buffer = Buffer.from(downloaded.data, "base64");
      log.info("MEDIA_AUDIO_DECRYPTED", {
        type: messageType,
        mimetype: downloaded.mimetype,
        bytes: buffer.length,
      });
      return {
        audioReceived: true,
        audioBuffer: buffer,
        audioMimetype: downloaded.mimetype,
      };
    } catch (error: any) {
      log.warn("MEDIA_AUDIO_DECRYPT_FAILED", {
        type: messageType,
        message: error?.message,
        hint: "Engine will use mock transcription.",
      });
      return { audioReceived: true };
    }
  }

  return {};
}

export { PLACEHOLDER_PRODUCT_IMAGE };

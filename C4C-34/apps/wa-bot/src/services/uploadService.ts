/**
 * Image upload service. Sends decrypted WhatsApp media bytes to the backend's
 * /api/whatsapp/upload-image endpoint, which forwards to Cloudinary (or returns
 * a fallback URL when Cloudinary is not configured).
 *
 * If the upload fails we log loudly and return a placeholder URL so the
 * conversation never stalls on a media issue.
 */
import axios from "axios";
import FormData from "form-data";
import { config } from "../config";
import { log } from "../utils/logger";

const PLACEHOLDER_URL =
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80";

export async function uploadImage(buffer: Buffer, mimetype = "image/jpeg"): Promise<string> {
  if (!buffer || buffer.length === 0) {
    log.warn("UPLOAD_EMPTY_BUFFER");
    return PLACEHOLDER_URL;
  }

  try {
    const form = new FormData();
    const ext = mimeToExt(mimetype);
    form.append("image", buffer, {
      filename: `whatsapp-product-${Date.now()}.${ext}`,
      contentType: mimetype,
    });

    const response = await axios.post(`${config.backendUrl}/api/whatsapp/upload-image`, form, {
      headers: {
        ...form.getHeaders(),
        "x-source": "wa-bot",
      },
      timeout: 30_000,
      maxBodyLength: 10 * 1024 * 1024,
      maxContentLength: 10 * 1024 * 1024,
    });

    const data = response.data?.data ?? response.data;
    const url = data?.imageUrl ?? data?.url;
    if (typeof url === "string" && url.startsWith("http")) {
      log.info("IMAGE_UPLOAD_OK", { url, bytes: buffer.length });
      return url;
    }
    log.warn("IMAGE_UPLOAD_NO_URL", { response: response.data });
    return PLACEHOLDER_URL;
  } catch (error: any) {
    log.warn("IMAGE_UPLOAD_FAILED", {
      message: error?.message,
      status: error?.response?.status,
    });
    return PLACEHOLDER_URL;
  }
}

function mimeToExt(mimetype: string): string {
  if (mimetype.includes("png")) return "png";
  if (mimetype.includes("webp")) return "webp";
  if (mimetype.includes("gif")) return "gif";
  return "jpg";
}

export const PLACEHOLDER_PRODUCT_IMAGE = PLACEHOLDER_URL;

import assert from "node:assert/strict";
import test from "node:test";
import { StorageService } from "./storage.service";

test("uses a stable fallback image when Cloudinary is not configured", async () => {
  const previousCloud = process.env.CLOUDINARY_CLOUD_NAME;
  const previousKey = process.env.CLOUDINARY_API_KEY;
  const previousSecret = process.env.CLOUDINARY_API_SECRET;

  delete process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.CLOUDINARY_API_KEY;
  delete process.env.CLOUDINARY_API_SECRET;

  const imageUrl = await StorageService.uploadImageFromBase64("data:image/png;base64,abc");

  assert.equal(imageUrl, StorageService.FALLBACK_IMAGE_URL);

  process.env.CLOUDINARY_CLOUD_NAME = previousCloud;
  process.env.CLOUDINARY_API_KEY = previousKey;
  process.env.CLOUDINARY_API_SECRET = previousSecret;
});

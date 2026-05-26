import cloudinary from "../config/cloudinary";
export class StorageService {
  static readonly FALLBACK_IMAGE_URL =
    "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6";

  private static isCloudinaryConfigured() {
    return Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
    );
  }

  /**
   * Upload image buffer to Cloudinary
   */
  static async uploadImage(buffer: Buffer, folder: string = "hastakala/products"): Promise<string> {
    if (!this.isCloudinaryConfigured()) return this.FALLBACK_IMAGE_URL;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            console.error("Image upload failed, using fallback image.", error);
            resolve(this.FALLBACK_IMAGE_URL);
          } else {
            resolve(result?.secure_url || this.FALLBACK_IMAGE_URL);
          }
        },
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Upload image from URL
   */
  static async uploadImageFromUrl(
    url: string,
    folder: string = "hastakala/products",
  ): Promise<string> {
    if (!this.isCloudinaryConfigured()) return url || this.FALLBACK_IMAGE_URL;

    try {
      const result = await cloudinary.uploader.upload(url, {
        folder,
        transformation: [
          { width: 1200, height: 1200, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      });
      return result.secure_url || url || this.FALLBACK_IMAGE_URL;
    } catch (error) {
      console.error("Image upload from URL failed, using fallback image.", error);
      return url || this.FALLBACK_IMAGE_URL;
    }
  }

  static async uploadImageFromBase64(
    base64: string,
    folder = "hastakala/products",
  ): Promise<string> {
    const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), "base64");
    return this.uploadImage(buffer, folder);
  }

  /**
   * Delete image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  }
}

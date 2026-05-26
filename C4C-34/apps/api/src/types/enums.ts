// Product Status Enum
export enum ProductStatus {
  DRAFT = "draft",
  PENDING_APPROVAL = "pending_approval",
  APPROVED = "approved",
  REJECTED = "rejected",
  SOLD_OUT = "sold_out",
}

// Order Status Enum
export enum OrderStatus {
  NEW = "new",
  CONFIRMED = "confirmed",
  PACKED = "packed",
  PICKED_UP = "picked_up",
  DELIVERED = "delivered",
  PAID = "paid",
  CANCELLED = "cancelled",
}

// Message Type Enum
export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
}

// Approval Action Enum
export enum ApprovalAction {
  APPROVED = "approved",
  REJECTED = "rejected",
  EDITED = "edited",
}

// Product Categories
export const PRODUCT_CATEGORIES = [
  "Home Decor",
  "Jewelry",
  "Textiles",
  "Pottery",
  "Handicrafts",
  "Accessories",
  "Art",
  "Furniture",
  "Kitchen Items",
  "Other",
] as const;

// Languages
export const LANGUAGES = ["kn", "hi", "en", "ta", "ml"] as const;

// Vendor Roles
export enum VendorRole {
  KARIGAR_SAKHI = "karigar_sakhi",
  ADMIN = "admin",
  COORDINATOR = "coordinator",
}

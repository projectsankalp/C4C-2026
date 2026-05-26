export type ProductStatus = "draft" | "pending_approval" | "approved" | "rejected" | "sold_out";

export type ArtisanSummary = {
  id: string;
  name: string;
  district: string;
  village?: string;
  craftType?: string;
  isVerified: boolean;
  story?: string;
  photoUrl?: string;
};

export type Artisan = {
  id: string;
  name: string;
  phone?: string;
  district: string;
  village?: string;
  language: "kn" | "hi" | "en" | "ta" | "ml";
  craftType: string;
  story: string;
  isVerified: boolean;
  yearsOfExperience?: number;
  shgName?: string;
  photoUrl?: string;
  totalProducts?: number;
  totalOrders?: number;
  createdAt: string;
};

export type Product = {
  id: string;
  artisanId: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  district: string;
  imageUrl: string;
  status: ProductStatus;
  aiGenerated?: boolean;
  material?: string;
  craftType?: string;
  tags?: string[];
  createdAt: string;
  newFromWhatsApp?: boolean;
  middlemanEstimate?: number;
  artisan?: ArtisanSummary;
};

export type OrderStatus =
  | "new"
  | "confirmed"
  | "packed"
  | "picked_up"
  | "delivered"
  | "paid"
  | "cancelled";

export type Order = {
  id: string;
  productId: string;
  productTitle: string;
  artisanName: string;
  artisanDistrict: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  paymentProvider?: "razorpay";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  createdAt: string;
};

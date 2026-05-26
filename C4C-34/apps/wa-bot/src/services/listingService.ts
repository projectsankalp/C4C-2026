/**
 * Buyer-facing product listing service.
 * Talks to GET /api/products with category/search filters.
 */
import { api } from "./apiClient";
import { log } from "../utils/logger";
import type { ApiEnvelope } from "../types";
import { filterDemoProducts } from "./demoProducts";

export interface ProductListItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  category?: string;
  district?: string;
  imageUrl?: string;
  artisan?: { id: string; name?: string; district?: string; isVerified?: boolean };
}

interface ListResponse {
  products?: ProductListItem[];
  pagination?: { total: number; limit: number; offset: number };
}

export async function listProducts(opts: {
  category?: string;
  search?: string;
  limit?: number;
}): Promise<ProductListItem[]> {
  try {
    const response = await api.get<ApiEnvelope<ListResponse | ProductListItem[]>>("/api/products", {
      params: {
        category: opts.category,
        search: opts.search,
        limit: opts.limit ?? 10,
      },
    });
    const env = response.data as any;
    const data = env?.data;
    const products = Array.isArray(data) ? data : data?.products;
    if (Array.isArray(products) && products.length > 0) return products;
    if (!opts.search) return filterDemoProducts(opts);
    return [];
  } catch (error: any) {
    log.warn("LIST_PRODUCTS_FAILED", { summary: error?.summary });
    return filterDemoProducts(opts);
  }
}

export async function getProductsForArtisan(artisanId: string): Promise<ProductListItem[]> {
  try {
    const response = await api.get<ApiEnvelope<{ products?: ProductListItem[] }>>(
      `/api/sellers/${artisanId}/products`,
    );
    const data = (response.data as any)?.data;
    if (Array.isArray(data)) return data;
    if (data?.products) return data.products;
    return [];
  } catch (error: any) {
    log.warn("LIST_SELLER_PRODUCTS_FAILED", { summary: error?.summary });
    return [];
  }
}

export async function updateProductStock(productId: string, quantity: number): Promise<boolean> {
  try {
    await api.patch(`/api/products/${productId}/stock`, { quantity });
    return true;
  } catch (error: any) {
    log.warn("UPDATE_STOCK_FAILED", { summary: error?.summary, productId });
    return false;
  }
}

export async function updateProduct(
  productId: string,
  patch: {
    title?: string;
    price?: number;
    description?: string;
    quantity?: number;
    status?: string;
  },
): Promise<boolean> {
  try {
    await api.patch(`/api/vendor/products/${productId}`, patch);
    return true;
  } catch (error: any) {
    log.warn("UPDATE_PRODUCT_FAILED", { summary: error?.summary, productId });
    return false;
  }
}

export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    await api.delete(`/api/products/${productId}`);
    return true;
  } catch (error: any) {
    log.warn("DELETE_PRODUCT_FAILED", { summary: error?.summary, productId });
    return false;
  }
}

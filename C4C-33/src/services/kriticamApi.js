/**
 * HaathSe — KritiCam API & Supabase Service Layer
 *
 * Full-stack data access for the frontend:
 *   - Uploads & AI pipeline  → FastAPI backend (POST /api/upload)
 *   - Product reads          → Supabase JS client (direct, faster, real-time capable)
 *   - Real-time subscriptions → Supabase Realtime channel
 *
 * Import what you need:
 *   import { uploadCraftImage, fetchProducts, subscribeToProducts } from '../services/kriticamApi';
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

// FastAPI backend URL — configurable via env var
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// WRITE PATH — FastAPI handles all AI-pipeline uploads
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uploads a craft image through the KritiCam FastAPI AI pipeline.
 * → FastAPI → GPT-4o Vision → Supabase DB insert → returns product record
 *
 * @param {File} imageFile
 * @returns {Promise<{ status: string, product: KritiCamProduct }>}
 */
export async function uploadCraftImage(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Upload failed: HTTP ${response.status}`);
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// READ PATH — Supabase JS client (direct DB access, faster than FastAPI proxy)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all published products.
 * Uses Supabase JS directly when configured; falls back to FastAPI proxy.
 *
 * @param {{ limit?: number }} [options]
 * @returns {Promise<KritiCamProduct[]>}
 */
export async function fetchProducts({ limit = 50 } = {}) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data || [];
  }

  // Fallback to FastAPI proxy (also works in demo mode)
  const res = await fetch(`${API_BASE_URL}/api/products?limit=${limit}`);
  if (!res.ok) throw new Error(`Fetch failed: HTTP ${res.status}`);
  const json = await res.json();
  return json.products || [];
}

/**
 * Fetches a single product by UUID for the provenance story page.
 * Uses Supabase JS directly when configured; falls back to FastAPI proxy.
 *
 * @param {string} productId
 * @returns {Promise<KritiCamProduct>}
 */
export async function fetchProductById(productId) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  const res = await fetch(`${API_BASE_URL}/api/products/${productId}`);
  if (!res.ok) throw new Error(`Product not found: ${productId}`);
  const json = await res.json();
  return json.product;
}

// ─────────────────────────────────────────────────────────────────────────────
// REAL-TIME — Supabase Realtime subscriptions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subscribes to live product insertions from Supabase Realtime.
 * When the FastAPI backend publishes a new AI-catalogued product, this fires
 * instantly — the buyer catalog updates without any reload or polling.
 *
 * Usage (in a React component):
 *   useEffect(() => {
 *     const unsub = subscribeToProducts((newProduct) => {
 *       setProducts(prev => [mapBackendProductToUI(newProduct), ...prev]);
 *     });
 *     return () => unsub();
 *   }, []);
 *
 * @param {(product: KritiCamProduct) => void} onNewProduct
 * @returns {() => void} unsubscribe function — call in useEffect cleanup
 */
export function subscribeToProducts(onNewProduct) {
  if (!isSupabaseConfigured) {
    // No-op unsubscribe when Supabase not configured
    return () => {};
  }

  const channel = supabase
    .channel('haathse-products-live')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'products',
        filter: "status=eq.published",
      },
      (payload) => {
        if (payload.new) {
          onNewProduct(payload.new);
        }
      }
    )
    .subscribe();

  // Return cleanup function for React useEffect
  return () => {
    supabase.removeChannel(channel);
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH — Backend connectivity check
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pings the FastAPI health endpoint.
 * @returns {Promise<{ status: string, openai_configured: boolean, supabase_configured: boolean }>}
 */
export async function checkBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) throw new Error('Backend health check failed.');
  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA MAPPING — backend → frontend UI schema
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps a Supabase/backend product to the existing frontend mockData.js shape.
 * Allows live products to render in existing components without refactoring.
 *
 * @param {KritiCamProduct} p - Product from Supabase or FastAPI
 * @returns {Object} Compatible with the product shape in mockData.js
 */
export function mapBackendProductToUI(p) {
  const artisanShare = Math.round(p.fair_price_inr * ((p.artisan_cut_percentage || 62) / 100));
  return {
    id: p.id,
    name: p.product_name,
    craft: p.craft_style,
    materials: p.materials_detected,
    dimensions: p.estimated_dimensions,
    weight: 'N/A',
    priceINR: p.fair_price_inr,
    priceUSD: p.fair_price_usd,
    image: p.image_url,
    kritiCamScore: p.craftsmanship_score,
    authenticityStatus: `${p.craftsmanship_score}% KritiCam Score`,
    materialsAnalysis: p.materials_detected,
    story: p.marketing_story,
    tags: p.tags || [],
    category: 'Handicraft',
    verifiedBadge: true,
    availableQty: 1,
    leadTimeWeeks: 4,
    artisanId: null,
    provenanceCertUrl: `https://verify.haathse.org/cert/${p.id}`,
    heritageRegion: p.heritage_region,
    artisanCutPercentage: p.artisan_cut_percentage || 62,
    isLiveItem: true,
    fairPriceBreakdown: {
      artisanWage: artisanShare,
      rawMaterials: Math.round(p.fair_price_inr * 0.15),
      villageDevelopmentFund: Math.round(p.fair_price_inr * 0.10),
      shippingInsurance: Math.round(p.fair_price_inr * 0.07),
      platformFee: Math.round(p.fair_price_inr * 0.06),
    },
  };
}

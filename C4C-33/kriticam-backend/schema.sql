-- ════════════════════════════════════════════════════════════════════
-- HaathSe — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ════════════════════════════════════════════════════════════════════

-- Enable UUID extension (usually already enabled on Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────────────
-- products table: stores all AI-analyzed craft listings
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Core product identity
    product_name          TEXT NOT NULL,
    craft_style           TEXT,                       -- e.g. "Madhubani Painting"
    heritage_region       TEXT,                       -- e.g. "Mithila, Bihar"
    estimated_dimensions  TEXT,                       -- e.g. "45cm x 30cm"
    materials_detected    TEXT,                       -- Comma-separated materials

    -- AI scoring metrics
    craftsmanship_score   NUMERIC(5, 2),              -- 0.00 - 100.00

    -- Fair-trade pricing
    fair_price_inr        INTEGER,                    -- In Indian Rupees
    fair_price_usd        INTEGER,                    -- In US Dollars
    artisan_cut_percentage INTEGER DEFAULT 62,        -- Percentage of sale to artisan

    -- Narrative & catalog
    marketing_story       TEXT,                       -- GPT-4o generated luxury copy
    tags                  TEXT[],                     -- Array of catalog tags
    image_url             TEXT,                       -- Supabase Storage or external URL

    -- Lifecycle status
    status                TEXT NOT NULL DEFAULT 'published'
                          CHECK (status IN ('pending', 'verified', 'published', 'archived'))
);

-- ────────────────────────────────────────────────────────────────────
-- Indexes for common query patterns
-- ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_status
    ON products (status);

CREATE INDEX IF NOT EXISTS idx_products_craft_style
    ON products (craft_style);

CREATE INDEX IF NOT EXISTS idx_products_created_at
    ON products (created_at DESC);

-- ────────────────────────────────────────────────────────────────────
-- Row Level Security (RLS) — enables safe public read access
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read of published products (buyer catalog)
CREATE POLICY "Public read published products"
    ON products FOR SELECT
    USING (status = 'published');

-- Allow backend service role to insert and update
CREATE POLICY "Service role full access"
    ON products FOR ALL
    USING (true)
    WITH CHECK (true);

-- ────────────────────────────────────────────────────────────────────
-- Seed data — 2 demo products for immediate demo use
-- ────────────────────────────────────────────────────────────────────
INSERT INTO products (
    product_name, craft_style, heritage_region, estimated_dimensions,
    materials_detected, craftsmanship_score, fair_price_inr, fair_price_usd,
    artisan_cut_percentage, marketing_story, tags, image_url, status
) VALUES
(
    'Imperial Cobalt Ceramic Vase',
    'Blue Pottery',
    'Kot Jewar, Jaipur, Rajasthan',
    '14" Height x 8" Diameter',
    'Quartz Stone Powder, Glass Powder, Cobalt oxide, Copper oxide, Natural glaze',
    98.4,
    12500,
    165,
    60,
    'Born from the blue-dust workshops of Kot Jewar, this vase carries the signature translucent turquoise glaze that once graced Mughal palace windows. Ram Swaroop, one of only seven remaining masters of lead-free cobalt glazing, spent six days shaping, painting, and kiln-firing this piece using a centuries-old formulation of quartz and crushed glass. For the discerning interior architect, it is not merely an object — it is an artifact of survival.',
    ARRAY['Ceramic', 'Blue Pottery', 'Jaipur', 'Natural Dyes', 'Lead-Free'],
    'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=600',
    'published'
),
(
    'Royal Gopuram Mulberry Silk Saree',
    'Kanjivaram Silk Weaving',
    'Kanchipuram, Tamil Nadu',
    '5.5 meters x 1.2 meters',
    '100% pure Mulberry Silk (Koral), Pure silver zari plated with 24k gold',
    99.2,
    84000,
    1099,
    64,
    'Meenakshi Sridhar spent fifteen days at her pit loom translating the geometric logic of Kanchipuram temple gopurams into silk and gold thread. The saree''s mukkani border — woven separately and lock-stitched to the body — is a technique so mathematically precise that fewer than thirty weavers in the district can execute it. Each thread of zari is real silver, electroplated with 24-carat gold, ensuring a luster that deepens rather than tarnishes with age.',
    ARRAY['Textiles', 'Kanjivaram Silk', 'Gold Zari', 'Handloom', 'Royal Wear'],
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
    'published'
);

-- ════════════════════════════════════════════════════════════════════
-- Verify: run SELECT * FROM products; to confirm seed data
-- ════════════════════════════════════════════════════════════════════

-- HastKala Migration: Add barter_listings, process_steps, update product status default
-- Run this in Supabase Dashboard → SQL Editor

-- 1. barter_listings table
CREATE TABLE IF NOT EXISTS barter_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id uuid REFERENCES artisans(id) ON DELETE SET NULL,
  poster_name text NOT NULL,
  poster_phone text,
  offer_skill text NOT NULL,
  need_skill text NOT NULL,
  description text,
  district text,
  language text NOT NULL DEFAULT 'en',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS barter_listings_status_idx ON barter_listings(status);
CREATE INDEX IF NOT EXISTS barter_listings_offer_idx ON barter_listings(offer_skill);
CREATE INDEX IF NOT EXISTS barter_listings_need_idx ON barter_listings(need_skill);

-- 2. process_steps table
CREATE TABLE IF NOT EXISTS process_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  video_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS process_steps_product_idx ON process_steps(product_id);

-- 3. Change products status default to 'approved'
ALTER TABLE products ALTER COLUMN status SET DEFAULT 'approved';

-- 4. Grant access to anon and authenticated roles
GRANT SELECT ON barter_listings TO anon, authenticated;
GRANT INSERT, UPDATE ON barter_listings TO authenticated;
GRANT SELECT ON process_steps TO anon, authenticated;
GRANT INSERT, DELETE ON process_steps TO authenticated;

-- 5. Enable RLS
ALTER TABLE barter_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies (open read, authenticated write)
CREATE POLICY "barter_listings_read" ON barter_listings FOR SELECT USING (true);
CREATE POLICY "barter_listings_insert" ON barter_listings FOR INSERT WITH CHECK (true);
CREATE POLICY "barter_listings_update" ON barter_listings FOR UPDATE USING (true);

CREATE POLICY "process_steps_read" ON process_steps FOR SELECT USING (true);
CREATE POLICY "process_steps_insert" ON process_steps FOR INSERT WITH CHECK (true);
CREATE POLICY "process_steps_delete" ON process_steps FOR DELETE USING (true);

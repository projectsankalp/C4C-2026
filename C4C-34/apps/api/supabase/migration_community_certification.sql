-- HastKala Community Certification Migration
-- Run in Supabase Dashboard → SQL Editor

-- 1. community_members
CREATE TABLE IF NOT EXISTS community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text UNIQUE,
  location text,
  skills text,
  language text NOT NULL DEFAULT 'en',
  stage text NOT NULL DEFAULT 'discover', -- discover | learn | contribute | certified | seller
  points integer NOT NULL DEFAULT 0,
  is_certified boolean NOT NULL DEFAULT false,
  certified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS community_members_phone_idx ON community_members(phone);
CREATE INDEX IF NOT EXISTS community_members_stage_idx ON community_members(stage);

-- 2. learning_modules
CREATE TABLE IF NOT EXISTS learning_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  content text,
  language text NOT NULL DEFAULT 'en',
  points_reward integer NOT NULL DEFAULT 50,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. module_completions
CREATE TABLE IF NOT EXISTS module_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(member_id, module_id)
);
CREATE INDEX IF NOT EXISTS module_completions_member_idx ON module_completions(member_id);

-- 4. certifications
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  cert_number text NOT NULL UNIQUE,
  issued_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Seed learning modules (3 core modules)
INSERT INTO learning_modules (title, description, content, points_reward, order_index) VALUES
  ('How to Price Your Product', 'Learn to calculate fair prices using material cost, labour, and profit margin.', 'Material cost + Labour hours × ₹50 + Packaging = Minimum price. Add 20–30% for profit.', 50, 1),
  ('How to Photograph Your Craft', 'Simple tips to take clear, attractive product photos using your phone.', 'Use natural light. Clean background. Take 3 angles: front, side, detail. No filters needed.', 50, 2),
  ('How to Package and Ship', 'Packaging builds trust. Learn simple, low-cost packaging that impresses buyers.', 'Use newspaper or cloth wrap. Add a handwritten thank-you note. Seal with tape. Label clearly.', 50, 3)
ON CONFLICT DO NOTHING;

-- 6. RLS
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_members_read" ON community_members FOR SELECT USING (true);
CREATE POLICY "community_members_insert" ON community_members FOR INSERT WITH CHECK (true);
CREATE POLICY "community_members_update" ON community_members FOR UPDATE USING (true);
CREATE POLICY "learning_modules_read" ON learning_modules FOR SELECT USING (true);
CREATE POLICY "module_completions_read" ON module_completions FOR SELECT USING (true);
CREATE POLICY "module_completions_insert" ON module_completions FOR INSERT WITH CHECK (true);
CREATE POLICY "certifications_read" ON certifications FOR SELECT USING (true);
CREATE POLICY "certifications_insert" ON certifications FOR INSERT WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON community_members TO anon, authenticated;
GRANT SELECT ON learning_modules TO anon, authenticated;
GRANT SELECT, INSERT ON module_completions TO anon, authenticated;
GRANT SELECT, INSERT ON certifications TO anon, authenticated;

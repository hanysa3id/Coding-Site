-- ============================================================
-- 2026-05-20: FAQ, Team Members, Milestone Sign-off, Payment Plan
-- ============================================================

-- 1. Service FAQs
CREATE TABLE IF NOT EXISTS service_faqs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id  uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  question_ar text NOT NULL,
  question_en text NOT NULL,
  answer_ar   text NOT NULL,
  answer_en   text NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS service_faqs_service_id_idx ON service_faqs(service_id);

ALTER TABLE service_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_faqs_public_read" ON service_faqs
  FOR SELECT USING (true);

CREATE POLICY "service_faqs_admin_all" ON service_faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff', 'sales')
    )
  );

-- 2. Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar     text NOT NULL,
  name_en     text NOT NULL,
  role_ar     text NOT NULL,
  role_en     text NOT NULL,
  bio_ar      text,
  bio_en      text,
  avatar_url  text,
  sort_order  integer NOT NULL DEFAULT 0,
  is_visible  boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_members_public_read" ON team_members
  FOR SELECT USING (is_visible = true);

CREATE POLICY "team_members_admin_all" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff', 'sales')
    )
  );

CREATE OR REPLACE FUNCTION update_team_members_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_team_members_updated_at();

-- 3. Milestone customer sign-off column
ALTER TABLE order_milestones
  ADD COLUMN IF NOT EXISTS customer_approved_at timestamptz;

-- 4. Payment plan on orders (jsonb array of installments)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_plan jsonb;

-- 5. About page settings seed (only if key not present)
INSERT INTO settings (key, value)
VALUES ('about', '{"mission_ar":"","mission_en":"","vision_ar":"","vision_en":"","stats":[]}')
ON CONFLICT (key) DO NOTHING;

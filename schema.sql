-- Kingdom of Cheria — Neon PostgreSQL schema

CREATE TABLE IF NOT EXISTS regions (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS ministers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  given_name TEXT NOT NULL,
  family_name TEXT NOT NULL,
  dob DATE NOT NULL,
  region TEXT NOT NULL REFERENCES regions (slug),
  email TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL DEFAULT '',
  terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE citizens ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'citizen';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'registered';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS review_note TEXT NOT NULL DEFAULT '';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS current_citizenship TEXT NOT NULL DEFAULT '';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS dual_citizenship_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS leadership_qualities TEXT NOT NULL DEFAULT '';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS join_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS knows_official BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS official_name TEXT NOT NULL DEFAULT '';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS recommendation TEXT NOT NULL DEFAULT '';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS blacklisted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS blacklist_note TEXT NOT NULL DEFAULT '';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS blacklisted_at TIMESTAMPTZ;

UPDATE citizens
SET applied_at = COALESCE(applied_at, created_at)
WHERE role IS DISTINCT FROM 'admin'
  AND status IN ('pending', 'approved', 'rejected')
  AND applied_at IS NULL;

INSERT INTO regions (slug, name) VALUES
  ('central_blossom', 'Central Blossom District'),
  ('eastern_woods', 'Eastern Redwood Expanse'),
  ('western_petals', 'Western Petal Shores'),
  ('northern_peaks', 'Northern Serene Peaks')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (slug, name, description) VALUES
  ('documentation', 'Official Documentation', 'Birth certificates, national identity cards, and passport applications.'),
  ('treasury', 'Treasury & Taxes', 'Declarations, payments, and seasonal levies.'),
  ('health', 'Health Ministry', 'Clinic appointments and wellness notices.'),
  ('heritage', 'Cultural Heritage', 'History and floral festivals of Cheria.')
ON CONFLICT (slug) DO NOTHING;

DELETE FROM ministers;
INSERT INTO ministers (name, title, sort_order) VALUES
  ('Charuhas Kantipudi', 'Cofather', 1),
  ('Arjun Saxena', 'Cofather', 2),
  ('Bhavin', 'Cofather', 3),
  ('Mario Martin', 'External Affairs Minister', 4),
  ('Srijip', 'Education Minister', 5),
  ('Shreekrishna', 'Content Creator Minister', 6),
  ('Shivam', 'Tech Minister', 7);

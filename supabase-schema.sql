-- =====================================================================
-- 🐾 PAW TRAILS — PRODUCTION SUPABASE SQL SCHEMA
-- Zero fake data / production-ready tables with indexes and constraints
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- =====================================================================

-- 1. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY DEFAULT 'admin-1',
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT DEFAULT 'Paw Trails Administrator',
  role TEXT DEFAULT 'superadmin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed production admin account (Default Password: admin123)
-- Change this in your admin dashboard after first login!
INSERT INTO admin_users (id, username, email, password, name, role)
VALUES (
  'admin-1',
  'admin',
  'admin@pawtrails.org',
  '$2b$10$D5yT8F3V7b8bDd.QM4Dgx.rU2WMZMdYMmtcEbKDjeaq1HKlGFyauC',
  'Paw Trails Administrator',
  'superadmin'
)
ON CONFLICT (id) DO UPDATE 
SET updated_at = NOW();

-- 2. IMPACT STATS TABLE
CREATE TABLE IF NOT EXISTS stats (
  id TEXT PRIMARY KEY DEFAULT 'main',
  animals_fed INTEGER DEFAULT 500,
  animals_rescued INTEGER DEFAULT 150,
  successful_adoptions INTEGER DEFAULT 80,
  volunteers_count INTEGER DEFAULT 50,
  monthly_meals_target INTEGER DEFAULT 1000,
  shelters_active INTEGER DEFAULT 12,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial real baseline stats row
INSERT INTO stats (id, animals_fed, animals_rescued, successful_adoptions, volunteers_count, monthly_meals_target, shelters_active)
VALUES ('main', 500, 150, 80, 50, 1000, 12)
ON CONFLICT (id) DO NOTHING;

-- 3. ANIMALS CATALOG
CREATE TABLE IF NOT EXISTS animals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'available', -- 'available' | 'in-progress' | 'adopted'
  status_display TEXT DEFAULT 'Available for Adoption',
  age TEXT,
  gender TEXT,
  breed TEXT DEFAULT 'Indie',
  location TEXT DEFAULT 'Pune',
  image TEXT,
  story TEXT,
  health TEXT,
  personality TEXT,
  rescued_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ADOPTION APPLICATIONS TABLE (Clean - No fake entries)
CREATE TABLE IF NOT EXISTS adoptions (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  animal_of_interest TEXT,
  address TEXT NOT NULL,
  why_adopt TEXT NOT NULL,
  pet_experience TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'under_review' | 'approved' | 'rejected'
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RESCUE & DISTRESS REPORTS TABLE (Clean - No fake entries)
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  location TEXT NOT NULL,
  animal_type TEXT NOT NULL,
  condition TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  status TEXT DEFAULT 'reported', -- 'reported' | 'investigating' | 'rescued' | 'closed'
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VOLUNTEER REGISTRATIONS TABLE (Clean - No fake entries)
CREATE TABLE IF NOT EXISTS volunteers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  preferred_date TEXT,
  number_of_people INTEGER DEFAULT 1,
  activity TEXT DEFAULT 'Feeding Dogs',
  message TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'confirmed' | 'attended' | 'cancelled'
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CONTACT INQUIRIES TABLE (Clean - No fake entries)
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT 'General Inquiry',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread', -- 'unread' | 'read' | 'replied'
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DONATIONS TABLE (Clean - No fake entries)
CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  donor_name TEXT NOT NULL DEFAULT 'Kind Supporter',
  email TEXT,
  phone TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  purpose TEXT DEFAULT 'Food & Rescue Fund',
  upi_ref TEXT,
  notes TEXT,
  payment_method TEXT DEFAULT 'UPI',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- PERFORMANCE INDEXES
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_adoptions_status ON adoptions(status);
CREATE INDEX IF NOT EXISTS idx_adoptions_email ON adoptions(email);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_condition ON reports(condition);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(status);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Service role key (used by Vercel backend) automatically bypasses RLS
-- =====================================================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Allow public read of animals and stats
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view animals' AND tablename = 'animals') THEN
    CREATE POLICY "Public can view animals" ON animals FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view stats' AND tablename = 'stats') THEN
    CREATE POLICY "Public can view stats" ON stats FOR SELECT USING (true);
  END IF;
END $$;

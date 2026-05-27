CREATE TABLE IF NOT EXISTS service_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (30, 60, 90)),
  price_credits INTEGER NOT NULL CHECK (price_credits >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_listings_mentor_id ON service_listings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_service_listings_status ON service_listings(status);

ALTER TABLE service_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Mentors can view their own service listings" ON service_listings;
DROP POLICY IF EXISTS "Mentors can create their own service listings" ON service_listings;
DROP POLICY IF EXISTS "Mentors can update their own service listings" ON service_listings;
DROP POLICY IF EXISTS "Mentors can delete their own service listings" ON service_listings;
DROP POLICY IF EXISTS "Active service listings are public" ON service_listings;

CREATE POLICY "Active service listings are public" ON service_listings
FOR SELECT
USING (status = 'active' OR auth.uid() = mentor_id);

CREATE POLICY "Mentors can create their own service listings" ON service_listings
FOR INSERT
WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Mentors can update their own service listings" ON service_listings
FOR UPDATE
USING (auth.uid() = mentor_id);

CREATE POLICY "Mentors can delete their own service listings" ON service_listings
FOR DELETE
USING (auth.uid() = mentor_id);

DROP TRIGGER IF EXISTS update_service_listings_updated_at ON service_listings;
CREATE TRIGGER update_service_listings_updated_at
BEFORE UPDATE ON service_listings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

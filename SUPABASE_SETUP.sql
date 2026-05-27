-- =====================================================
-- UniSkill Complete Database Setup
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/gmtitzdkeepvhtdovwuk/sql
-- =====================================================

-- =====================================================
-- PART 1: ENABLE EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PART 2: PROFILES TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  dob DATE,
  college TEXT,
  phone TEXT,
  college_email TEXT,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[],
  learning_goals TEXT[],
  credits INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_mentor BOOLEAN DEFAULT false,
  hourly_rate INTEGER DEFAULT 0,
  id_card_url TEXT,
  intro_video_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0,
  response_time INTEGER,
  -- OTP Verification Fields
  personal_email_verified BOOLEAN DEFAULT false,
  college_email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  verification_step INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 3: OTP VERIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  email VARCHAR(255),
  phone VARCHAR(50),
  otp VARCHAR(6) NOT NULL,
  otp_type VARCHAR(20) NOT NULL CHECK (otp_type IN (''personal_email'', ''college_email'', ''phone'', ''signup_complete'')),
  verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 4: SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  skill_category TEXT,
  scheduled_at TIMESTAMPTZ,
  duration INTEGER DEFAULT 60,
  price INTEGER NOT NULL,
  status TEXT DEFAULT ''pending'' CHECK (status IN (''pending'', ''confirmed'', ''in_progress'', ''completed'', ''cancelled'', ''disputed'')),
  room_id TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 5: TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN (''credit'', ''debit'', ''refund'', ''bonus'')),
  status TEXT DEFAULT ''completed'' CHECK (status IN (''pending'', ''completed'', ''failed'', ''refunded'')),
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 6: REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 7: SKILLS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 8: USER SKILLS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency TEXT DEFAULT ''beginner'' CHECK (proficiency IN (''beginner'', ''intermediate'', ''advanced'', ''expert'')),
  is_teaching BOOLEAN DEFAULT false,
  is_learning BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- =====================================================
-- PART 9: MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 10: NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 11: FAVORITES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  favorite_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, favorite_id)
);

-- =====================================================
-- PART 12: INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_sessions_mentor ON sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_session ON reviews(session_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- OTP Indexes
CREATE INDEX IF NOT EXISTS idx_otp_user ON otp_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone);

-- =====================================================
-- PART 13: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow insert OTP for signup" ON otp_verifications;
DROP POLICY IF EXISTS "Allow read OTP for verification" ON otp_verifications;
DROP POLICY IF EXISTS "Allow update OTP for verification" ON otp_verifications;
DROP POLICY IF EXISTS "Users can view sessions they are part of" ON sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their sessions" ON sessions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Service role can manage transactions" ON transactions;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view their favorites" ON favorites;
DROP POLICY IF EXISTS "Users can manage their favorites" ON favorites;
DROP POLICY IF EXISTS "User skills are viewable by everyone" ON user_skills;
DROP POLICY IF EXISTS "Users can manage their own skills" ON user_skills;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Service can read all profiles" ON profiles FOR SELECT USING (true);

-- OTP Verification Policies (Allow public insert for signup, service role for management)
CREATE POLICY "Allow OTP insert" ON otp_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow OTP select" ON otp_verifications FOR SELECT USING (true);
CREATE POLICY "Allow OTP update" ON otp_verifications FOR UPDATE USING (true);
CREATE POLICY "Service can delete OTP" ON otp_verifications FOR DELETE USING (true);

-- Sessions Policies
CREATE POLICY "Sessions are viewable by participants" ON sessions FOR SELECT USING (auth.uid() = mentor_id OR auth.uid() = student_id);
CREATE POLICY "Users can create sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = mentor_id OR auth.uid() = student_id);
CREATE POLICY "Users can update their sessions" ON sessions FOR UPDATE USING (auth.uid() = mentor_id OR auth.uid() = student_id);
CREATE POLICY "Service can manage sessions" ON sessions FOR ALL USING (true);

-- Transactions Policies
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage transactions" ON transactions FOR ALL USING (true);

-- Reviews Policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Service can manage reviews" ON reviews FOR ALL USING (true);

-- Messages Policies
CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications Policies
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Favorites Policies
CREATE POLICY "Users can view their favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- User Skills Policies
CREATE POLICY "User skills are viewable by everyone" ON user_skills FOR SELECT USING (true);
CREATE POLICY "Users can manage their own skills" ON user_skills FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- PART 14: FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
BEFORE UPDATE ON profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at 
BEFORE UPDATE ON sessions 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>''full_name'',
      NEW.raw_user_meta_data->>''name'',
      NEW.raw_user_meta_data->>''user_name'',
      ''User''
    ),
    NEW.raw_user_meta_data->>''avatar_url''
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(
      EXCLUDED.name,
      profiles.name
    ),
    avatar_url = COALESCE(
      EXCLUDED.avatar_url,
      profiles.avatar_url
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql security definer;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_verifications WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 15: SEED DATA - Skills Categories
-- =====================================================
INSERT INTO skills (name, category, icon) VALUES
  (''Web Development'', ''Technology'', ''code''),
  (''Mobile Development'', ''Technology'', ''smartphone''),
  (''Data Science'', ''Technology'', ''database''),
  (''Machine Learning'', ''Technology'', ''cpu''),
  (''AI & Deep Learning'', ''Technology'', ''brain''),
  (''UI/UX Design'', ''Design'', ''palette''),
  (''Graphic Design'', ''Design'', ''image''),
  (''Mathematics'', ''Academics'', ''calculator''),
  (''Physics'', ''Academics'', ''atom''),
  (''Chemistry'', ''Academics'', ''flask''),
  (''English'', ''Languages'', ''globe''),
  (''Spanish'', ''Languages'', ''globe''),
  (''French'', ''Languages'', ''globe''),
  (''Music Production'', ''Arts'', ''music''),
  (''Photography'', ''Arts'', ''camera''),
  (''Public Speaking'', ''Soft Skills'', ''mic''),
  (''Leadership'', ''Soft Skills'', ''users''),
  (''Python Programming'', ''Technology'', ''code''),
  (''JavaScript'', ''Technology'', ''code''),
  (''React.js'', ''Technology'', ''code'')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- COMPLETE!
-- =====================================================
SELECT ''UniSkill Database Setup Complete!'' AS status;

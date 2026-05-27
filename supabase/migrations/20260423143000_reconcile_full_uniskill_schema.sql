-- ============================================================================
-- UniSkill Full Schema Reconciliation
-- Creates and reconciles both the legacy schema and the current live schema.
-- Safe to run multiple times.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  CREATE TYPE user_verification_status AS ENUM ('unverified', 'pending_review', 'verified', 'rejected', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'mentor', 'admin', 'system');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS college_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS learning_goals TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills_offered TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills_desired TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits_balance DECIMAL(12,2) DEFAULT 100.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earned INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lifetime_earnings DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_mentor BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hourly_rate INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS id_card_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS intro_video_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS response_rate DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS response_time INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_score DECIMAL(3,2) DEFAULT 5.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_sessions_completed INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_status user_verification_status DEFAULT 'unverified';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_role user_role DEFAULT 'student';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS personal_email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS college_email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_otp VARCHAR(6);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_step INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  ALTER TABLE profiles ALTER COLUMN display_name SET DEFAULT 'User';
EXCEPTION
  WHEN others THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE profiles ALTER COLUMN metadata SET DEFAULT '{}'::JSONB;
EXCEPTION
  WHEN others THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique ON profiles(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique ON profiles(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_college ON profiles(college);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_skills_offered ON profiles USING GIN (skills_offered);
CREATE INDEX IF NOT EXISTS idx_profiles_skills_desired ON profiles USING GIN (skills_desired);
CREATE INDEX IF NOT EXISTS idx_profiles_metadata ON profiles USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON profiles(primary_role, current_status);

CREATE TABLE IF NOT EXISTS user_verification_vault (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_legal_name TEXT,
  college_name TEXT,
  college_email TEXT UNIQUE,
  phone_number TEXT UNIQUE,
  identity_document_url TEXT,
  document_type TEXT,
  submission_count INTEGER DEFAULT 1,
  reviewer_notes TEXT,
  verified_at TIMESTAMPTZ,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_college_email_verified BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vault_college_email ON user_verification_vault(college_email);

CREATE TABLE IF NOT EXISTS user_audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  skill_category TEXT,
  scheduled_at TIMESTAMPTZ,
  duration INTEGER DEFAULT 60,
  price INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed')),
  room_id TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_mentor ON sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'refund', 'bonus')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE skills ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS student TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 5.0;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE skills ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS shadow TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS idx_skills_name_unique ON skills(name) WHERE name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);

CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency TEXT DEFAULT 'beginner' CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
  is_teaching BOOLEAN DEFAULT FALSE,
  is_learning BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  favorite_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, favorite_id)
);

CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email VARCHAR(255),
  phone VARCHAR(50),
  otp VARCHAR(6) NOT NULL,
  otp_type VARCHAR(20) NOT NULL CHECK (otp_type IN ('personal_email', 'college_email', 'phone', 'signup_complete')),
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_user ON otp_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone);

CREATE TABLE IF NOT EXISTS signup_details (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  college TEXT,
  college_email TEXT,
  phone TEXT,
  id_card_url TEXT,
  personal_email_verified BOOLEAN DEFAULT FALSE,
  college_email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  verification_step INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM otp_verifications WHERE expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_audit_profile_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_audit_log (user_id, changed_by, action, table_name, old_data, new_data)
  VALUES (
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_uniskill_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id,
    email,
    name,
    display_name,
    avatar_url,
    college,
    college_email,
    phone,
    credits,
    credits_balance,
    is_verified,
    current_status,
    metadata
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'user_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'user_name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'college',
    NEW.raw_user_meta_data->>'college_email',
    NEW.raw_user_meta_data->>'phone',
    100,
    100.00,
    FALSE,
    'unverified',
    jsonb_build_object('signup_source', 'auth_trigger', 'onboarding_step', 1)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(profiles.name, EXCLUDED.name),
    display_name = COALESCE(profiles.display_name, EXCLUDED.display_name),
    college = COALESCE(profiles.college, EXCLUDED.college),
    college_email = COALESCE(profiles.college_email, EXCLUDED.college_email),
    phone = COALESCE(profiles.phone, EXCLUDED.phone),
    avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url);

  INSERT INTO user_verification_vault (
    id,
    full_legal_name,
    college_name,
    college_email,
    phone_number
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'college',
    NEW.raw_user_meta_data->>'college_email',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_legal_name = COALESCE(user_verification_vault.full_legal_name, EXCLUDED.full_legal_name),
    college_name = COALESCE(user_verification_vault.college_name, EXCLUDED.college_name),
    college_email = COALESCE(user_verification_vault.college_email, EXCLUDED.college_email),
    phone_number = COALESCE(user_verification_vault.phone_number, EXCLUDED.phone_number);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verification_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE signup_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are publicly visible" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile." ON profiles;
CREATE POLICY "Profiles are publicly visible" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Vault is strictly private" ON user_verification_vault;
DROP POLICY IF EXISTS "Vault insert during signup" ON user_verification_vault;
DROP POLICY IF EXISTS "Vault update by owner" ON user_verification_vault;
CREATE POLICY "Vault is strictly private" ON user_verification_vault FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Vault insert during signup" ON user_verification_vault FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Vault update by owner" ON user_verification_vault FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Audit logs restricted" ON user_audit_log;
CREATE POLICY "Audit logs restricted" ON user_audit_log
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid() AND primary_role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can view sessions they're part of" ON sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their sessions" ON sessions;
CREATE POLICY "Users can view sessions they're part of" ON sessions FOR SELECT USING (auth.uid() = mentor_id OR auth.uid() = student_id);
CREATE POLICY "Users can create sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = mentor_id OR auth.uid() = student_id);
CREATE POLICY "Users can update their sessions" ON sessions FOR UPDATE USING (auth.uid() = mentor_id OR auth.uid() = student_id);

DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Service role can manage transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions." ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions." ON transactions;
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage transactions" ON transactions FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Skills are viewable by everyone." ON skills;
DROP POLICY IF EXISTS "Users can insert their own skills." ON skills;
DROP POLICY IF EXISTS "Users can update their own skills." ON skills;
CREATE POLICY "Skills are viewable by everyone" ON skills FOR SELECT USING (true);
CREATE POLICY "Users can insert their own skills" ON skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own skills" ON skills FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "User skills are viewable by everyone" ON user_skills;
DROP POLICY IF EXISTS "Users can manage their own skills" ON user_skills;
CREATE POLICY "User skills are viewable by everyone" ON user_skills FOR SELECT USING (true);
CREATE POLICY "Users can manage their own skills" ON user_skills FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their favorites" ON favorites;
DROP POLICY IF EXISTS "Users can manage their favorites" ON favorites;
CREATE POLICY "Users can view their favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own OTP records" ON otp_verifications;
DROP POLICY IF EXISTS "Service can manage OTP records" ON otp_verifications;
DROP POLICY IF EXISTS "Allow insert OTP for signup" ON otp_verifications;
DROP POLICY IF EXISTS "Allow read OTP for verification" ON otp_verifications;
DROP POLICY IF EXISTS "Allow update OTP for verification" ON otp_verifications;
CREATE POLICY "Allow insert OTP for signup" ON otp_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read OTP for verification" ON otp_verifications FOR SELECT USING (true);
CREATE POLICY "Allow update OTP for verification" ON otp_verifications FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can view their own signup details" ON signup_details;
DROP POLICY IF EXISTS "Users can insert their own signup details" ON signup_details;
DROP POLICY IF EXISTS "Users can update their own signup details" ON signup_details;
CREATE POLICY "Users can view their own signup details" ON signup_details FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own signup details" ON signup_details FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own signup details" ON signup_details FOR UPDATE USING (auth.uid() = id);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_signup_details_updated_at ON signup_details;
CREATE TRIGGER update_signup_details_updated_at
BEFORE UPDATE ON signup_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS cleanup_expired_otps_trigger ON otp_verifications;
CREATE TRIGGER cleanup_expired_otps_trigger
AFTER INSERT ON otp_verifications
FOR EACH STATEMENT EXECUTE FUNCTION cleanup_expired_otps();

DROP TRIGGER IF EXISTS tr_audit_profiles ON profiles;
CREATE TRIGGER tr_audit_profiles
AFTER UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION fn_audit_profile_change();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_uniskill_user_signup();

INSERT INTO skills (name, category, icon)
SELECT seed.name, seed.category, seed.icon
FROM (
  VALUES
    ('Web Development', 'Technology', 'code'),
    ('Mobile Development', 'Technology', 'smartphone'),
    ('Data Science', 'Technology', 'database'),
    ('Machine Learning', 'Technology', 'cpu'),
    ('UI/UX Design', 'Design', 'palette'),
    ('Graphic Design', 'Design', 'image'),
    ('Mathematics', 'Academics', 'calculator'),
    ('Physics', 'Academics', 'atom'),
    ('Chemistry', 'Academics', 'flask'),
    ('English', 'Languages', 'globe'),
    ('Spanish', 'Languages', 'globe'),
    ('French', 'Languages', 'globe'),
    ('Music Production', 'Arts', 'music'),
    ('Photography', 'Arts', 'camera'),
    ('Public Speaking', 'Soft Skills', 'mic'),
    ('Leadership', 'Soft Skills', 'users')
) AS seed(name, category, icon)
WHERE NOT EXISTS (
  SELECT 1
  FROM skills
  WHERE skills.name = seed.name
);

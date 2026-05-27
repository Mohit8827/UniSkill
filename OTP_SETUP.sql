-- UniSkill OTP Table Setup
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/gmtitzdkeepvhtdovwuk/sql

-- Create OTP verification table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  email VARCHAR(255),
  phone VARCHAR(50),
  otp VARCHAR(6) NOT NULL,
  otp_type VARCHAR(20) NOT NULL CHECK (otp_type IN ('personal_email', 'college_email', 'phone', 'signup_complete')),
  verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_otp_user ON otp_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone);

-- RLS
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Policies - Allow all operations for signup/verification
DROP POLICY IF EXISTS "Allow OTP insert" ON otp_verifications;
CREATE POLICY "Allow OTP insert" ON otp_verifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow OTP select" ON otp_verifications;
CREATE POLICY "Allow OTP select" ON otp_verifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow OTP update" ON otp_verifications;
CREATE POLICY "Allow OTP update" ON otp_verifications FOR UPDATE USING (true);

-- Add verification columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'personal_email_verified') THEN
    ALTER TABLE profiles ADD COLUMN personal_email_verified BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'college_email_verified') THEN
    ALTER TABLE profiles ADD COLUMN college_email_verified BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone_verified') THEN
    ALTER TABLE profiles ADD COLUMN phone_verified BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verification_step') THEN
    ALTER TABLE profiles ADD COLUMN verification_step INTEGER DEFAULT 1;
  END IF;
END $$;

-- Enable Google OAuth in Supabase Auth (you need to configure this in Supabase Dashboard)
-- 1. Go to: Authentication > Providers > Google
-- 2. Enable Google provider
-- 3. Add your Google OAuth credentials (Client ID and Client Secret)
-- 4. Set redirect URL to: https://gmtitzdkeepvhtdovwuk.supabase.co/auth/v1/callback

-- Enable GitHub OAuth in Supabase Auth
-- 1. Go to: Authentication > Providers > GitHub
-- 2. Enable GitHub provider
-- 3. Add your GitHub OAuth credentials
-- 4. Set callback URL to: https://gmtitzdkeepvhtdovwuk.supabase.co/auth/v1/callback

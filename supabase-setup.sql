-- UniSkill Database Setup for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  dob TEXT,
  college TEXT,
  college_email TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT \'{}\'::TEXT[],
  learning_goals TEXT[] DEFAULT \'{}\'::TEXT[],
  credits NUMERIC DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_mentor BOOLEAN DEFAULT FALSE,
  hourly_rate NUMERIC DEFAULT 0,
  id_card_url TEXT,
  intro_video_url TEXT,
  rating NUMERIC DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  response_rate NUMERIC DEFAULT 0,
  response_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  personal_email_verified BOOLEAN DEFAULT FALSE,
  college_email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  verification_step INTEGER DEFAULT 0
);

-- Create profiles index
CREATE INDEX IF NOT EXISTS idx_profiles_college ON profiles(college);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);


CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid() = owner);

CREATE POLICY "Users can view documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents' AND auth.uid() = owner);


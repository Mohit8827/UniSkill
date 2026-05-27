-- =====================================================
-- FIX: Harden Profile RLS Policies
-- =====================================================

-- 1. Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Profiles are publicly visible" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- 3. Create hardened policies
-- SELECT: Everyone can view profiles
CREATE POLICY "Profiles are publicly visible" 
ON profiles FOR SELECT 
USING (true);

-- UPDATE: Users can update their own profile (added WITH CHECK for security)
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- INSERT: Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

/*
  # Add admin access and profile system

  ## Overview
  - Adds admin-check helper function based on auth user metadata (`is_admin`)
  - Adds user_profiles table for admin user management (including suspension)
  - Tightens story and MPASI write access to admin only
  - Adds admin read access policies for analytics across app data tables
*/

-- Admin helper function based on JWT metadata
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false)
$$;

-- User profile table for admin management
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Keep profiles in sync with new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Backfill existing users
INSERT INTO public.user_profiles (id, email, full_name)
SELECT
  id,
  COALESCE(email, ''),
  COALESCE(raw_user_meta_data ->> 'full_name', '')
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;

-- user_profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Restrict stories write operations to admins only
DROP POLICY IF EXISTS "Authenticated users can insert stories" ON stories;
DROP POLICY IF EXISTS "Admins can insert stories" ON stories;
DROP POLICY IF EXISTS "Admins can update stories" ON stories;
DROP POLICY IF EXISTS "Admins can delete stories" ON stories;

CREATE POLICY "Admins can insert stories"
  ON stories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update stories"
  ON stories FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete stories"
  ON stories FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Allow admin write on MPASI recipes (public read remains)
DROP POLICY IF EXISTS "Admins can insert MPASI recipes" ON mpasi_recipes;
DROP POLICY IF EXISTS "Admins can update MPASI recipes" ON mpasi_recipes;
DROP POLICY IF EXISTS "Admins can delete MPASI recipes" ON mpasi_recipes;

CREATE POLICY "Admins can insert MPASI recipes"
  ON mpasi_recipes FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update MPASI recipes"
  ON mpasi_recipes FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete MPASI recipes"
  ON mpasi_recipes FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Admin analytics read access across all relevant data
DROP POLICY IF EXISTS "Admins can view all children" ON children;
DROP POLICY IF EXISTS "Admins can view all reading logs" ON reading_logs;
DROP POLICY IF EXISTS "Admins can view all growth records" ON growth_records;
DROP POLICY IF EXISTS "Admins can view all immunization records" ON immunization_records;
DROP POLICY IF EXISTS "Admins can view all activity photos" ON activity_photos;

CREATE POLICY "Admins can view all children"
  ON children FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can view all reading logs"
  ON reading_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can view all growth records"
  ON growth_records FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can view all immunization records"
  ON immunization_records FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can view all activity photos"
  ON activity_photos FOR SELECT
  TO authenticated
  USING (public.is_admin());

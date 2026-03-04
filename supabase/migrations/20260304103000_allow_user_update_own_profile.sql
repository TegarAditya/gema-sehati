/*
  # Allow users to update their own profile

  ## Overview
  - Adds RLS update policy so authenticated users can edit their own row in `user_profiles`
*/

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

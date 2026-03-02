/*
  # Add MPASI (Makanan Pengganti ASI) Recipes Table

  ## Overview
  This migration adds a comprehensive recipe system for introducing complementary foods
  to infants. MPASI is essential nutrition for child development.

  ## New Table

  ### mpasi_recipes
  Stores MPASI recipes organized by age groups and nutritional categories
  - `id` (uuid, primary key)
  - `title` (text) - Recipe name
  - `age_group` (text) - Target age (6-8, 8-10, 10-12 months)
  - `category` (text) - Type of recipe (puree, porridge, finger foods, etc.)
  - `ingredients` (text) - Ingredient list
  - `instructions` (text) - Step-by-step preparation
  - `nutrition_info` (text) - Nutritional value information
  - `allergenic_warning` (text) - Potential allergens
  - `prep_time_minutes` (integer)
  - `servings` (integer)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS for public read access
  - MPASI recipes are public knowledge resources
*/

CREATE TABLE IF NOT EXISTS mpasi_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  age_group text NOT NULL CHECK (age_group IN ('6-8', '8-10', '10-12')),
  category text NOT NULL,
  ingredients text NOT NULL,
  instructions text NOT NULL,
  nutrition_info text NOT NULL,
  allergenic_warning text DEFAULT '',
  prep_time_minutes integer DEFAULT 15,
  servings integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mpasi_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view MPASI recipes"
  ON mpasi_recipes FOR SELECT
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_mpasi_age_group ON mpasi_recipes(age_group);
CREATE INDEX IF NOT EXISTS idx_mpasi_category ON mpasi_recipes(category);

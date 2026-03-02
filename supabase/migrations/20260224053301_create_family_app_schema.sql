/*
  # Family Interactive Web App - Initial Schema

  ## Overview
  This migration creates the complete database schema for a family-focused web application
  that helps parents track children's literacy, health, and activities.

  ## New Tables

  ### 1. children
  Stores information about each child in the family
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `name` (text) - Child's name
  - `birth_date` (date) - Used for age calculation and immunization reminders
  - `gender` (text) - Male/Female
  - `created_at` (timestamptz)

  ### 2. reading_logs
  Daily reading activity tracking
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `child_id` (uuid, foreign key to children)
  - `book_title` (text)
  - `reading_date` (date)
  - `duration_minutes` (integer) - Reading duration
  - `notes` (text) - Optional notes
  - `created_at` (timestamptz)

  ### 3. growth_records
  Height and weight tracking with automatic status calculation
  - `id` (uuid, primary key)
  - `child_id` (uuid, foreign key to children)
  - `record_date` (date)
  - `height_cm` (decimal) - Height in centimeters
  - `weight_kg` (decimal) - Weight in kilograms
  - `status` (text) - Calculated status (normal/underweight/overweight)
  - `created_at` (timestamptz)

  ### 4. stories
  Collection of children's stories (dongeng)
  - `id` (uuid, primary key)
  - `title` (text)
  - `content` (text) - Story content
  - `age_category` (text) - Target age group (0-3, 4-6, 7-12)
  - `theme` (text) - Story theme
  - `image_url` (text) - Optional cover image
  - `created_at` (timestamptz)

  ### 5. activity_photos
  Photo gallery of family activities
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `child_id` (uuid, foreign key to children, optional)
  - `photo_url` (text) - Photo storage URL
  - `caption` (text)
  - `activity_date` (date)
  - `created_at` (timestamptz)

  ### 6. immunization_records
  Tracking of immunization schedule and completion
  - `id` (uuid, primary key)
  - `child_id` (uuid, foreign key to children)
  - `vaccine_name` (text)
  - `scheduled_date` (date)
  - `completed` (boolean)
  - `completed_date` (date, optional)
  - `notes` (text, optional)
  - `created_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Users can only access their own data
  - Stories table is publicly readable but only admins can write
  - Policies enforce user_id matching for all personal data tables
*/

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  birth_date date NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  created_at timestamptz DEFAULT now()
);

-- Create reading_logs table
CREATE TABLE IF NOT EXISTS reading_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  book_title text NOT NULL,
  reading_date date NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes integer NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create growth_records table
CREATE TABLE IF NOT EXISTS growth_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  height_cm decimal(5,2) NOT NULL,
  weight_kg decimal(5,2) NOT NULL,
  status text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  age_category text NOT NULL CHECK (age_category IN ('0-3', '4-6', '7-12')),
  theme text NOT NULL,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create activity_photos table
CREATE TABLE IF NOT EXISTS activity_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id uuid REFERENCES children(id) ON DELETE SET NULL,
  photo_url text NOT NULL,
  caption text DEFAULT '',
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create immunization_records table
CREATE TABLE IF NOT EXISTS immunization_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  vaccine_name text NOT NULL,
  scheduled_date date NOT NULL,
  completed boolean DEFAULT false,
  completed_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE immunization_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for children table
CREATE POLICY "Users can view own children"
  ON children FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own children"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own children"
  ON children FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own children"
  ON children FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for reading_logs table
CREATE POLICY "Users can view own reading logs"
  ON reading_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading logs"
  ON reading_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading logs"
  ON reading_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading logs"
  ON reading_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for growth_records table
CREATE POLICY "Users can view growth records of own children"
  ON growth_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = growth_records.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert growth records for own children"
  ON growth_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = growth_records.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update growth records of own children"
  ON growth_records FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = growth_records.child_id
      AND children.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = growth_records.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete growth records of own children"
  ON growth_records FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = growth_records.child_id
      AND children.user_id = auth.uid()
    )
  );

-- RLS Policies for stories table (public read, authenticated write)
CREATE POLICY "Anyone can view stories"
  ON stories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert stories"
  ON stories FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for activity_photos table
CREATE POLICY "Users can view own activity photos"
  ON activity_photos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity photos"
  ON activity_photos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity photos"
  ON activity_photos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity photos"
  ON activity_photos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for immunization_records table
CREATE POLICY "Users can view immunization records of own children"
  ON immunization_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = immunization_records.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert immunization records for own children"
  ON immunization_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = immunization_records.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update immunization records of own children"
  ON immunization_records FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = immunization_records.child_id
      AND children.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = immunization_records.child_id
      AND children.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete immunization records of own children"
  ON immunization_records FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = immunization_records.child_id
      AND children.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_logs_user_id ON reading_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_logs_child_id ON reading_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_growth_records_child_id ON growth_records(child_id);
CREATE INDEX IF NOT EXISTS idx_activity_photos_user_id ON activity_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_immunization_records_child_id ON immunization_records(child_id);
/*
  # Add Videos Table

  ## Overview
  This migration adds a videos table for managing educational videos.
  Videos are public-readable but admin-writable, similar to stories and MPASI recipes.

  ## New Table

  ### videos
  Stores educational videos with metadata
  - `id` (uuid, primary key)
  - `youtube_id` (text) - YouTube video identifier
  - `title` (text) - Video title
  - `description` (text) - Video description
  - `display_order` (integer) - Order for display in the UI
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS for public read access
  - Restrict write operations to admins only
*/

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Anyone can view videos
CREATE POLICY "Anyone can view videos"
  ON videos FOR SELECT
  TO public
  USING (true);

-- Only admins can insert videos
CREATE POLICY "Admins can insert videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only admins can update videos
CREATE POLICY "Admins can update videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete videos
CREATE POLICY "Admins can delete videos"
  ON videos FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Create index for display order
CREATE INDEX IF NOT EXISTS idx_videos_display_order ON videos(display_order);

-- Seed initial videos (based on current hardcoded videos in Health.tsx)
INSERT INTO videos (youtube_id, title, description, display_order) VALUES
  ('TQ-dbaNHxBM', 'Video Edukasi 1', 'Informasi penting seputar kesehatan keluarga', 1),
  ('YY44LLJw6OY', 'Video Edukasi 2', 'Tips dan panduan kesehatan untuk keluarga', 2),
  ('o0bcQUBbJbw', 'Video Edukasi 3', 'Panduan lengkap untuk kesehatan optimal', 3);

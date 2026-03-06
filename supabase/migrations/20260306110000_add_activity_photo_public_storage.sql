/*
  # Add activity photo public storage support

  ## Changes
  - Add `storage_path` column to `activity_photos`
  - Create public storage bucket `activity-photos`
  - Add storage policies so authenticated users can only write/delete their own objects
*/

ALTER TABLE activity_photos
ADD COLUMN IF NOT EXISTS storage_path text;

CREATE INDEX IF NOT EXISTS idx_activity_photos_storage_path
ON activity_photos(storage_path);

INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-photos', 'activity-photos', true)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;

CREATE POLICY "Users can upload own activity photo objects"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'activity-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own activity photo objects"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'activity-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'activity-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own activity photo objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'activity-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

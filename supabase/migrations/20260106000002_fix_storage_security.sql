-- =============================================
-- CRITICAL: STORAGE BUCKET SECURITY FIX
-- Run this in Supabase SQL Editor immediately!
-- =============================================

-- This fixes the vulnerability where anyone can list all files in the storage bucket

-- Step 1: Drop ALL existing policies on storage.objects for recordings bucket
DROP POLICY IF EXISTS "Public read access for recordings" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload recordings to bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read of specific recording files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read recording files directly" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own recording files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read shared recording files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own recording files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to recordings bucket" ON storage.objects;

-- Step 2: Create secure storage policies

-- Policy: Authenticated users can read their own files
CREATE POLICY "Users can read own recording files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Public can read files from public recordings only
-- This requires a lookup to the recordings table
CREATE POLICY "Public can read shared recording files"
ON storage.objects
FOR SELECT
TO anon
USING (
  bucket_id = 'recordings'
  AND EXISTS (
    SELECT 1 FROM public.recordings r
    WHERE r.is_public = true
    AND r.user_id::text = (storage.foldername(name))[1]
    AND r.filename = (storage.filename(name))
  )
);

-- Policy: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Authenticated users can delete their own files
CREATE POLICY "Users can delete own recording files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================
-- IMPORTANT: Also update bucket settings
-- Go to Supabase Dashboard > Storage > recordings bucket
-- And ensure "Public bucket" is set appropriately
-- =============================================

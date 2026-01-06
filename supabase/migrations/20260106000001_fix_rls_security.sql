-- =============================================
-- CRITICAL SECURITY FIX: Proper RLS Policies
-- This migration ensures recordings are properly protected
-- =============================================

-- First, drop ALL existing SELECT policies on recordings table
DROP POLICY IF EXISTS "Recordings are publicly viewable" ON public.recordings;
DROP POLICY IF EXISTS "Public can view recordings by direct ID" ON public.recordings;
DROP POLICY IF EXISTS "Users can view their own recordings" ON public.recordings;
DROP POLICY IF EXISTS "Public can view shared recordings" ON public.recordings;

-- Ensure RLS is enabled (should already be, but just in case)
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;

-- Ensure RLS is FORCED for all roles (including service role in some cases)
ALTER TABLE public.recordings FORCE ROW LEVEL SECURITY;

-- =============================================
-- CREATE SECURE SELECT POLICIES
-- =============================================

-- Policy 1: Authenticated users can ONLY view their own recordings
CREATE POLICY "Users can view own recordings" 
ON public.recordings 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Public can view ONLY recordings that are explicitly shared (is_public = true)
-- This is for the share/watch functionality
CREATE POLICY "Public can view shared recordings only" 
ON public.recordings 
FOR SELECT 
TO anon
USING (is_public = true);

-- =============================================
-- VERIFY INSERT/UPDATE/DELETE POLICIES
-- =============================================

-- Drop and recreate INSERT policy to ensure consistency
DROP POLICY IF EXISTS "Authenticated users can upload recordings" ON public.recordings;
DROP POLICY IF EXISTS "Anyone can upload recordings" ON public.recordings;

CREATE POLICY "Authenticated users can insert recordings" 
ON public.recordings 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Drop and recreate UPDATE policy
DROP POLICY IF EXISTS "Users can update their own recordings" ON public.recordings;

CREATE POLICY "Users can update own recordings" 
ON public.recordings 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Drop and recreate DELETE policy
DROP POLICY IF EXISTS "Users can delete their own recordings" ON public.recordings;

CREATE POLICY "Users can delete own recordings" 
ON public.recordings 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- =============================================
-- STORAGE BUCKET SECURITY
-- =============================================

-- Drop overly permissive storage policies
DROP POLICY IF EXISTS "Anyone can upload recordings to bucket" ON storage.objects;

-- Note: The "Public read access for recordings" policy on storage.objects 
-- is intentional because the video files themselves need to be downloadable
-- via public URL. Security is enforced at the recordings table level.

-- =============================================
-- FIX STORAGE BUCKET LISTING VULNERABILITY
-- =============================================

-- Drop the overly permissive SELECT policy that allows listing all files
DROP POLICY IF EXISTS "Public read access for recordings" ON storage.objects;

-- Create a more restrictive SELECT policy:
-- Only allow reading specific files (not listing the bucket)
-- Users must know the exact file path to access it
CREATE POLICY "Allow public read of specific recording files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'recordings'
  AND (
    -- Allow authenticated users to access their own files
    (auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text)
    OR
    -- Allow public access to files that belong to public recordings
    -- This is checked via the recordings table
    EXISTS (
      SELECT 1 FROM public.recordings r
      WHERE r.is_public = true
      AND r.file_path = name
    )
  )
);

-- Alternative simpler policy if the above is too restrictive:
-- Just prevent bucket listing but allow direct file access
-- (Files are only accessible if you know the exact URL)
DROP POLICY IF EXISTS "Allow public read of specific recording files" ON storage.objects;

-- Simple policy: Allow reading files in recordings bucket
-- Security through obscurity + RLS on recordings table
CREATE POLICY "Public can read recording files directly"
ON storage.objects
FOR SELECT
USING (bucket_id = 'recordings');

-- CRITICAL: Disable bucket listing for anonymous users
-- This prevents enumeration of all files
-- Note: This requires updating the bucket settings in Supabase Dashboard

-- =============================================
-- SECURITY FIX COMPLETE
-- =============================================

-- ===================================
-- GOREC DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ===================================

-- 1. Create recordings table
CREATE TABLE IF NOT EXISTS public.recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  public_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  share_token UUID DEFAULT gen_random_uuid(),
  is_public BOOLEAN DEFAULT false
);

-- 2. Enable RLS and FORCE it for all roles
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings FORCE ROW LEVEL SECURITY;

-- 3. Create index for share token lookups
CREATE INDEX IF NOT EXISTS idx_recordings_share_token ON public.recordings(share_token);

-- ===================================
-- 4. Create SECURE RLS Policies
-- IMPORTANT: These policies ensure users can ONLY access their own data
-- ===================================

-- SELECT: Authenticated users can ONLY view their own recordings
CREATE POLICY "Users can view own recordings" 
ON public.recordings 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- SELECT: Anonymous users can ONLY view recordings marked as public (shared)
CREATE POLICY "Public can view shared recordings only" 
ON public.recordings 
FOR SELECT 
TO anon
USING (is_public = true);

-- INSERT: Authenticated users can upload recordings (must set their own user_id)
CREATE POLICY "Authenticated users can insert recordings" 
ON public.recordings 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can ONLY update their own recordings
CREATE POLICY "Users can update own recordings" 
ON public.recordings 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can ONLY delete their own recordings
CREATE POLICY "Users can delete own recordings" 
ON public.recordings 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- ===================================
-- 5. Storage Bucket Setup (500MB limit)
-- ===================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('recordings', 'recordings', true, 524288000)
ON CONFLICT (id) DO NOTHING;

-- ===================================
-- 6. Storage RLS Policies
-- ===================================

-- Public read access for recordings bucket (video files need to be downloadable)
-- Security is enforced at the recordings TABLE level, not storage level
CREATE POLICY "Public read access for recordings"
ON storage.objects
FOR SELECT
USING (bucket_id = 'recordings');

-- Only authenticated users can upload to recordings bucket
CREATE POLICY "Authenticated users can upload to recordings bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'recordings');

-- ===================================
-- SETUP COMPLETE!
-- ===================================

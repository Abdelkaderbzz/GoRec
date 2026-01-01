-- ===================================
-- SCREENREC DATABASE SETUP
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

-- 2. Enable RLS
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;

-- 3. Create index for share token lookups
CREATE INDEX IF NOT EXISTS idx_recordings_share_token ON public.recordings(share_token);

-- 4. Create RLS Policies

-- Users can view their own recordings
CREATE POLICY "Users can view their own recordings" 
ON public.recordings 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Anyone can view shared recordings (public)
CREATE POLICY "Public can view shared recordings" 
ON public.recordings 
FOR SELECT 
USING (is_public = true);

-- Authenticated users can upload recordings
CREATE POLICY "Authenticated users can upload recordings" 
ON public.recordings 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own recordings
CREATE POLICY "Users can update their own recordings" 
ON public.recordings 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own recordings
CREATE POLICY "Users can delete their own recordings" 
ON public.recordings 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 5. Create storage bucket for recordings (500MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('recordings', 'recordings', true, 524288000)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage RLS Policies

-- Public read access for recordings bucket
CREATE POLICY "Public read access for recordings"
ON storage.objects
FOR SELECT
USING (bucket_id = 'recordings');

-- Authenticated users can upload to recordings bucket
CREATE POLICY "Authenticated users can upload to recordings bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'recordings');

-- ===================================
-- SETUP COMPLETE!
-- ===================================

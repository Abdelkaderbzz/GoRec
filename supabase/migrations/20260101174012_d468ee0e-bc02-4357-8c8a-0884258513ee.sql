-- Create recordings table to track uploaded videos
CREATE TABLE public.recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  public_url TEXT
);

-- Enable RLS (but allow public access for anonymous sharing)
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read recordings (for public sharing)
CREATE POLICY "Recordings are publicly viewable" 
ON public.recordings 
FOR SELECT 
USING (true);

-- Allow anyone to insert recordings (anonymous uploads)
CREATE POLICY "Anyone can upload recordings" 
ON public.recordings 
FOR INSERT 
WITH CHECK (true);

-- Create storage bucket for recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('recordings', 'recordings', true, 524288000);

-- Allow public access to recordings bucket
CREATE POLICY "Public read access for recordings"
ON storage.objects
FOR SELECT
USING (bucket_id = 'recordings');

-- Allow anyone to upload to recordings bucket
CREATE POLICY "Anyone can upload recordings to bucket"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'recordings');
-- Drop existing unrestricted insert policies
DROP POLICY IF EXISTS "Anyone can upload recordings" ON public.recordings;
DROP POLICY IF EXISTS "Anyone can upload recordings to bucket" ON storage.objects;

-- Add user_id column to track who uploaded the recording
ALTER TABLE public.recordings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create policy: Only authenticated users can insert recordings
CREATE POLICY "Authenticated users can upload recordings" 
ON public.recordings 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own recordings
CREATE POLICY "Users can update their own recordings" 
ON public.recordings 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Create policy: Users can delete their own recordings
CREATE POLICY "Users can delete their own recordings" 
ON public.recordings 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Update storage policy: Only authenticated users can upload
CREATE POLICY "Authenticated users can upload to recordings bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'recordings');
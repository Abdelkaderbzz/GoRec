-- Drop the public policy that's too permissive
DROP POLICY IF EXISTS "Public can view recordings by direct ID" ON public.recordings;

-- Add a share_token column for secure sharing without exposing all recordings
ALTER TABLE public.recordings ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT gen_random_uuid();
ALTER TABLE public.recordings ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Create index for efficient share token lookups
CREATE INDEX IF NOT EXISTS idx_recordings_share_token ON public.recordings(share_token);

-- Create policy: Anyone can view recordings that are marked as public (via share token)
CREATE POLICY "Public can view shared recordings" 
ON public.recordings 
FOR SELECT 
USING (is_public = true);
/**
 * Video Upload Hook
 * 
 * Handles uploading recordings to cloud storage with progress tracking.
 * Requires user authentication.
 * 
 * @example
 * ```tsx
 * const { uploadVideo, isUploading, uploadProgress, error } = useVideoUpload();
 * 
 * const result = await uploadVideo(blob, durationSeconds);
 * if (result) {
 *   console.log('Uploaded:', result.publicUrl);
 * }
 * ```
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Result returned after successful upload */
interface UploadResult {
  /** Database record ID */
  id: string;
  /** Public URL for the video */
  publicUrl: string;
  /** Share token for creating shareable links */
  shareToken: string;
}

/**
 * Hook for uploading video recordings to cloud storage
 */
export function useVideoUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload a video blob to storage
   * 
   * @param blob - The video blob to upload
   * @param durationSeconds - Optional duration in seconds
   * @returns Upload result with URLs, or null on failure
   */
  const uploadVideo = useCallback(async (
    blob: Blob, 
    durationSeconds?: number
  ): Promise<UploadResult | null> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to upload recordings');
      }

      const filename = `recording-${Date.now()}.webm`;
      const filePath = `${user.id}/${filename}`;

      setUploadProgress(10);

      // Upload to storage bucket
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(filePath, blob, {
          contentType: 'video/webm',
          cacheControl: '3600',
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setUploadProgress(60);

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('recordings')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      setUploadProgress(80);

      // Insert record into database with is_public = true for sharing
      const { data: recordData, error: recordError } = await supabase
        .from('recordings')
        .insert({
          filename,
          file_path: filePath,
          file_size: blob.size,
          duration_seconds: durationSeconds,
          public_url: publicUrl,
          user_id: user.id,
          is_public: true, // Enable sharing by default
        })
        .select('id, share_token')
        .single();

      if (recordError) {
        throw new Error(recordError.message);
      }

      setUploadProgress(100);
      setIsUploading(false);

      return {
        id: recordData.id,
        publicUrl,
        shareToken: recordData.share_token,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      setIsUploading(false);
      return null;
    }
  }, []);

  return {
    uploadVideo,
    isUploading,
    uploadProgress,
    error,
  };
}

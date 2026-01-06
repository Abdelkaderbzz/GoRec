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

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  sanitizeFilename,
  checkRateLimit,
  isAllowedFileType,
  isValidFileSize,
  logSecurityEvent,
} from '@/lib/security';

/** Result returned after successful upload */
interface UploadResult {
  /** Database record ID */
  id: string;
  /** Public URL for the video */
  publicUrl: string;
  /** Share token for creating shareable links */
  shareToken: string;
}

// Upload rate limit: 5 uploads per minute
const UPLOAD_RATE_LIMIT = 5;
const UPLOAD_RATE_WINDOW = 60000; // 1 minute

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
  const uploadVideo = useCallback(
    async (
      blob: Blob,
      durationSeconds?: number
    ): Promise<UploadResult | null> => {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        // Rate limiting check
        const rateCheck = checkRateLimit(
          'upload',
          UPLOAD_RATE_LIMIT,
          UPLOAD_RATE_WINDOW
        );
        if (!rateCheck.allowed) {
          logSecurityEvent('rate_limit_exceeded', { action: 'upload' });
          throw new Error(
            `Upload rate limit exceeded. Try again in ${Math.ceil(
              rateCheck.resetIn / 1000
            )} seconds.`
          );
        }

        // Validate file type
        const file = new File([blob], 'recording.webm', {
          type: blob.type || 'video/webm',
        });
        if (
          !isAllowedFileType(file, [
            'video/webm',
            'video/mp4',
            'video/x-matroska',
          ])
        ) {
          logSecurityEvent('invalid_input', {
            reason: 'invalid_file_type',
            type: blob.type,
          });
          throw new Error(
            'Invalid file type. Only WebM and MP4 videos are allowed.'
          );
        }

        // Validate file size (max 500MB)
        if (!isValidFileSize(file, 524288000)) {
          logSecurityEvent('invalid_input', {
            reason: 'file_too_large',
            size: blob.size,
          });
          throw new Error('File too large. Maximum size is 500MB.');
        }

        // Check if user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          logSecurityEvent('unauthorized_access', { action: 'upload' });
          throw new Error('You must be logged in to upload recordings');
        }

        // Sanitize filename
        const timestamp = Date.now();
        const filename = sanitizeFilename(`recording-${timestamp}.webm`);
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
    },
    []
  );

  return {
    uploadVideo,
    isUploading,
    uploadProgress,
    error,
  };
}

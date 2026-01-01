/**
 * Recordings History Hook
 * 
 * Fetches and manages the user's recording history from the database.
 * Only returns recordings owned by the authenticated user.
 * 
 * @example
 * ```tsx
 * const { recordings, isLoading, refetch } = useRecordingsHistory();
 * ```
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/** Recording data structure */
export interface Recording {
  id: string;
  filename: string;
  file_path: string;
  file_size: number | null;
  duration_seconds: number | null;
  created_at: string;
  public_url: string | null;
  share_token: string | null;
  is_public: boolean | null;
}

/**
 * Hook to fetch user's recording history
 */
export function useRecordingsHistory() {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecordings = useCallback(async () => {
    if (!user) {
      setRecordings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('recordings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setRecordings(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load recordings';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  return {
    recordings,
    isLoading,
    error,
    refetch: fetchRecordings,
  };
}

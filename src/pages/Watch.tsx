/**
 * Watch Page
 * 
 * Public page for viewing shared recordings.
 * Accessible via share token without authentication.
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n";
import { ShareDialog } from "@/components/recorder/ShareDialog";

interface Recording {
  id: string;
  filename: string;
  public_url: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export default function Watch() {
  const { token } = useParams<{ token: string }>();
  const { t } = useI18n();
  const [recording, setRecording] = useState<Recording | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    async function fetchRecording() {
      if (!token) {
        setError("Invalid share link");
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("recordings")
        .select("id, filename, public_url, duration_seconds, created_at")
        .eq("share_token", token)
        .eq("is_public", true)
        .maybeSingle();

      if (fetchError) {
        setError("Failed to load recording");
      } else if (!data) {
        setError("Recording not found or is private");
      } else {
        setRecording(data);
      }
      setIsLoading(false);
    }

    fetchRecording();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !recording) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">{error}</h1>
          <p className="text-muted-foreground">
            This recording may have been deleted or made private.
          </p>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = window.location.href;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t.nav.home}
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setShowShareDialog(true)}>
              <Share2 className="w-4 h-4" />
              {t.recorder.controls.share}
            </Button>
            {recording.public_url && (
              <a href={recording.public_url} download>
                <Button className="gap-2">
                  <Download className="w-4 h-4" />
                  {t.recorder.controls.download}
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div className="glass-card gradient-border rounded-2xl overflow-hidden">
          {recording.public_url ? (
            <video
              src={recording.public_url}
              controls
              autoPlay
              className="w-full aspect-video bg-black"
            />
          ) : (
            <div className="w-full aspect-video flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">Video not available</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            Recorded on {new Date(recording.created_at).toLocaleDateString()}
            {recording.duration_seconds && ` • ${Math.floor(recording.duration_seconds / 60)}:${(recording.duration_seconds % 60).toString().padStart(2, "0")}`}
          </p>
        </div>
      </div>

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        shareUrl={shareUrl}
      />
    </div>
  );
}

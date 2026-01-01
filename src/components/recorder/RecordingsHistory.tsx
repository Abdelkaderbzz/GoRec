/**
 * Recordings History Component
 * 
 * Displays a list of user's past recordings with options to:
 * - Open recording in new tab
 * - Share recording via social media
 * 
 * Requires user authentication to display recordings.
 */

import { useState } from "react";
import { Share2, Clock, FileVideo, Loader2, RefreshCw, ExternalLink, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRecordingsHistory, type Recording } from "@/hooks/useRecordingsHistory";
import { ShareDialog } from "./ShareDialog";
import { useI18n } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

/** Format duration in MM:SS format */
function formatDuration(seconds: number | null): string {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/** Format file size in MB */
function formatFileSize(bytes: number | null): string {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export function RecordingsHistory() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { recordings, isLoading, refetch } = useRecordingsHistory();
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleShare = (recording: Recording) => {
    setSelectedRecording(recording);
    setShowShareDialog(true);
  };

  const handlePlay = (recording: Recording) => {
    if (recording.share_token) {
      window.open(`/watch/${recording.share_token}`, '_blank', 'noopener,noreferrer');
    } else if (recording.public_url) {
      window.open(recording.public_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Get share URL for a recording
  const getShareUrl = (recording: Recording): string => {
    if (recording.share_token) {
      return `${window.location.origin}/watch/${recording.share_token}`;
    }
    return recording.public_url || '';
  };

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="glass-card gradient-border rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          {t.recorder.history.title}
        </h3>
        <div className="text-center py-6">
          <LogIn className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground mb-4">{t.auth.loginRequired}</p>
          <Link to="/auth">
            <Button variant="secondary" size="sm">
              {t.auth.signIn}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-card gradient-border rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="glass-card gradient-border rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          {t.recorder.history.title}
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <FileVideo className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t.recorder.history.empty}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card gradient-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          {t.recorder.history.title}
        </h3>
        <Button variant="ghost" size="icon" onClick={refetch}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {recordings.map((recording) => (
          <Card key={recording.id} className="p-3 bg-card/50 border-border/50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {formatDistanceToNow(new Date(recording.created_at), { addSuffix: true })}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDuration(recording.duration_seconds)}</span>
                  <span>•</span>
                  <span>{formatFileSize(recording.file_size)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePlay(recording)}
                  title={t.recorder.history.play}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleShare(recording)}
                  title={t.recorder.history.share}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedRecording && (
        <ShareDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          shareUrl={getShareUrl(selectedRecording)}
        />
      )}
    </div>
  );
}

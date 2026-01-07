/**
 * Watch Page
 *
 * Public page for viewing shared recordings.
 * Accessible via share token without authentication.
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Loader2,
  ArrowLeft,
  Share2,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
} from 'lucide-react';
import ReactPlayer, { OnProgressProps } from 'react-player';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/i18n';
import { ShareDialog } from '@/components/recorder/ShareDialog';

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

  // Player state
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    async function fetchRecording() {
      if (!token) {
        setError('Invalid share link');
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('recordings')
        .select('id, filename, public_url, duration_seconds, created_at')
        .eq('share_token', token)
        .eq('is_public', true)
        .maybeSingle();

      if (fetchError) {
        setError('Failed to load recording');
      } else if (!data) {
        setError('Recording not found or is private');
      } else {
        setRecording(data);
      }
      setIsLoading(false);
    }

    fetchRecording();
  }, [token]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (error || !recording) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-background px-4'>
        <div className='text-center space-y-4'>
          <h1 className='text-2xl font-bold text-foreground'>{error}</h1>
          <p className='text-muted-foreground'>
            This recording may have been deleted or made private.
          </p>
          <Link to='/'>
            <Button variant='outline' className='gap-2'>
              <ArrowLeft className='w-4 h-4' />
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = window.location.href;

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <Link to='/'>
            <Button variant='ghost' className='gap-2'>
              <ArrowLeft className='w-4 h-4' />
              {t.nav.home}
            </Button>
          </Link>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              className='gap-2'
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className='w-4 h-4' />
              {t.recorder.controls.share}
            </Button>
            {recording.public_url && (
              <a href={recording.public_url} download>
                <Button className='gap-2'>
                  <Download className='w-4 h-4' />
                  {t.recorder.controls.download}
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div className='glass-card gradient-border rounded-2xl overflow-hidden'>
          {recording.public_url ? (
            <div className='relative aspect-video bg-black'>
              <ReactPlayer
                url={recording.public_url as string}
                playing={playing}
                muted={muted}
                width='100%'
                height='100%'
                style={{ position: 'absolute', top: 0, left: 0 }}
                onProgress={(state: OnProgressProps) => setProgress(state.played * 100)}
                onDuration={setDuration}
                onEnded={() => setPlaying(false)}
                onError={() => console.error('Video playback error')}
              />

              {/* Custom Controls Overlay */}
              <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
                {/* Progress Bar */}
                <div className='w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer group'>
                  <div
                    className='h-full bg-primary rounded-full relative transition-all'
                    style={{ width: `${progress}%` }}
                  >
                    <div className='absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity' />
                  </div>
                </div>

                {/* Controls */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <button
                      onClick={() => setPlaying(!playing)}
                      className='w-10 h-10 flex items-center justify-center rounded-full bg-primary hover:bg-primary/80 transition-colors'
                    >
                      {playing ? (
                        <Pause className='w-5 h-5 text-white' />
                      ) : (
                        <Play className='w-5 h-5 text-white ml-0.5' />
                      )}
                    </button>

                    <button
                      onClick={() => setMuted(!muted)}
                      className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors'
                    >
                      {muted ? (
                        <VolumeX className='w-4 h-4 text-white' />
                      ) : (
                        <Volume2 className='w-4 h-4 text-white' />
                      )}
                    </button>

                    <span className='text-white/80 text-sm font-mono'>
                      {formatTime((progress / 100) * duration)} /{' '}
                      {formatTime(duration)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      const video = document.querySelector('video');
                      video?.requestFullscreen();
                    }}
                    className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors'
                  >
                    <Maximize className='w-4 h-4 text-white' />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className='w-full aspect-video flex items-center justify-center bg-muted'>
              <p className='text-muted-foreground'>Video not available</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className='mt-4 text-sm text-muted-foreground'>
          <p>
            Recorded on {new Date(recording.created_at).toLocaleDateString()}
            {recording.duration_seconds &&
              ` • ${Math.floor(recording.duration_seconds / 60)}:${(
                recording.duration_seconds % 60
              )
                .toString()
                .padStart(2, '0')}`}
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

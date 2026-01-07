/**
 * Recording Controls Component
 *
 * Displays recording action buttons based on the current state.
 */

import {
  Circle,
  Square,
  Pause,
  Play,
  Download,
  RotateCcw,
  Share2,
  Upload,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';

interface RecordingControlsProps {
  isIdle: boolean;
  isRecording: boolean;
  isPaused: boolean;
  isStopped: boolean;
  hasRecording: boolean;
  isUploading: boolean;
  shareUrl: string | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onDownload: () => void;
  onUpload: () => void;
  onShare: () => void;
  onReset: () => void;
}

export function RecordingControls({
  isIdle,
  isRecording,
  isPaused,
  isStopped,
  hasRecording,
  isUploading,
  shareUrl,
  onStart,
  onPause,
  onResume,
  onStop,
  onDownload,
  onUpload,
  onShare,
  onReset,
}: RecordingControlsProps) {
  const { t } = useI18n();

  return (
    <div className='flex flex-wrap justify-center gap-3 mt-6'>
      {isIdle && (
        <Button
          onClick={onStart}
          size='lg'
          className='bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2'
        >
          <Circle className='w-5 h-5' /> {t.recorder.controls.start}
        </Button>
      )}

      {(isRecording || isPaused) && (
        <>
          <Button
            onClick={isRecording ? onPause : onResume}
            size='lg'
            variant='secondary'
            className='gap-2'
          >
            {isRecording ? (
              <Pause className='w-5 h-5' />
            ) : (
              <Play className='w-5 h-5' />
            )}
            {isRecording ? t.recorder.controls.pause : t.recorder.controls.resume}
          </Button>
          <Button
            onClick={onStop}
            variant='destructive'
            size='lg'
            className='gap-2'
          >
            <Square className='w-5 h-5' /> {t.recorder.controls.stop}
          </Button>
        </>
      )}

      {isStopped && hasRecording && (
        <>
          <Button
            onClick={onDownload}
            size='lg'
            className='bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2'
          >
            <Download className='w-5 h-5' /> {t.recorder.controls.download}
          </Button>
          <Button
            onClick={onUpload}
            size='lg'
            variant='secondary'
            className='gap-2'
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className='w-5 h-5 animate-spin' />
            ) : (
              <Upload className='w-5 h-5' />
            )}
            {t.recorder.controls.upload}
          </Button>
          {shareUrl && (
            <Button
              onClick={onShare}
              size='lg'
              variant='outline'
              className='gap-2'
            >
              <Share2 className='w-5 h-5' /> {t.recorder.controls.share}
            </Button>
          )}
          <Button onClick={onReset} variant='ghost' size='lg' className='gap-2'>
            <RotateCcw className='w-5 h-5' /> {t.recorder.controls.newRecording}
          </Button>
        </>
      )}
    </div>
  );
}
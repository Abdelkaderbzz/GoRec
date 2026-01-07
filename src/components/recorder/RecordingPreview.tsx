/**
 * Recording Preview Component
 *
 * Displays the recording state (timer, paused, idle) or the recorded video.
 */

import { useEffect, useMemo, useState } from 'react';
import { Circle, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import ReactPlayer from 'react-player';
import { useI18n } from '@/i18n';

interface RecordingPreviewProps {
  isRecording: boolean;
  isPaused: boolean;
  isStopped: boolean;
  recordedBlob: Blob | null;
  formattedTime: string;
}

export function RecordingPreview({
  isRecording,
  isPaused,
  isStopped,
  recordedBlob,
  formattedTime,
}: RecordingPreviewProps) {
  const { t } = useI18n();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Create object URL for the recorded blob
  const videoSrc = useMemo(() => {
    if (recordedBlob) {
      return URL.createObjectURL(recordedBlob);
    }
    return null;
  }, [recordedBlob]);

  // Cleanup object URL when component unmounts or blob changes
  useEffect(() => {
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  // Reset player state when new recording
  useEffect(() => {
    setPlaying(false);
    setProgress(0);
  }, [recordedBlob]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isRecording || isPaused) {
    return (
      <div className='text-center'>
        <div
          className={`text-6xl font-mono font-bold mb-4 ${
            isRecording ? 'text-recording recording-pulse' : 'text-paused'
          }`}
        >
          {formattedTime}
        </div>
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            isRecording
              ? 'bg-recording/20 text-recording'
              : 'bg-paused/20 text-paused'
          }`}
        >
          <Circle
            className={`w-3 h-3 fill-current ${
              isRecording ? 'animate-pulse' : ''
            }`}
          />
          {isRecording ? t.recorder.status.recording : t.recorder.status.paused}
        </div>
      </div>
    );
  }

  if (isStopped && recordedBlob && videoSrc) {
    return (
      <div className='w-full h-full flex flex-col'>
        <div className='relative flex-1 bg-black/50 rounded-lg overflow-hidden'>
          {/* <ReactPlayer
            url={videoSrc}
            playing={playing}
            muted={muted}
            width='100%'
            height='100%'
            style={{ position: 'absolute', top: 0, left: 0 }}
            onProgress={({ played }) => setProgress(played * 100)}
            onDuration={setDuration}
            onEnded={() => setPlaying(false)}
          /> */}

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
                  {formatTime((progress / 100) * duration)} / {formatTime(duration)}
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
      </div>
    );
  }

  return (
    <div className='text-center text-muted-foreground'>
      <Circle className='w-16 h-16 mx-auto mb-4 opacity-30' />
      <p>{t.recorder.status.idle}</p>
    </div>
  );
}

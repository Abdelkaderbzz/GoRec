/**
 * Recorder Page
 *
 * Main recording interface with:
 * - Screen capture controls
 * - Audio settings (mic + system audio)
 * - Webcam picture-in-picture
 * - Upload and share functionality
 * - Recording history
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useRecording } from '@/contexts/RecordingContext';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/shared/Header';
import { ShareDialog } from '@/components/recorder/ShareDialog';
import { RecordingsHistory } from '@/components/recorder/RecordingsHistory';
import { RecordingControls } from '@/components/recorder/RecordingControls';
import { UploadProgress } from '@/components/recorder/UploadProgress';
import { AudioSettings } from '@/components/recorder/AudioSettings';
import { WebcamSettings } from '@/components/recorder/WebcamSettings';
import { WebcamPip } from '@/components/recorder/WebcamPip';
import { RecordingPreview } from '@/components/recorder/RecordingPreview';

export default function Recorder() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    recordingState,
    recordedBlob,
    formattedTime,
    seconds,
    audioDevices,
    selectedAudioDevice,
    setSelectedAudioDevice,
    isMicEnabled,
    isSystemAudioEnabled,
    toggleMic,
    toggleSystemAudio,
    webcamStream,
    isWebcamEnabled,
    webcamPosition,
    webcamSize,
    toggleWebcam,
    setWebcamPosition,
    setWebcamSize,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadRecording,
    resetRecording,
  } = useRecording();

  const { uploadVideo, isUploading, uploadProgress } = useVideoUpload();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isTogglingMic, setIsTogglingMic] = useState(false);
  const [isTogglingWebcam, setIsTogglingWebcam] = useState(false);

  const isIdle = recordingState === 'idle';
  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';
  const isStopped = recordingState === 'stopped';

  const handleToggleMic = useCallback(async () => {
    if (isTogglingMic) return;
    setIsTogglingMic(true);
    try {
      await toggleMic();
    } finally {
      setIsTogglingMic(false);
    }
  }, [toggleMic, isTogglingMic]);

  const handleToggleWebcam = useCallback(async () => {
    if (isTogglingWebcam) return;
    setIsTogglingWebcam(true);
    try {
      await toggleWebcam();
    } finally {
      setIsTogglingWebcam(false);
    }
  }, [toggleWebcam, isTogglingWebcam]);

  const handleStartRecording = useCallback(() => {
    if (!user) {
      toast({
        title: t.common.error,
        description: t.recorder.errors.guestNotAllowed,
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    startRecording();
  }, [user, startRecording, toast, t, navigate]);

  const handleUploadAndShare = async () => {
    if (!recordedBlob) return;

    if (!user) {
      toast({
        title: t.common.error,
        description: t.auth.loginRequired,
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    const result = await uploadVideo(recordedBlob, seconds);

    if (result) {
      const watchUrl = `${window.location.origin}/watch/${result.shareToken}`;
      setShareUrl(watchUrl);
      setShowShareDialog(true);
      toast({
        title: t.common.success,
        description: t.recorder.share.uploadSuccess,
      });
    } else {
      toast({
        title: t.common.error,
        description: t.recorder.share.uploadFailed,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='min-h-screen pb-10'>
      <Header />
      <div className='container mx-auto pt-24 px-4'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold mb-2 gradient-text'>
            {t.recorder.title}
          </h1>
          <p className='text-muted-foreground'>{t.recorder.subtitle}</p>
        </div>

        <div className='grid lg:grid-cols-3 gap-6'>
          {/* Preview Area */}
          <div className='lg:col-span-2'>
            <div className='glass-card gradient-border rounded-2xl p-6 aspect-video relative flex items-center justify-center'>
              <RecordingPreview
                isRecording={isRecording}
                isPaused={isPaused}
                isStopped={isStopped}
                recordedBlob={recordedBlob}
                formattedTime={formattedTime}
              />

              {isWebcamEnabled && webcamStream && (
                <WebcamPip
                  stream={webcamStream}
                  position={webcamPosition}
                  size={webcamSize}
                />
              )}
            </div>

            {isUploading && <UploadProgress progress={uploadProgress} />}

            <RecordingControls
              isIdle={isIdle}
              isRecording={isRecording}
              isPaused={isPaused}
              isStopped={isStopped}
              hasRecording={!!recordedBlob}
              isUploading={isUploading}
              shareUrl={shareUrl}
              onStart={handleStartRecording}
              onPause={pauseRecording}
              onResume={resumeRecording}
              onStop={stopRecording}
              onDownload={downloadRecording}
              onUpload={handleUploadAndShare}
              onShare={() => setShowShareDialog(true)}
              onReset={resetRecording}
            />
          </div>

          {/* Settings Panel */}
          <div className='space-y-6'>
            <div className='glass-card gradient-border rounded-2xl p-6 space-y-6'>
              <AudioSettings
                isMicEnabled={isMicEnabled}
                isSystemAudioEnabled={isSystemAudioEnabled}
                audioDevices={audioDevices}
                selectedAudioDevice={selectedAudioDevice}
                isIdle={isIdle}
                isTogglingMic={isTogglingMic}
                onToggleMic={handleToggleMic}
                onToggleSystemAudio={toggleSystemAudio}
                onSelectAudioDevice={setSelectedAudioDevice}
              />

              <WebcamSettings
                isWebcamEnabled={isWebcamEnabled}
                webcamPosition={webcamPosition}
                webcamSize={webcamSize}
                isTogglingWebcam={isTogglingWebcam}
                onToggleWebcam={handleToggleWebcam}
                onPositionChange={setWebcamPosition}
                onSizeChange={setWebcamSize}
              />
            </div>

            <RecordingsHistory />
          </div>
        </div>
      </div>

      {shareUrl && (
        <ShareDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          shareUrl={shareUrl}
        />
      )}
    </div>
  );
}

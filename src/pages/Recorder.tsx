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

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useI18n } from '@/i18n';
import { useRecording } from '@/contexts/RecordingContext';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/shared/Header';
import { ShareDialog } from '@/components/recorder/ShareDialog';
import { RecordingsHistory } from '@/components/recorder/RecordingsHistory';
import { VideoPlayer } from 'vidify';

const VidifyPlayer = VideoPlayer as React.ComponentType<
  React.ComponentProps<typeof VideoPlayer>
>;

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

  const webcamRef = useRef<HTMLVideoElement>(null);

  // Wrapper to prevent multiple rapid clicks on mic toggle
  const handleToggleMic = useCallback(async () => {
    if (isTogglingMic) return;
    setIsTogglingMic(true);
    try {
      await toggleMic();
    } finally {
      setIsTogglingMic(false);
    }
  }, [toggleMic, isTogglingMic]);

  // Wrapper to prevent multiple rapid clicks on webcam toggle
  const handleToggleWebcam = useCallback(async () => {
    if (isTogglingWebcam) return;
    setIsTogglingWebcam(true);
    try {
      await toggleWebcam();
    } finally {
      setIsTogglingWebcam(false);
    }
  }, [toggleWebcam, isTogglingWebcam]);

  // Handle start recording with auth check
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

  useEffect(() => {
    if (webcamRef.current && webcamStream) {
      webcamRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  const isIdle = recordingState === 'idle';
  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';
  const isStopped = recordingState === 'stopped';

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const sizeClasses = {
    small: 'w-24 h-18',
    medium: 'w-36 h-27',
    large: 'w-48 h-36',
  };

  const handleUploadAndShare = async () => {
    if (!recordedBlob) return;

    // Require authentication for uploads
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
              {isRecording || isPaused ? (
                <div className='text-center'>
                  <div
                    className={`text-6xl font-mono font-bold mb-4 ${
                      isRecording
                        ? 'text-recording recording-pulse'
                        : 'text-paused'
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
                    {isRecording
                      ? t.recorder.status.recording
                      : t.recorder.status.paused}
                  </div>
                </div>
              ) : isStopped && recordedBlob ? (
                <VidifyPlayer
                  src={[URL.createObjectURL(recordedBlob)]}
                  loop={false}
                  muted={false}
                  defaultSrcIndex={0}
                  volume={0.7}
                  durationType='default'
                  annotation={
                    <span className='text-sm font-semibold text-white'>
                      GoRec
                    </span>
                  }
                  block={false}
                  rounded={true}
                  width='100%'
                  primaryColor='#8B5CF6'
                  autoPlay={false}
                  onError={() => console.error('Video playback error')}
                />
              ) : (
                <div className='text-center text-muted-foreground'>
                  <Circle className='w-16 h-16 mx-auto mb-4 opacity-30' />
                  <p>{t.recorder.status.idle}</p>
                </div>
              )}

              {/* Webcam PiP */}
              {isWebcamEnabled && webcamStream && (
                <div
                  className={`absolute ${positionClasses[webcamPosition]} ${sizeClasses[webcamSize]} rounded-lg overflow-hidden border-2 border-primary shadow-lg`}
                >
                  <video
                    ref={webcamRef}
                    autoPlay
                    muted
                    playsInline
                    className='w-full h-full object-cover'
                  />
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className='mt-4 glass-card rounded-xl p-4'>
                <div className='flex items-center gap-3 mb-2'>
                  <Loader2 className='w-5 h-5 animate-spin text-primary' />
                  <span className='text-sm font-medium'>
                    {t.recorder.controls.uploading}
                  </span>
                </div>
                <Progress value={uploadProgress} className='h-2' />
              </div>
            )}

            {/* Controls */}
            <div className='flex flex-wrap justify-center gap-3 mt-6'>
              {isIdle && (
                <Button
                  onClick={handleStartRecording}
                  size='lg'
                  className='bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2'
                >
                  <Circle className='w-5 h-5' /> {t.recorder.controls.start}
                </Button>
              )}
              {(isRecording || isPaused) && (
                <>
                  <Button
                    onClick={isRecording ? pauseRecording : resumeRecording}
                    size='lg'
                    variant='secondary'
                    className='gap-2'
                  >
                    {isRecording ? (
                      <Pause className='w-5 h-5' />
                    ) : (
                      <Play className='w-5 h-5' />
                    )}
                    {isRecording
                      ? t.recorder.controls.pause
                      : t.recorder.controls.resume}
                  </Button>
                  <Button
                    onClick={stopRecording}
                    variant='destructive'
                    size='lg'
                    className='gap-2'
                  >
                    <Square className='w-5 h-5' /> {t.recorder.controls.stop}
                  </Button>
                </>
              )}
              {isStopped && recordedBlob && (
                <>
                  <Button
                    onClick={downloadRecording}
                    size='lg'
                    className='bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2'
                  >
                    <Download className='w-5 h-5' />{' '}
                    {t.recorder.controls.download}
                  </Button>
                  <Button
                    onClick={handleUploadAndShare}
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
                      onClick={() => setShowShareDialog(true)}
                      size='lg'
                      variant='outline'
                      className='gap-2'
                    >
                      <Share2 className='w-5 h-5' /> {t.recorder.controls.share}
                    </Button>
                  )}
                  <Button
                    onClick={resetRecording}
                    variant='ghost'
                    size='lg'
                    className='gap-2'
                  >
                    <RotateCcw className='w-5 h-5' />{' '}
                    {t.recorder.controls.newRecording}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Settings Panel */}
          <div className='space-y-6'>
            <div className='glass-card gradient-border rounded-2xl p-6 space-y-6'>
              <h3 className='font-semibold text-lg'>
                {t.recorder.settings.audio}
              </h3>

              <div className='flex items-center justify-between'>
                <Label className='flex items-center gap-2'>
                  {isMicEnabled ? (
                    <Mic className='w-4 h-4' />
                  ) : (
                    <MicOff className='w-4 h-4' />
                  )}
                  {t.recorder.settings.microphone}
                </Label>
                <Switch
                  checked={isMicEnabled}
                  onCheckedChange={handleToggleMic}
                  disabled={!isIdle || isTogglingMic}
                />
              </div>

              {isMicEnabled && audioDevices.length > 0 && (
                <Select
                  value={selectedAudioDevice || ''}
                  onValueChange={setSelectedAudioDevice}
                  disabled={!isIdle}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.recorder.settings.selectMic} />
                  </SelectTrigger>
                  <SelectContent>
                    {audioDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className='flex items-center justify-between'>
                <Label className='flex items-center gap-2'>
                  {isSystemAudioEnabled ? (
                    <Volume2 className='w-4 h-4' />
                  ) : (
                    <VolumeX className='w-4 h-4' />
                  )}
                  {t.recorder.settings.systemAudio}
                </Label>
                <Switch
                  checked={isSystemAudioEnabled}
                  onCheckedChange={toggleSystemAudio}
                  disabled={!isIdle}
                />
              </div>

              <div className='border-t border-border pt-6'>
                <h3 className='font-semibold text-lg mb-4'>
                  {t.recorder.settings.webcam}
                </h3>
                <div className='flex items-center justify-between mb-4'>
                  <Label className='flex items-center gap-2'>
                    {isWebcamEnabled ? (
                      <Camera className='w-4 h-4' />
                    ) : (
                      <CameraOff className='w-4 h-4' />
                    )}
                    {t.recorder.settings.enableWebcam}
                  </Label>
                  <Switch
                    checked={isWebcamEnabled}
                    onCheckedChange={handleToggleWebcam}
                    disabled={isTogglingWebcam}
                  />
                </div>

                {isWebcamEnabled && (
                  <>
                    <div className='space-y-2 mb-4'>
                      <Label>{t.recorder.settings.webcamPosition}</Label>
                      <Select
                        value={webcamPosition}
                        onValueChange={(
                          v:
                            | 'top-left'
                            | 'top-right'
                            | 'bottom-left'
                            | 'bottom-right'
                        ) => setWebcamPosition(v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='top-left'>
                            {t.recorder.settings.positions.topLeft}
                          </SelectItem>
                          <SelectItem value='top-right'>
                            {t.recorder.settings.positions.topRight}
                          </SelectItem>
                          <SelectItem value='bottom-left'>
                            {t.recorder.settings.positions.bottomLeft}
                          </SelectItem>
                          <SelectItem value='bottom-right'>
                            {t.recorder.settings.positions.bottomRight}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <Label>{t.recorder.settings.webcamSize}</Label>
                      <Select
                        value={webcamSize}
                        onValueChange={(v: 'small' | 'medium' | 'large') =>
                          setWebcamSize(v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='small'>
                            {t.recorder.settings.sizes.small}
                          </SelectItem>
                          <SelectItem value='medium'>
                            {t.recorder.settings.sizes.medium}
                          </SelectItem>
                          <SelectItem value='large'>
                            {t.recorder.settings.sizes.large}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recordings History */}
            <RecordingsHistory />
          </div>
        </div>
      </div>

      {/* Share Dialog */}
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

import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  ReactNode,
  useEffect,
} from 'react';
import {
  useMediaRecorder,
  type RecordingState,
} from '@/hooks/useMediaRecorder';
import { useScreenCapture } from '@/hooks/useScreenCapture';
import { useAudioDevices } from '@/hooks/useAudioDevices';
import {
  useWebcam,
  type WebcamPosition,
  type WebcamSize,
} from '@/hooks/useWebcam';
import { useTimer } from '@/hooks/useTimer';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/i18n';

interface RecordingContextType {
  // Recording state
  recordingState: RecordingState;
  recordedBlob: Blob | null;

  // Timer
  formattedTime: string;
  seconds: number;

  // Screen capture
  screenStream: MediaStream | null;
  isScreenCapturing: boolean;

  // Audio
  audioDevices: { deviceId: string; label: string }[];
  selectedAudioDevice: string | null;
  setSelectedAudioDevice: (deviceId: string) => void;
  isMicEnabled: boolean;
  isSystemAudioEnabled: boolean;
  toggleMic: () => Promise<void>;
  toggleSystemAudio: () => void;

  // Webcam
  webcamStream: MediaStream | null;
  isWebcamEnabled: boolean;
  webcamPosition: WebcamPosition;
  webcamSize: WebcamSize;
  toggleWebcam: () => Promise<void>;
  setWebcamPosition: (position: WebcamPosition) => void;
  setWebcamSize: (size: WebcamSize) => void;

  // Controls
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  downloadRecording: () => void;
  resetRecording: () => void;
}

const RecordingContext = createContext<RecordingContextType | undefined>(
  undefined
);

export function RecordingProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { toast } = useToast();

  const combinedStreamRef = useRef<MediaStream | null>(null);

  // Hooks
  const {
    state: recordingState,
    startRecording: startMediaRecorder,
    stopRecording: stopMediaRecorder,
    pauseRecording: pauseMediaRecorder,
    resumeRecording: resumeMediaRecorder,
    resetRecording: resetMediaRecorder,
    recordedBlob,
  } = useMediaRecorder({
    onError: (error) => {
      toast({
        title: t.common.error,
        description: t.recorder.errors.generic,
        variant: 'destructive',
      });
    },
  });

  const {
    stream: screenStream,
    isCapturing: isScreenCapturing,
    startCapture,
    stopCapture,
  } = useScreenCapture();

  const {
    devices: audioDevices,
    selectedDevice: selectedAudioDevice,
    setSelectedDevice: setSelectedAudioDevice,
    isMicEnabled,
    isSystemAudioEnabled,
    toggleMic,
    toggleSystemAudio,
    getMicStream,
  } = useAudioDevices();

  const {
    stream: webcamStream,
    isEnabled: isWebcamEnabled,
    position: webcamPosition,
    size: webcamSize,
    toggleWebcam,
    setPosition: setWebcamPosition,
    setSize: setWebcamSize,
    disableWebcam,
  } = useWebcam();

  const {
    formattedTime,
    seconds,
    start: startTimer,
    pause: pauseTimer,
    resume: resumeTimer,
    reset: resetTimer,
  } = useTimer();

  // Refs for canvas compositing
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);

  // Refs to track current position/size for use in animation loop
  const webcamPositionRef = useRef<WebcamPosition>(webcamPosition);
  const webcamSizeRef = useRef<WebcamSize>(webcamSize);

  // Keep refs in sync with state
  useEffect(() => {
    webcamPositionRef.current = webcamPosition;
  }, [webcamPosition]);

  useEffect(() => {
    webcamSizeRef.current = webcamSize;
  }, [webcamSize]);

  // Get webcam size in pixels based on size setting
  const getWebcamDimensions = useCallback(() => {
    const sizes = {
      small: { width: 160, height: 120 },
      medium: { width: 240, height: 180 },
      large: { width: 320, height: 240 },
    };
    return sizes[webcamSizeRef.current] || sizes.medium;
  }, []);

  // Get webcam position coordinates
  const getWebcamPositionCoords = useCallback(
    (
      canvasWidth: number,
      canvasHeight: number,
      webcamWidth: number,
      webcamHeight: number
    ) => {
      const padding = 20;
      const positions = {
        'top-left': { x: padding, y: padding },
        'top-right': { x: canvasWidth - webcamWidth - padding, y: padding },
        'bottom-left': { x: padding, y: canvasHeight - webcamHeight - padding },
        'bottom-right': {
          x: canvasWidth - webcamWidth - padding,
          y: canvasHeight - webcamHeight - padding,
        },
      };
      return positions[webcamPositionRef.current] || positions['bottom-right'];
    },
    []
  );

  // Combine all streams into one (with webcam compositing)
  const combineStreams = useCallback(
    async (
      screenStream: MediaStream,
      webcamStreamParam: MediaStream | null
    ): Promise<MediaStream> => {
      // Check if webcam stream is actually active
      const hasActiveWebcam =
        webcamStreamParam &&
        webcamStreamParam.getVideoTracks().length > 0 &&
        webcamStreamParam.getVideoTracks()[0].readyState === 'live';

      // If no webcam, just combine screen and audio
      if (!hasActiveWebcam) {
        const tracks: MediaStreamTrack[] = [...screenStream.getVideoTracks()];

        if (isSystemAudioEnabled) {
          const audioTracks = screenStream.getAudioTracks();
          tracks.push(...audioTracks);
        }

        if (isMicEnabled) {
          const micStream = await getMicStream();
          if (micStream) {
            tracks.push(...micStream.getAudioTracks());
          }
        }

        return new MediaStream(tracks);
      }

      // Create canvas for compositing
      const canvas = document.createElement('canvas');
      canvasRef.current = canvas;

      // Create video elements for streams
      const screenVideo = document.createElement('video');
      screenVideo.srcObject = screenStream;
      screenVideo.muted = true;
      screenVideo.playsInline = true;
      screenVideo.autoplay = true;
      screenVideoRef.current = screenVideo;

      const webcamVideo = document.createElement('video');
      webcamVideo.srcObject = webcamStreamParam;
      webcamVideo.muted = true;
      webcamVideo.playsInline = true;
      webcamVideo.autoplay = true;
      webcamVideoRef.current = webcamVideo;

      // Wait for videos to be ready and playing
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => resolve(), 3000); // Fallback timeout
          screenVideo.onloadedmetadata = () => {
            screenVideo
              .play()
              .then(() => {
                clearTimeout(timeout);
                resolve();
              })
              .catch(() => {
                clearTimeout(timeout);
                resolve();
              });
          };
          screenVideo.onerror = () => {
            clearTimeout(timeout);
            resolve();
          };
        }),
        new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => resolve(), 3000); // Fallback timeout
          webcamVideo.onloadedmetadata = () => {
            webcamVideo
              .play()
              .then(() => {
                clearTimeout(timeout);
                resolve();
              })
              .catch(() => {
                clearTimeout(timeout);
                resolve();
              });
          };
          webcamVideo.onerror = () => {
            clearTimeout(timeout);
            resolve();
          };
        }),
      ]);

      // Extra wait to ensure video frames are available
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Set canvas size to match screen
      canvas.width = screenVideo.videoWidth;
      canvas.height = screenVideo.videoHeight;

      const ctx = canvas.getContext('2d')!;

      // Animation loop to draw both videos
      const drawFrame = () => {
        if (!canvasRef.current) return;

        // Draw screen
        ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);

        // Draw webcam with rounded corners
        if (webcamVideo.readyState >= 2) {
          const webcamDims = getWebcamDimensions();
          const webcamPos = getWebcamPositionCoords(
            canvas.width,
            canvas.height,
            webcamDims.width,
            webcamDims.height
          );

          const radius = 12;

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(
            webcamPos.x,
            webcamPos.y,
            webcamDims.width,
            webcamDims.height,
            radius
          );
          ctx.clip();
          ctx.drawImage(
            webcamVideo,
            webcamPos.x,
            webcamPos.y,
            webcamDims.width,
            webcamDims.height
          );
          ctx.restore();

          // Draw border
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(
            webcamPos.x,
            webcamPos.y,
            webcamDims.width,
            webcamDims.height,
            radius
          );
          ctx.stroke();
        }

        animationFrameRef.current = requestAnimationFrame(drawFrame);
      };

      drawFrame();

      // Capture canvas stream
      const canvasStream = canvas.captureStream(30);
      const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

      // Add system audio if enabled
      if (isSystemAudioEnabled) {
        const audioTracks = screenStream.getAudioTracks();
        tracks.push(...audioTracks);
      }

      // Add microphone audio if enabled
      if (isMicEnabled) {
        const micStream = await getMicStream();
        if (micStream) {
          tracks.push(...micStream.getAudioTracks());
        }
      }

      return new MediaStream(tracks);
    },
    [
      isSystemAudioEnabled,
      isMicEnabled,
      getMicStream,
      getWebcamDimensions,
      getWebcamPositionCoords,
    ]
  );

  const startRecording = useCallback(async () => {
    try {
      // Request screen capture with system audio option
      const screen = await startCapture({
        video: {
          displaySurface: 'monitor',
          frameRate: { ideal: 30 },
        },
        audio: isSystemAudioEnabled,
      });

      if (!screen) {
        toast({
          title: t.common.error,
          description: t.recorder.errors.screenDenied,
          variant: 'destructive',
        });
        return;
      }

      const combinedStream = await combineStreams(screen, webcamStream);
      combinedStreamRef.current = combinedStream;

      startMediaRecorder(combinedStream);
      startTimer();
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.recorder.errors.generic,
        variant: 'destructive',
      });
    }
  }, [
    startCapture,
    combineStreams,
    startMediaRecorder,
    startTimer,
    isSystemAudioEnabled,
    webcamStream,
    t,
    toast,
  ]);

  const stopRecording = useCallback(() => {
    stopMediaRecorder();
    stopCapture();
    disableWebcam();
    pauseTimer();

    // Stop canvas animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Cleanup video elements
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
      screenVideoRef.current = null;
    }
    if (webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = null;
      webcamVideoRef.current = null;
    }

    // Cleanup canvas
    canvasRef.current = null;

    // Cleanup combined stream
    if (combinedStreamRef.current) {
      combinedStreamRef.current.getTracks().forEach((track) => track.stop());
      combinedStreamRef.current = null;
    }
  }, [stopMediaRecorder, stopCapture, disableWebcam, pauseTimer]);

  const pauseRecording = useCallback(() => {
    pauseMediaRecorder();
    pauseTimer();
  }, [pauseMediaRecorder, pauseTimer]);

  const resumeRecording = useCallback(() => {
    resumeMediaRecorder();
    resumeTimer();
  }, [resumeMediaRecorder, resumeTimer]);

  const downloadRecording = useCallback(() => {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: t.common.success,
      description: 'Recording downloaded successfully!',
    });
  }, [recordedBlob, toast, t]);

  const resetRecording = useCallback(() => {
    // Reset media recorder state and blob
    resetMediaRecorder();
    // Reset timer
    resetTimer();
    // Stop any active captures
    stopCapture();
    disableWebcam();
    // Cleanup combined stream
    if (combinedStreamRef.current) {
      combinedStreamRef.current.getTracks().forEach((track) => track.stop());
      combinedStreamRef.current = null;
    }
  }, [resetMediaRecorder, resetTimer, stopCapture, disableWebcam]);

  const value: RecordingContextType = {
    recordingState,
    recordedBlob,
    formattedTime,
    seconds,
    screenStream,
    isScreenCapturing,
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
  };

  return (
    <RecordingContext.Provider value={value}>
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecording() {
  const context = useContext(RecordingContext);
  if (!context) {
    throw new Error('useRecording must be used within a RecordingProvider');
  }
  return context;
}

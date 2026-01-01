import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  ReactNode,
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

  // Combine all streams into one
  const combineStreams = useCallback(
    async (screenStream: MediaStream): Promise<MediaStream> => {
      const tracks: MediaStreamTrack[] = [...screenStream.getVideoTracks()];

      // Add system audio if enabled (from screen capture)
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
    [isSystemAudioEnabled, isMicEnabled, getMicStream]
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

      const combinedStream = await combineStreams(screen);
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
    t,
    toast,
  ]);

  const stopRecording = useCallback(() => {
    stopMediaRecorder();
    stopCapture();
    disableWebcam();
    pauseTimer();

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

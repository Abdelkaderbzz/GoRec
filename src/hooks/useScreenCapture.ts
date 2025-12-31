import { useState, useCallback, useRef } from "react";

interface ScreenCaptureOptions {
  audio?: boolean;
  video?: boolean | MediaTrackConstraints;
}

interface UseScreenCaptureReturn {
  stream: MediaStream | null;
  isCapturing: boolean;
  error: Error | null;
  startCapture: (options?: ScreenCaptureOptions) => Promise<MediaStream | null>;
  stopCapture: () => void;
}

export function useScreenCapture(): UseScreenCaptureReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const streamRef = useRef<MediaStream | null>(null);

  const startCapture = useCallback(async (options: ScreenCaptureOptions = {}) => {
    try {
      setError(null);
      
      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: options.video ?? {
          displaySurface: "monitor",
          frameRate: { ideal: 30 },
        },
        audio: options.audio ?? false,
      };

      const mediaStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      
      // Handle when user clicks "Stop sharing" in browser UI
      mediaStream.getVideoTracks()[0].onended = () => {
        setStream(null);
        setIsCapturing(false);
        streamRef.current = null;
      };

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsCapturing(true);
      
      return mediaStream;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsCapturing(false);
      return null;
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    setIsCapturing(false);
  }, []);

  return {
    stream,
    isCapturing,
    error,
    startCapture,
    stopCapture,
  };
}

import { useState, useCallback, useRef, useEffect } from "react";

export type WebcamPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type WebcamSize = "small" | "medium" | "large";

interface UseWebcamReturn {
  stream: MediaStream | null;
  isEnabled: boolean;
  error: Error | null;
  position: WebcamPosition;
  size: WebcamSize;
  enableWebcam: () => Promise<void>;
  disableWebcam: () => void;
  toggleWebcam: () => Promise<void>;
  setPosition: (position: WebcamPosition) => void;
  setSize: (size: WebcamSize) => void;
}

export function useWebcam(): UseWebcamReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [position, setPosition] = useState<WebcamPosition>("bottom-right");
  const [size, setSize] = useState<WebcamSize>("medium");
  
  const streamRef = useRef<MediaStream | null>(null);

  const enableWebcam = useCallback(async () => {
    try {
      setError(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });
      
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsEnabled(true);
    } catch (err) {
      setError(err as Error);
      setIsEnabled(false);
    }
  }, []);

  const disableWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    setIsEnabled(false);
  }, []);

  const toggleWebcam = useCallback(async () => {
    if (isEnabled) {
      disableWebcam();
    } else {
      await enableWebcam();
    }
  }, [isEnabled, enableWebcam, disableWebcam]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    stream,
    isEnabled,
    error,
    position,
    size,
    enableWebcam,
    disableWebcam,
    toggleWebcam,
    setPosition,
    setSize,
  };
}

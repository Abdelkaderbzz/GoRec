import { useState, useRef, useCallback } from "react";

export type RecordingState = "idle" | "recording" | "paused" | "stopped";

interface UseMediaRecorderOptions {
  onDataAvailable?: (blob: Blob) => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: RecordingState) => void;
}

interface UseMediaRecorderReturn {
  state: RecordingState;
  startRecording: (stream: MediaStream) => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  recordedBlob: Blob | null;
  mediaRecorder: MediaRecorder | null;
}

export function useMediaRecorder(options: UseMediaRecorderOptions = {}): UseMediaRecorderReturn {
  const { onDataAvailable, onError, onStateChange } = options;
  
  const [state, setState] = useState<RecordingState>("idle");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const updateState = useCallback((newState: RecordingState) => {
    setState(newState);
    onStateChange?.(newState);
  }, [onStateChange]);

  const startRecording = useCallback((stream: MediaStream) => {
    try {
      chunksRef.current = [];
      setRecordedBlob(null);

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        onDataAvailable?.(blob);
        updateState("stopped");
      };

      mediaRecorder.onerror = (event) => {
        onError?.(new Error("MediaRecorder error"));
        updateState("idle");
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      updateState("recording");
    } catch (error) {
      onError?.(error as Error);
      updateState("idle");
    }
  }, [onDataAvailable, onError, updateState]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      updateState("paused");
    }
  }, [updateState]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      updateState("recording");
    }
  }, [updateState]);

  const resetRecording = useCallback(() => {
    // Stop any active recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    // Clear all state
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setRecordedBlob(null);
    updateState("idle");
  }, [updateState]);

  return {
    state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    recordedBlob,
    mediaRecorder: mediaRecorderRef.current,
  };
}

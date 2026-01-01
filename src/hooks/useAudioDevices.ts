import { useState, useEffect, useCallback, useRef } from "react";

interface AudioDevice {
  deviceId: string;
  label: string;
}

interface UseAudioDevicesReturn {
  devices: AudioDevice[];
  selectedDevice: string | null;
  setSelectedDevice: (deviceId: string) => void;
  micStream: MediaStream | null;
  isMicEnabled: boolean;
  isSystemAudioEnabled: boolean;
  toggleMic: () => Promise<void>;
  toggleSystemAudio: () => void;
  getMicStream: () => Promise<MediaStream | null>;
  error: Error | null;
  refreshDevices: () => Promise<void>;
}

export function useAudioDevices(): UseAudioDevicesReturn {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isSystemAudioEnabled, setIsSystemAudioEnabled] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const micStreamRef = useRef<MediaStream | null>(null);

  const refreshDevices = useCallback(async () => {
    try {
      // Request permission first to get device labels
      await navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices
        .filter((device) => device.kind === "audioinput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`,
        }));

      setDevices(audioInputs);
      
      if (audioInputs.length > 0 && !selectedDevice) {
        setSelectedDevice(audioInputs[0].deviceId);
      }
    } catch (err) {
      setError(err as Error);
    }
  }, [selectedDevice]);

  useEffect(() => {
    refreshDevices();
  }, []);

  const getMicStream = useCallback(async (): Promise<MediaStream | null> => {
    if (!selectedDevice) return null;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: selectedDevice },
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      
      micStreamRef.current = stream;
      setMicStream(stream);
      return stream;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  }, [selectedDevice]);

  const toggleMic = useCallback(async () => {
    if (isMicEnabled && micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
      setMicStream(null);
      setIsMicEnabled(false);
    } else {
      const stream = await getMicStream();
      if (stream) {
        setIsMicEnabled(true);
      }
    }
  }, [isMicEnabled, getMicStream]);

  const toggleSystemAudio = useCallback(() => {
    setIsSystemAudioEnabled((prev) => !prev);
  }, []);

  return {
    devices,
    selectedDevice,
    setSelectedDevice,
    micStream,
    isMicEnabled,
    isSystemAudioEnabled,
    toggleMic,
    toggleSystemAudio,
    getMicStream,
    error,
    refreshDevices,
  };
}

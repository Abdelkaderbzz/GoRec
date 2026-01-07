# API Reference

This document describes the hooks and APIs used in GoRec.

## Custom Hooks

### useScreenCapture

Manages screen capture functionality using the Screen Capture API.

```typescript
const {
  stream, // MediaStream | null
  isCapturing, // boolean
  error, // Error | null
  startCapture, // (options?: DisplayMediaOptions) => Promise<void>
  stopCapture, // () => void
} = useScreenCapture();
```

#### Example

```tsx
import { useScreenCapture } from '@/hooks/useScreenCapture';

function RecordingControls() {
  const { stream, isCapturing, startCapture, stopCapture } = useScreenCapture();

  const handleStart = async () => {
    await startCapture({
      video: { displaySurface: 'monitor' },
      audio: true,
    });
  };

  return (
    <button onClick={isCapturing ? stopCapture : handleStart}>
      {isCapturing ? 'Stop' : 'Start'} Capture
    </button>
  );
}
```

---

### useMediaRecorder

Wraps the MediaRecorder API for recording media streams.

```typescript
const {
  isRecording, // boolean
  isPaused, // boolean
  recordedBlob, // Blob | null
  duration, // number (seconds)
  startRecording, // (stream: MediaStream) => void
  stopRecording, // () => Promise<Blob>
  pauseRecording, // () => void
  resumeRecording, // () => void
} = useMediaRecorder();
```

#### Example

```tsx
import { useMediaRecorder } from '@/hooks/useMediaRecorder';

function Recorder({ stream }: { stream: MediaStream }) {
  const { isRecording, startRecording, stopRecording, recordedBlob } =
    useMediaRecorder();

  const handleStop = async () => {
    const blob = await stopRecording();
    console.log('Recording size:', blob.size);
  };

  return (
    <div>
      <button onClick={() => startRecording(stream)} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={handleStop} disabled={!isRecording}>
        Stop Recording
      </button>
    </div>
  );
}
```

---

### useWebcam

Manages webcam stream with device selection.

```typescript
const {
  stream, // MediaStream | null
  isActive, // boolean
  devices, // MediaDeviceInfo[]
  selectedDevice, // string
  error, // Error | null
  startWebcam, // (deviceId?: string) => Promise<void>
  stopWebcam, // () => void
  switchDevice, // (deviceId: string) => Promise<void>
} = useWebcam();
```

---

### useAudioDevices

Enumerates and manages audio input devices.

```typescript
const {
  devices, // MediaDeviceInfo[]
  selectedDevice, // string
  isLoading, // boolean
  error, // Error | null
  refreshDevices, // () => Promise<void>
  selectDevice, // (deviceId: string) => void
} = useAudioDevices();
```

---

### useTimer

Provides recording timer functionality.

```typescript
const {
  seconds, // number
  formatted, // string (HH:MM:SS)
  isRunning, // boolean
  start, // () => void
  stop, // () => void
  reset, // () => void
  pause, // () => void
} = useTimer();
```

---

### useMobile

Detects if the user is on a mobile device.

```typescript
const isMobile = useMobile(); // boolean
```

---

### useToast

Manages toast notifications for user feedback.

```typescript
const { toast, dismiss, toasts } = useToast();

// Show a toast
toast({
  title: 'Success',
  description: 'Recording uploaded successfully!',
  variant: 'default', // 'default' | 'destructive'
});

// Dismiss a specific toast
dismiss(toastId);
```

---

### useVideoUpload

Handles video upload to Supabase Storage.

```typescript
const {
  isUploading, // boolean
  progress, // number (0-100)
  error, // Error | null
  upload, // (blob: Blob, title: string) => Promise<Recording>
} = useVideoUpload();
```

#### Return Type

```typescript
interface Recording {
  id: string;
  title: string;
  file_path: string;
  share_token: string;
  duration: number;
  created_at: string;
}
```

---

### useRecordingsHistory

Fetches user's recording history.

```typescript
const {
  recordings, // Recording[]
  isLoading, // boolean
  error, // Error | null
  refetch, // () => void
  deleteRecording, // (id: string) => Promise<void>
} = useRecordingsHistory();
```

---

## Context APIs

### AuthContext

Provides authentication state and methods.

```typescript
const {
  user, // User | null
  session, // Session | null
  isLoading, // boolean
  signIn, // (email: string, password: string) => Promise<void>
  signUp, // (email: string, password: string) => Promise<void>
  signOut, // () => Promise<void>
} = useAuth();
```

---

### RecordingContext

Manages global recording state.

```typescript
const {
  status, // 'idle' | 'recording' | 'paused' | 'stopped'
  screenStream, // MediaStream | null
  webcamStream, // MediaStream | null
  recordedBlob, // Blob | null
  settings, // RecordingSettings
  startRecording, // () => Promise<void>
  stopRecording, // () => Promise<void>
  pauseRecording, // () => void
  resumeRecording, // () => void
  updateSettings, // (settings: Partial<RecordingSettings>) => void
} = useRecording();
```

#### Recording Settings

```typescript
interface RecordingSettings {
  includeWebcam: boolean;
  includeMicrophone: boolean;
  includeSystemAudio: boolean;
  webcamPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  quality: 'low' | 'medium' | 'high';
}
```

---

## I18n API

### useI18n

Provides translation function and language switching.

```typescript
const {
  t, // (key: string) => string
  locale, // 'en' | 'ar'
  setLocale, // (locale: 'en' | 'ar') => void
  isRTL, // boolean
} = useI18n();
```

#### Example

```tsx
import { useI18n } from '@/i18n';

function Header() {
  const { t, locale, setLocale, isRTL } = useI18n();

  return (
    <header dir={isRTL ? 'rtl' : 'ltr'}>
      <h1>{t('app.title')}</h1>
      <button onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}>
        {locale === 'en' ? 'العربية' : 'English'}
      </button>
    </header>
  );
}
```

---

## Supabase Client

### Usage

```typescript
import { supabase } from '@/integrations/supabase/client';

// Query data
const { data, error } = await supabase
  .from('recordings')
  .select('*')
  .order('created_at', { ascending: false });

// Upload file
const { data, error } = await supabase.storage
  .from('recordings')
  .upload(`${userId}/${filename}`, blob);

// Get public URL
const { data } = supabase.storage.from('recordings').getPublicUrl(filePath);
```

---

## Type Definitions

### Recording

```typescript
interface Recording {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  file_path: string;
  thumbnail_path?: string;
  duration?: number;
  file_size?: number;
  share_token: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
```

### Profile

```typescript
interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
```

### User (from Supabase Auth)

```typescript
interface User {
  id: string;
  email?: string;
  created_at: string;
  // ... other Supabase auth fields
}
```

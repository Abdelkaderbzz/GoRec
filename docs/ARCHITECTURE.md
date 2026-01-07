# Architecture Overview

This document describes the technical architecture of GoRec.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   React     │  │   Vite      │  │   Tailwind CSS          │  │
│  │   18.3      │  │   5.4       │  │   + shadcn/ui           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                     Browser Media APIs                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Screen      │  │ MediaRec-   │  │ Web Audio API           │  │
│  │ Capture API │  │ order API   │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Supabase Backend                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ PostgreSQL  │  │ Auth        │  │ Storage                 │  │
│  │ Database    │  │ (JWT)       │  │ (S3-compatible)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Provider Hierarchy

```tsx
<QueryClientProvider>
  {' '}
  // React Query - Data fetching
  <I18nProvider>
    {' '}
    // Internationalization
    <AuthProvider>
      {' '}
      // Authentication state
      <TooltipProvider>
        {' '}
        // UI Tooltips
        <RecordingProvider>
          {' '}
          // Recording state
          <App />
        </RecordingProvider>
      </TooltipProvider>
    </AuthProvider>
  </I18nProvider>
</QueryClientProvider>
```

### State Management

We use React Context for global state:

1. **AuthContext** - User authentication state

   - Current user
   - Login/logout functions
   - Session management

2. **RecordingContext** - Recording state
   - Recording status (idle, recording, paused, stopped)
   - Media streams (screen, webcam, audio)
   - Recording controls

### Custom Hooks

| Hook                   | Purpose                                     |
| ---------------------- | ------------------------------------------- |
| `useScreenCapture`     | Screen/window capture with MediaDevices API |
| `useMediaRecorder`     | Recording with MediaRecorder API            |
| `useWebcam`            | Webcam stream management                    |
| `useAudioDevices`      | Audio input device enumeration              |
| `useTimer`             | Recording timer                             |
| `useVideoUpload`       | Upload to Supabase Storage                  |
| `useRecordingsHistory` | Fetch user's recordings                     |
| `useMobile`            | Detect mobile device context                |
| `useToast`             | Toast notification management               |

## Data Flow

### Recording Flow

```
1. User clicks "Start Recording"
         │
         ▼
2. useScreenCapture.startCapture()
   - getDisplayMedia() for screen
   - getUserMedia() for webcam/audio
         │
         ▼
3. useMediaRecorder.startRecording()
   - Creates MediaRecorder
   - Collects data chunks
         │
         ▼
4. User clicks "Stop"
         │
         ▼
5. useMediaRecorder.stopRecording()
   - Returns Blob
         │
         ▼
6. useVideoUpload.upload()
   - Uploads to Supabase Storage
   - Creates database record
         │
         ▼
7. Returns shareable URL
```

### Authentication Flow

```
1. User visits /auth
         │
         ▼
2. Enters email/password
         │
         ▼
3. Supabase Auth
   - Creates/validates user
   - Returns JWT
         │
         ▼
4. AuthContext updates
   - Stores session
   - Redirects to /recorder
         │
         ▼
5. Protected routes accessible
```

## File Organization

```
src/
├── components/
│   ├── ui/              # Primitive UI components (shadcn) - 49 components
│   ├── shared/          # Shared layout components
│   │   └── Header.tsx   # App header with navigation
│   └── recorder/        # Feature-specific components
│       ├── AudioSettings.tsx      # Audio device selection
│       ├── RecordingControls.tsx  # Start/stop/pause controls
│       ├── RecordingPreview.tsx   # Screen preview component
│       ├── RecordingsHistory.tsx  # List of past recordings
│       ├── ShareDialog.tsx        # Share link generation
│       ├── UploadProgress.tsx     # Upload progress indicator
│       ├── WebcamPip.tsx          # Picture-in-picture webcam
│       └── WebcamSettings.tsx     # Webcam configuration
│
├── contexts/            # Global state management
│   ├── AuthContext.tsx
│   └── RecordingContext.tsx
│
├── hooks/               # Custom React hooks
│   ├── useScreenCapture.ts    # Screen capture logic
│   ├── useMediaRecorder.ts    # MediaRecorder API wrapper
│   ├── useWebcam.ts           # Webcam stream management
│   ├── useAudioDevices.ts     # Audio device enumeration
│   ├── useTimer.ts            # Recording timer
│   ├── useVideoUpload.ts      # Upload functionality
│   ├── useRecordingsHistory.ts # Recording history
│   ├── use-mobile.tsx         # Mobile device detection
│   └── use-toast.ts           # Toast notifications
│
├── pages/               # Route components
│   ├── Landing.tsx      # Home page
│   ├── Auth.tsx         # Authentication page
│   ├── AuthCallback.tsx # OAuth callback handler
│   ├── Recorder.tsx     # Main recorder interface
│   ├── Profile.tsx      # User profile management
│   ├── Watch.tsx        # Video playback page
│   ├── Index.tsx        # Index route
│   └── NotFound.tsx     # 404 page
│
├── i18n/                # Translations
│   ├── en.ts            # English translations
│   ├── ar.ts            # Arabic translations (RTL)
│   ├── I18nProvider.tsx # i18n context provider
│   └── index.ts         # Module exports
│
├── integrations/        # External services
│   └── supabase/
│       ├── client.ts    # Supabase client instance
│       └── types.ts     # Generated TypeScript types
│
└── lib/
    └── utils.ts         # Utility functions (cn, etc.)
```

## Security Considerations

### Row Level Security (RLS)

All Supabase tables have RLS policies:

```sql
-- Users can only read their own recordings
CREATE POLICY "Users can view own recordings"
ON recordings FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own recordings
CREATE POLICY "Users can insert own recordings"
ON recordings FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### Storage Policies

```sql
-- Users can upload to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Performance Optimizations

1. **Code Splitting** - Routes are lazily loaded
2. **React Query** - Caching and deduplication
3. **Tailwind CSS** - Purged unused styles in production
4. **Vite** - Fast HMR and optimized builds

## Browser Compatibility

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

Note: Screen recording requires secure context (HTTPS or localhost).

export const en = {
  // Navigation
  nav: {
    home: "Home",
    recorder: "Recorder",
    getStarted: "Get Started",
  },

  // Landing page
  landing: {
    badge: "Free Screen Recorder",
    headline: "Record Your Screen",
    headlineHighlight: "Like a Pro",
    description:
      "Capture your screen, webcam, and audio with our powerful browser-based recorder. No downloads, no limits, just hit record.",
    cta: "Start Recording Now",
    ctaSecondary: "Learn More",
    
    // Features
    features: {
      title: "Everything You Need",
      subtitle: "Powerful features packed into a simple interface",
      screen: {
        title: "Screen Capture",
        description: "Record your entire screen, a window, or a specific tab with crystal-clear quality.",
      },
      audio: {
        title: "Audio Recording",
        description: "Capture microphone and system audio. Mix both sources for professional recordings.",
      },
      webcam: {
        title: "Webcam Overlay",
        description: "Add a picture-in-picture webcam view to personalize your recordings.",
      },
      controls: {
        title: "Full Control",
        description: "Pause, resume, and manage your recordings with intuitive controls.",
      },
    },

    // Stats
    stats: {
      recordings: "Recordings Made",
      users: "Happy Users",
      rating: "User Rating",
    },
  },

  // Recorder page
  recorder: {
    title: "Screen Recorder",
    subtitle: "Configure your recording settings and start capturing",
    
    // Status
    status: {
      idle: "Ready to Record",
      recording: "Recording",
      paused: "Paused",
      stopped: "Recording Complete",
    },

    // Controls
    controls: {
      start: "Start Recording",
      stop: "Stop",
      pause: "Pause",
      resume: "Resume",
      download: "Download",
      newRecording: "New Recording",
      share: "Share",
      upload: "Upload & Share",
      uploading: "Uploading...",
    },

    // Share
    share: {
      title: "Share Recording",
      description: "Share your recording via link or social media",
      linkLabel: "Recording link",
      copyBtn: "Copy",
      copiedBtn: "Copied!",
      openInNewTab: "Open in new tab",
      copied: "Link copied to clipboard!",
      copyFailed: "Failed to copy link",
      shareVia: "Share via social media",
      shareText: "Check out my screen recording!",
      emailBody: "I recorded this screen capture for you:",
      uploadSuccess: "Recording uploaded successfully!",
      uploadFailed: "Failed to upload recording",
    },

    // History
    history: {
      title: "Recent Recordings",
      empty: "No recordings yet. Start recording to see them here!",
      play: "Play",
      share: "Share",
    },

    // Settings
    settings: {
      audio: "Audio Settings",
      microphone: "Microphone",
      systemAudio: "System Audio",
      selectMic: "Select microphone",
      noMic: "No microphone found",
      webcam: "Webcam",
      enableWebcam: "Enable webcam overlay",
      webcamPosition: "Position",
      webcamSize: "Size",
      positions: {
        topLeft: "Top Left",
        topRight: "Top Right",
        bottomLeft: "Bottom Left",
        bottomRight: "Bottom Right",
      },
      sizes: {
        small: "Small",
        medium: "Medium",
        large: "Large",
      },
    },

    // Timer
    timer: {
      label: "Duration",
    },

    // Errors
    errors: {
      screenDenied: "Screen sharing was denied. Please allow access to record.",
      micDenied: "Microphone access was denied. Recording without audio.",
      webcamDenied: "Webcam access was denied. Recording without webcam.",
      notSupported: "Screen recording is not supported in this browser.",
      generic: "An error occurred. Please try again.",
    },

    // Tips
    tips: {
      title: "Quick Tips",
      tip1: "Click 'Start Recording' to begin",
      tip2: "Use the pause button for breaks",
      tip3: "Download your recording when done",
    },
  },

  // Authentication
  auth: {
    welcome: "Welcome to ScreenRec",
    description: "Sign in to save and share your recordings",
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    signInSuccess: "Welcome back!",
    signUpSuccess: "Account created! You can now sign in.",
    signOut: "Sign Out",
    loginRequired: "Please sign in to upload recordings",
  },

  // Common
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    on: "On",
    off: "Off",
  },
};

export type Translations = typeof en;

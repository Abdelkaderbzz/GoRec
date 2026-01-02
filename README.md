# 🎬 GoRec - Browser-Based Screen Recorder

A powerful, modern screen recording application built with React and TypeScript. Record your screen, webcam, and audio directly from your browser with seamless cloud storage integration.

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-2.89-3ECF8E?style=flat-square&logo=supabase)

## ✨ Features

- 🖥️ **Screen Recording** - Capture your entire screen, specific windows, or browser tabs
- 📹 **Webcam Support** - Record with picture-in-picture webcam overlay
- 🎤 **Audio Recording** - Capture system audio and microphone input
- ☁️ **Cloud Storage** - Automatically upload recordings to Supabase Storage
- 🔗 **Easy Sharing** - Generate shareable links for your recordings
- 📱 **Responsive Design** - Works on desktop and tablet devices
- �� **Multi-language** - English and Arabic (RTL) support
- 🔐 **Authentication** - Secure user accounts with Supabase Auth
- 📜 **Recording History** - View and manage all your past recordings

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun package manager
- Supabase account (for backend services)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Abdelkaderbzz/screen-recorder.git
   cd screen-recorder
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_SUPABASE_PROJECT_ID=your_project_id
   ```

4. **Start development server**

   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── shared/          # Shared layout components
│   └── recorder/        # Recording-specific components
├── contexts/            # React Context providers
│   ├── AuthContext.tsx  # Authentication state
│   └── RecordingContext.tsx  # Recording state management
├── hooks/               # Custom React hooks
│   ├── useScreenCapture.ts   # Screen capture logic
│   ├── useMediaRecorder.ts   # MediaRecorder API wrapper
│   ├── useWebcam.ts          # Webcam access
│   ├── useAudioDevices.ts    # Audio device management
│   ├── useVideoUpload.ts     # Upload functionality
│   └── useRecordingsHistory.ts  # Recording history
├── i18n/                # Internationalization
│   ├── en.ts           # English translations
│   ├── ar.ts           # Arabic translations
│   └── I18nProvider.tsx # i18n context
├── integrations/        # External service integrations
│   └── supabase/       # Supabase client & types
├── lib/                 # Utility functions
├── pages/               # Route pages
│   ├── Landing.tsx     # Home page
│   ├── Recorder.tsx    # Main recorder page
│   ├── Auth.tsx        # Authentication page
│   ├── Watch.tsx       # Video playback page
│   └── NotFound.tsx    # 404 page
└── App.tsx             # Root component with routing
```

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI library with hooks
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible UI components
- **React Router** - Client-side routing
- **React Query** - Data fetching & caching
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend

- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - File storage
  - Row Level Security

### Media APIs

- **MediaDevices API** - Screen & webcam capture
- **MediaRecorder API** - Recording functionality
- **Web Audio API** - Audio processing

## 📜 Available Scripts

| Command             | Description              |
| ------------------- | ------------------------ |
| `npm run dev`       | Start development server |
| `npm run build`     | Build for production     |
| `npm run build:dev` | Build for development    |
| `npm run preview`   | Preview production build |
| `npm run lint`      | Run ESLint               |

## 📚 Documentation

- [Setup Guide](docs/SETUP.md) - Detailed installation and configuration
- [Architecture](docs/ARCHITECTURE.md) - Technical architecture overview
- [API Reference](docs/API.md) - Hooks and API documentation
- [Contributing](docs/CONTRIBUTING.md) - Contribution guidelines

## 🌐 Routes

| Path            | Component | Description           |
| --------------- | --------- | --------------------- |
| `/`             | Landing   | Home page             |
| `/auth`         | Auth      | Login/Register        |
| `/recorder`     | Recorder  | Recording interface   |
| `/watch/:token` | Watch     | Shared video playback |
| `*`             | NotFound  | 404 page              |

## 🔒 Environment Variables

| Variable                        | Required | Description              |
| ------------------------------- | -------- | ------------------------ |
| `VITE_SUPABASE_URL`             | ✅       | Supabase project URL     |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅       | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID`      | ✅       | Supabase project ID      |

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Lucide Icons](https://lucide.dev/) - Beautiful icon set
- [Radix UI](https://www.radix-ui.com/) - Headless UI primitives

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Abdelkaderbzz">Abdelkader Bouzomita</a>
</p>

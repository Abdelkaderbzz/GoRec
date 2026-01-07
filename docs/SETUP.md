# Setup Guide

Complete guide to setting up GoRec for development and production.

## Prerequisites

- **Node.js** 18.0 or higher
- **pnpm** 8.0+ (recommended package manager)
- **Git** for version control
- **Supabase account** (free tier available)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Abdelkaderbzz/screen-recorder.git
cd screen-recorder
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Supabase Setup

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Enter project details:
   - Name: `screen-recorder`
   - Database Password: (generate a strong password)
   - Region: (choose closest to your users)
4. Wait for project to be ready (~2 minutes)

#### Get API Credentials

1. Go to **Settings** > **API**
2. Copy the following:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Go to **Settings** > **General**
4. Copy **Reference ID** → `VITE_SUPABASE_PROJECT_ID`

#### Run Database Migrations

In the Supabase Dashboard:

1. Go to **SQL Editor**
2. Run each migration file from `supabase/migrations/` in order

Or use Supabase CLI:

```bash
npx supabase db push
```

#### Create Storage Bucket

1. Go to **Storage** in dashboard
2. Click "New Bucket"
3. Name: `recordings`
4. Public: Yes (or configure as needed)
5. File size limit: 500MB (or your preference)

### 4. Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGc..."
VITE_SUPABASE_PROJECT_ID="your-project-id"
```

### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

## Production Deployment

### Build for Production

```bash
pnpm build
```

Output is in the `dist/` folder.

### Deploy Options

#### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

#### Netlify

1. Push to GitHub
2. Import in [Netlify](https://netlify.com)
3. Build command: `pnpm build`
4. Publish directory: `dist`
5. Add environment variables

#### Docker

```dockerfile
FROM node:18-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t gorec .
docker run -p 8080:80 gorec
```

## Database Schema Setup

If you need to set up the database manually, here's the schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recordings table
CREATE TABLE recordings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  duration INTEGER,
  file_size BIGINT,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Recordings policies
CREATE POLICY "Users can view own recordings"
  ON recordings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public recordings"
  ON recordings FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can insert own recordings"
  ON recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recordings"
  ON recordings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings"
  ON recordings FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_recordings_user_id ON recordings(user_id);
CREATE INDEX idx_recordings_share_token ON recordings(share_token);
CREATE INDEX idx_recordings_created_at ON recordings(created_at DESC);
```

## Storage Setup

Create storage policies for the `recordings` bucket:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'recordings');

-- Allow users to read their own files
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to shared files
CREATE POLICY "Public can read shared files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'recordings');
```

## Troubleshooting

### Common Issues

#### "Permission denied" when recording

- Ensure you're on HTTPS or localhost
- Check browser permissions for screen/camera/microphone
- Try refreshing the page

#### Supabase connection errors

- Verify environment variables are correct
- Check Supabase project is running
- Ensure RLS policies allow access

#### Build errors

```bash
# Clear cache and reinstall
rm -rf node_modules
pnpm install
```

#### TypeScript errors

```bash
# Regenerate Supabase types
npx supabase gen types typescript --project-id your-project-id > src/integrations/supabase/types.ts
```

## Getting Help

- Check [GitHub Issues](https://github.com/Abdelkaderbzz/screen-recorder/issues)
- Review [Supabase Documentation](https://supabase.com/docs)
- Read [Vite Documentation](https://vitejs.dev/)

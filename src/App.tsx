/**
 * ScreenRec - Browser-based Screen Recorder
 *
 * Main application entry point with routing and providers.
 *
 * @module App
 */

import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from '@/i18n';
import { AuthProvider } from '@/contexts/AuthContext';
import { RecordingProvider } from '@/contexts/RecordingContext';
import Landing from './pages/Landing';
import Recorder from './pages/Recorder';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Profile from './pages/Profile';
import Watch from './pages/Watch';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

/**
 * Root application component
 *
 * Provider hierarchy:
 * 1. QueryClientProvider - React Query for data fetching
 * 2. I18nProvider - Internationalization (EN/AR with RTL)
 * 3. AuthProvider - User authentication state
 * 4. TooltipProvider - UI tooltips
 * 5. RecordingProvider - Recording state and controls
 */
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <TooltipProvider>
            <RecordingProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path='/' element={<Landing />} />
                  <Route path='/auth' element={<Auth />} />
                  <Route path='/auth/callback' element={<AuthCallback />} />
                  <Route path='/watch/:token' element={<Watch />} />

                  {/* Protected routes */}
                  <Route path='/recorder' element={<Recorder />} />
                  <Route path='/profile' element={<Profile />} />

                  {/* 404 */}
                  <Route path='*' element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </RecordingProvider>
          </TooltipProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
};

export default App;

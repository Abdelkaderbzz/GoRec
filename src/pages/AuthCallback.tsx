/**
 * Auth Callback Page
 *
 * Handles OAuth redirects and email confirmation callbacks.
 * Redirects to appropriate page after processing.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/i18n';

export default function AuthCallback() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL params
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(errorDescription || t.auth.confirmError);
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Get the session from the URL hash (for OAuth) or exchange code
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          setStatus('error');
          setMessage(sessionError.message);
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        if (session) {
          setStatus('success');
          setMessage(t.auth.confirmSuccess);
          setTimeout(() => navigate('/recorder'), 2000);
        } else {
          // Try to exchange code for session
          const code = searchParams.get('code');
          if (code) {
            const { error: exchangeError } =
              await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              setStatus('error');
              setMessage(exchangeError.message);
              setTimeout(() => navigate('/auth'), 3000);
              return;
            }
            setStatus('success');
            setMessage(t.auth.confirmSuccess);
            setTimeout(() => navigate('/recorder'), 2000);
          } else {
            setStatus('error');
            setMessage(t.auth.confirmError);
            setTimeout(() => navigate('/auth'), 3000);
          }
        }
      } catch (err) {
        setStatus('error');
        setMessage(t.auth.confirmError);
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleCallback();
  }, [navigate, searchParams, t]);

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='glass-card gradient-border rounded-2xl p-8 text-center max-w-md'>
        {status === 'loading' && (
          <>
            <Loader2 className='w-12 h-12 animate-spin text-primary mx-auto mb-4' />
            <h2 className='text-xl font-semibold mb-2'>{t.auth.verifying}</h2>
            <p className='text-muted-foreground'>{t.common.loading}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className='w-12 h-12 text-green-500 mx-auto mb-4' />
            <h2 className='text-xl font-semibold mb-2'>
              {t.auth.confirmSuccess}
            </h2>
            <p className='text-muted-foreground'>{t.auth.redirecting}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className='w-12 h-12 text-destructive mx-auto mb-4' />
            <h2 className='text-xl font-semibold mb-2'>{t.common.error}</h2>
            <p className='text-muted-foreground'>{message}</p>
          </>
        )}
      </div>
    </div>
  );
}

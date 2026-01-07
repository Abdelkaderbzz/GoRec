/**
 * Upload Progress Component
 *
 * Displays upload progress with a loading indicator and progress bar.
 */

import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useI18n } from '@/i18n';

interface UploadProgressProps {
  progress: number;
}

export function UploadProgress({ progress }: UploadProgressProps) {
  const { t } = useI18n();

  return (
    <div className='mt-4 glass-card rounded-xl p-4'>
      <div className='flex items-center gap-3 mb-2'>
        <Loader2 className='w-5 h-5 animate-spin text-primary' />
        <span className='text-sm font-medium'>
          {t.recorder.controls.uploading}
        </span>
      </div>
      <Progress value={progress} className='h-2' />
    </div>
  );
}
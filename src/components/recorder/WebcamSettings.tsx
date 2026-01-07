/**
 * Webcam Settings Component
 *
 * Controls for webcam enable/disable, position, and size.
 */

import { Camera, CameraOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/i18n';

type WebcamPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type WebcamSize = 'small' | 'medium' | 'large';

interface WebcamSettingsProps {
  isWebcamEnabled: boolean;
  webcamPosition: WebcamPosition;
  webcamSize: WebcamSize;
  isTogglingWebcam: boolean;
  onToggleWebcam: () => void;
  onPositionChange: (position: WebcamPosition) => void;
  onSizeChange: (size: WebcamSize) => void;
}

export function WebcamSettings({
  isWebcamEnabled,
  webcamPosition,
  webcamSize,
  isTogglingWebcam,
  onToggleWebcam,
  onPositionChange,
  onSizeChange,
}: WebcamSettingsProps) {
  const { t } = useI18n();

  return (
    <div className='border-t border-border pt-6'>
      <h3 className='font-semibold text-lg mb-4'>{t.recorder.settings.webcam}</h3>

      <div className='flex items-center justify-between mb-4'>
        <Label className='flex items-center gap-2'>
          {isWebcamEnabled ? (
            <Camera className='w-4 h-4' />
          ) : (
            <CameraOff className='w-4 h-4' />
          )}
          {t.recorder.settings.enableWebcam}
        </Label>
        <Switch
          checked={isWebcamEnabled}
          onCheckedChange={onToggleWebcam}
          disabled={isTogglingWebcam}
        />
      </div>

      {isWebcamEnabled && (
        <>
          <div className='space-y-2 mb-4'>
            <Label>{t.recorder.settings.webcamPosition}</Label>
            <Select
              value={webcamPosition}
              onValueChange={(v) => onPositionChange(v as WebcamPosition)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='top-left'>
                  {t.recorder.settings.positions.topLeft}
                </SelectItem>
                <SelectItem value='top-right'>
                  {t.recorder.settings.positions.topRight}
                </SelectItem>
                <SelectItem value='bottom-left'>
                  {t.recorder.settings.positions.bottomLeft}
                </SelectItem>
                <SelectItem value='bottom-right'>
                  {t.recorder.settings.positions.bottomRight}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>{t.recorder.settings.webcamSize}</Label>
            <Select
              value={webcamSize}
              onValueChange={(v) => onSizeChange(v as WebcamSize)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='small'>
                  {t.recorder.settings.sizes.small}
                </SelectItem>
                <SelectItem value='medium'>
                  {t.recorder.settings.sizes.medium}
                </SelectItem>
                <SelectItem value='large'>
                  {t.recorder.settings.sizes.large}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}
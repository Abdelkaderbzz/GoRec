/**
 * Audio Settings Component
 *
 * Controls for microphone and system audio settings.
 */

import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
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

interface AudioSettingsProps {
  isMicEnabled: boolean;
  isSystemAudioEnabled: boolean;
  audioDevices: { deviceId: string; label: string }[];
  selectedAudioDevice: string | null;
  isIdle: boolean;
  isTogglingMic: boolean;
  onToggleMic: () => void;
  onToggleSystemAudio: () => void;
  onSelectAudioDevice: (deviceId: string) => void;
}

export function AudioSettings({
  isMicEnabled,
  isSystemAudioEnabled,
  audioDevices,
  selectedAudioDevice,
  isIdle,
  isTogglingMic,
  onToggleMic,
  onToggleSystemAudio,
  onSelectAudioDevice,
}: AudioSettingsProps) {
  const { t } = useI18n();

  return (
    <>
      <h3 className='font-semibold text-lg'>{t.recorder.settings.audio}</h3>

      <div className='flex items-center justify-between'>
        <Label className='flex items-center gap-2'>
          {isMicEnabled ? (
            <Mic className='w-4 h-4' />
          ) : (
            <MicOff className='w-4 h-4' />
          )}
          {t.recorder.settings.microphone}
        </Label>
        <Switch
          checked={isMicEnabled}
          onCheckedChange={onToggleMic}
          disabled={!isIdle || isTogglingMic}
        />
      </div>

      {isMicEnabled && audioDevices.length > 0 && (
        <Select
          value={selectedAudioDevice || ''}
          onValueChange={onSelectAudioDevice}
          disabled={!isIdle}
        >
          <SelectTrigger>
            <SelectValue placeholder={t.recorder.settings.selectMic} />
          </SelectTrigger>
          <SelectContent>
            {audioDevices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className='flex items-center justify-between'>
        <Label className='flex items-center gap-2'>
          {isSystemAudioEnabled ? (
            <Volume2 className='w-4 h-4' />
          ) : (
            <VolumeX className='w-4 h-4' />
          )}
          {t.recorder.settings.systemAudio}
        </Label>
        <Switch
          checked={isSystemAudioEnabled}
          onCheckedChange={onToggleSystemAudio}
          disabled={!isIdle}
        />
      </div>
    </>
  );
}

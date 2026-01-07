/**
 * Webcam Picture-in-Picture Component
 *
 * Displays the webcam feed as an overlay on the recording preview.
 */

import { useEffect, useRef } from 'react';

type WebcamPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type WebcamSize = 'small' | 'medium' | 'large';

interface WebcamPipProps {
  stream: MediaStream;
  position: WebcamPosition;
  size: WebcamSize;
}

const positionClasses: Record<WebcamPosition, string> = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
};

const sizeClasses: Record<WebcamSize, string> = {
  small: 'w-24 h-18',
  medium: 'w-36 h-27',
  large: 'w-48 h-36',
};

export function WebcamPip({ stream, position, size }: WebcamPipProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={`absolute ${positionClasses[position]} ${sizeClasses[size]} rounded-lg overflow-hidden border-2 border-primary shadow-lg`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className='w-full h-full object-cover'
      />
    </div>
  );
}
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

/**
 * Format seconds into a human-readable time string (M:SS or H:MM:SS)
 * Handles edge cases: NaN, Infinity, negative values
 */
export function formatVideoDuration(seconds: number): string {
  // Handle invalid values
  if (
    seconds === null ||
    seconds === undefined ||
    !Number.isFinite(seconds) ||
    Number.isNaN(seconds) ||
    seconds < 0
  ) {
    return '--:--';
  }

  const dur = dayjs.duration(seconds, 'seconds');
  const hours = Math.floor(dur.asHours());
  const minutes = dur.minutes();
  const secs = dur.seconds();

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

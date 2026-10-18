export function formatDuration(value: number | string | null | undefined): string | null {
  let seconds: number;
  if (typeof value === 'number') {
    seconds = value / 1000;
  } else if (typeof value === 'string' && /^\d+:\d{2}(?::\d{2})?(?:\.\d+)?$/.test(value)) {
    seconds = value.split(':').reduce((total, part) => total * 60 + Number(part), 0);
  } else {
    return null;
  }
  if (!Number.isFinite(seconds) || seconds < 0) return null;
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const remainder = String(total % 60).padStart(2, '0');
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${remainder}` : `${minutes}:${remainder}`;
}

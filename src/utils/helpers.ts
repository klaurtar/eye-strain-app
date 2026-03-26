export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function generateId(): string {
  const now = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${now.toString(36)}-${random}`;
}

export function getTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

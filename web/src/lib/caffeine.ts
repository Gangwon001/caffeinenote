export const CAFFEINE_HALF_LIFE_HOURS = 5;

export interface CaffeineEntry {
  caffeineMg: number;
  consumedAt: Date;
}

export function remainingCaffeine(doseMg: number, hoursElapsed: number): number {
  if (hoursElapsed < 0) return 0;
  return doseMg * Math.pow(0.5, hoursElapsed / CAFFEINE_HALF_LIFE_HOURS);
}

export function totalRemainingAt(entries: CaffeineEntry[], at: Date): number {
  return entries.reduce((sum, entry) => {
    const hoursElapsed = (at.getTime() - entry.consumedAt.getTime()) / (1000 * 60 * 60);
    return sum + remainingCaffeine(entry.caffeineMg, hoursElapsed);
  }, 0);
}

export function computeBedtimeDate(entries: CaffeineEntry[], bedtime: string, now: Date): Date {
  const [hours, minutes] = bedtime.split(":").map(Number);
  const reference =
    entries.length > 0
      ? new Date(Math.max(...entries.map((e) => e.consumedAt.getTime()), now.getTime()))
      : now;

  const candidate = new Date(reference);
  candidate.setHours(hours, minutes, 0, 0);
  if (candidate <= reference) {
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate;
}

export function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

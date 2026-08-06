/** Date handling for the day selector — everything in America/Los_Angeles. */

export const MAX_DAYS_AHEAD = 6; // Open-Meteo marine forecast reliably covers ~7 days

const LA_DATE = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Los_Angeles" });

export function laDateString(offsetDays = 0): string {
  return LA_DATE.format(new Date(Date.now() + offsetDays * 86_400_000));
}

export interface DayOption {
  date: string; // "YYYY-MM-DD"
  label: string; // "Today" | "Thu 8/6"
  isToday: boolean;
}

export function selectableDays(): DayOption[] {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    month: "numeric",
    day: "numeric",
  });
  return Array.from({ length: MAX_DAYS_AHEAD + 1 }, (_, i) => ({
    date: laDateString(i),
    label: i === 0 ? "Today" : fmt.format(new Date(Date.now() + i * 86_400_000)),
    isToday: i === 0,
  }));
}

/** Returns the date if it's a selectable day, otherwise today. */
export function resolveSelectedDate(raw: string | undefined): string {
  if (raw && selectableDays().some((d) => d.date === raw)) return raw;
  return laDateString(0);
}

export function monthDay(date: string): { month: number; day: number } {
  const [, month, day] = date.split("-").map(Number);
  return { month, day };
}

export function longLabel(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

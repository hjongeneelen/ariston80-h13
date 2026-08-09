const TIMEZONE = "Europe/Amsterdam";

const dayMonthFormatter = new Intl.DateTimeFormat("nl-NL", {
  day: "2-digit",
  month: "2-digit",
  timeZone: TIMEZONE,
});

const dayNumberFormatter = new Intl.DateTimeFormat("nl-NL", {
  day: "2-digit",
  timeZone: TIMEZONE,
});

const monthShortFormatter = new Intl.DateTimeFormat("nl-NL", {
  month: "short",
  timeZone: TIMEZONE,
});

const timeFormatter = new Intl.DateTimeFormat("nl-NL", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIMEZONE,
});

export function formatMatchDate(iso: string): string {
  return dayMonthFormatter.format(new Date(iso));
}

export function formatDayNumber(iso: string): string {
  return dayNumberFormatter.format(new Date(iso));
}

export function formatMonthShort(iso: string): string {
  return monthShortFormatter.format(new Date(iso)).replace(".", "");
}

export function formatMatchTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatSyncedAt(iso: string | null): string {
  if (!iso) return "nog niet gesynchroniseerd";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  }).format(new Date(iso));
}

export function daysUntil(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return "vandaag";
  if (diffDays === 1) return "morgen";
  return `over ${diffDays} dagen`;
}

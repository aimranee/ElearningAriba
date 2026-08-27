/**
 * Locale and timezone are pinned, not inferred: the app renders on a UTC host,
 * and inferring the timezone would silently produce the wrong day for an
 * agenda slot in a later lot. Every date, time and number in the codebase
 * must format through these constants or the helpers below.
 */

export const LOCALE = "fr-FR" as const;
export const TIME_ZONE = "Europe/Paris" as const;

export const dateFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(
  LOCALE,
  {
    timeZone: TIME_ZONE,
    dateStyle: "long",
  },
);

export const dateTimeFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(
  LOCALE,
  {
    timeZone: TIME_ZONE,
    dateStyle: "long",
    timeStyle: "short",
  },
);

export const numberFormatter: Intl.NumberFormat = new Intl.NumberFormat(
  LOCALE,
);

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

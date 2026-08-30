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

/* why: numberFormatter has no currency style, so it never produces a "€" —
   a maquette that hand-writes the symbol next to a plain number would
   violate D-29/D-30, so every price must go through this formatter instead */
export const currencyFormatter: Intl.NumberFormat = new Intl.NumberFormat(
  LOCALE,
  {
    style: "currency",
    currency: "EUR",
  },
);

export const timeFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(
  LOCALE,
  {
    timeZone: TIME_ZONE,
    timeStyle: "short",
  },
);

/* why: numberFormatter/formatNumber render a bare digit with no unit
   (D-30/D-43 of Lot 2) — a hand-written " h" at a call site is the same
   class of violation as a hand-written "€", so the module duration unit
   gets its own formatter instead of a second formatting path. */
export const hourFormatter: Intl.NumberFormat = new Intl.NumberFormat(LOCALE, {
  style: "unit",
  unit: "hour",
  unitDisplay: "short",
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatTime(date: Date): string {
  return timeFormatter.format(date);
}

export function formatHours(value: number): string {
  return hourFormatter.format(value);
}

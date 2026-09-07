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

/* why: French prose never writes clock time in the CLDR "14:30" shape — it
   reads "14 h 30". A hand-written " h" at a call site is the same class of
   defect as the hand-written "€" that currencyFormatter exists to prevent,
   which is why this lives here and not in the component that needed it
   first. timeFormatter ("14:30") stays correct and unchanged for dense slot
   chips — the two registers coexist by design and are never interchanged.
   Prose surfaces (recap, confirmation email, .ics description, admin rows)
   take formatHeureProse; dense slot pills take timeFormatter. */
export const heureProseFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(
  LOCALE,
  {
    timeZone: TIME_ZONE,
    hourCycle: "h23",
    hour: "numeric",
    minute: "numeric",
  },
);

export function formatHeureProse(value: Date): string {
  const parts = heureProseFormatter.formatToParts(value);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "";
  return `${hour} h ${minute}`;
}

/* why: dateFormatter (dateStyle: "long") omits the weekday, which an agenda
   cannot — an agenda says "mardi 8 septembre", not "8 septembre 2026". A
   call-site concatenation of a weekday onto formatDate is forbidden; the
   weekday must come from Intl like every other part. */
export const dateAvecJourFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(
  LOCALE,
  {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  },
);

export function formatDateAvecJour(value: Date): string {
  return dateAvecJourFormatter.format(value);
}

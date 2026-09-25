/**
 * Locale and timezone are pinned, not inferred: the app renders on a UTC host,
 * and inferring the timezone would silently produce the wrong day for an
 * agenda slot in a later lot. Every date, time and number in the codebase
 * must format through these constants or the helpers below.
 */

import type { Locale } from "@/lib/i18n/locale";

export const LOCALE = "fr-FR" as const;
export const TIME_ZONE = "Europe/Paris" as const;

/* why (#17, #21): the English site formats in British English. Each helper
   below that an English page uses takes an optional locale; French is the
   default, so every existing call site and its output stay exactly as they
   were. */
export const EN_LOCALE = "en-GB" as const;

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
   (D-30/D-43 of Lot 2) — a hand-written " h" or " min" at a call site is the
   same class of violation as a hand-written "€", so each duration unit gets
   its own formatter instead of a second formatting path. A fractional hour
   is never written "1,5 h" in French, it is "1 h 30" — formatHours composes
   that shape internally rather than pushing the split onto call sites,
   because the 90-minute appointments (formatHours(duree_minutes / 60)) go
   through the same function as whole-hour module durations. */
export const hourFormatter: Intl.NumberFormat = new Intl.NumberFormat(LOCALE, {
  style: "unit",
  unit: "hour",
  unitDisplay: "short",
});

export const minuteFormatter: Intl.NumberFormat = new Intl.NumberFormat(LOCALE, {
  style: "unit",
  unit: "minute",
  unitDisplay: "short",
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

const enNumberFormatter: Intl.NumberFormat = new Intl.NumberFormat(EN_LOCALE);

export function formatNumber(value: number, locale: Locale = "fr"): string {
  return locale === "en" ? enNumberFormatter.format(value) : numberFormatter.format(value);
}

/* why (#24): British English writes the euro first with a decimal point —
   "€300.00" — at the same amount; en-GB keeps the 24-hour clock and Paris
   time for slot chips, so "14:30" reads the same in both languages. */
const enCurrencyFormatter: Intl.NumberFormat = new Intl.NumberFormat(EN_LOCALE, {
  style: "currency",
  currency: "EUR",
});

const enTimeFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(EN_LOCALE, {
  timeZone: TIME_ZONE,
  timeStyle: "short",
});

export function formatCurrency(value: number, locale: Locale = "fr"): string {
  return locale === "en" ? enCurrencyFormatter.format(value) : currencyFormatter.format(value);
}

export function formatTime(date: Date, locale: Locale = "fr"): string {
  return locale === "en" ? enTimeFormatter.format(date) : timeFormatter.format(date);
}

/* why (#21, CTO decision 2026-09-24): CLDR's en-GB units read "1 hr" and
   "30 mins", not the SI symbols. The English site keeps the symbols the
   French renders and spells the minutes — "1 h 30 min", "2 h", "30 min" —
   so they are composed here, never at a call site. "h" and "min" are SI
   unit symbols, the same in both languages, not translatable copy. A
   no-break space holds each number to its symbol; the two groups are
   joined by a plain space. */
const EN_HOUR_SYMBOL = "h";
const EN_MINUTE_SYMBOL = "min";

function formatEnUnit(value: number, symbol: string): string {
  return `${enNumberFormatter.format(value)} ${symbol}`;
}

function formatHoursEn(value: number): string {
  let whole = Math.trunc(value);
  let minutes = Math.round((value - whole) * 60);
  if (minutes === 60) {
    whole += 1;
    minutes = 0;
  }
  const groups: string[] = [];
  if (whole > 0 || minutes === 0) groups.push(formatEnUnit(whole, EN_HOUR_SYMBOL));
  if (minutes > 0) groups.push(formatEnUnit(minutes, EN_MINUTE_SYMBOL));
  return groups.join(" ");
}

export function formatHours(value: number, locale: Locale = "fr"): string {
  if (locale === "en") {
    return formatHoursEn(value);
  }
  if (Number.isInteger(value)) {
    return hourFormatter.format(value);
  }
  const whole = Math.trunc(value);
  const minutes = Math.round((value - whole) * 60);
  return `${hourFormatter.format(whole)} ${String(minutes).padStart(2, "0")}`;
}

export function formatMinutes(value: number, locale: Locale = "fr"): string {
  if (locale === "en") {
    return formatEnUnit(value, EN_MINUTE_SYMBOL);
  }
  return minuteFormatter.format(value);
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

// (#24) "Tuesday 8 September" — day before month, as British English writes it.
const enDateAvecJourFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(EN_LOCALE, {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function formatDateAvecJour(value: Date, locale: Locale = "fr"): string {
  return locale === "en" ? enDateAvecJourFormatter.format(value) : dateAvecJourFormatter.format(value);
}

/* why (#27): a testimonial is dated to the month, never the day — "juin
   2026", the way a review platform prints it. A hand-assembled month name
   at the call site would be the same defect class as the hand-written "€". */
export const moisAnneeFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(
  LOCALE,
  {
    timeZone: TIME_ZONE,
    month: "long",
    year: "numeric",
  },
);

const enMoisAnneeFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(EN_LOCALE, {
  timeZone: TIME_ZONE,
  month: "long",
  year: "numeric",
});

export function formatMoisAnnee(value: Date, locale: Locale = "fr"): string {
  return locale === "en" ? enMoisAnneeFormatter.format(value) : moisAnneeFormatter.format(value);
}

/* why (#22): the landing's decorative mini-calendar heads its week with one
   letter per day, Monday first — L M M J V S D in French, M T W T F S S in
   English. The letters come from Intl like every other date part; the
   reference week (Monday 5 January 2026, noon UTC) is fixed, never "today". */
const SEMAINE_REFERENCE: readonly Date[] = Array.from(
  { length: 7 },
  (_, index) => new Date(Date.UTC(2026, 0, 5 + index, 12)),
);

function initialesJours(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { timeZone: TIME_ZONE, weekday: "narrow" });
  return SEMAINE_REFERENCE.map((day) => formatter.format(day));
}

const INITIALES_JOURS_FR: readonly string[] = initialesJours(LOCALE);
const INITIALES_JOURS_EN: readonly string[] = initialesJours(EN_LOCALE);

export function initialesJoursSemaine(locale: Locale = "fr"): readonly string[] {
  return locale === "en" ? INITIALES_JOURS_EN : INITIALES_JOURS_FR;
}

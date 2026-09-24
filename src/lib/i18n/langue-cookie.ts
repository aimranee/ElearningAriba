import type { Locale } from "@/lib/i18n/locale";

/*
 * why (#17, I18N-05/06): the visitor's language choice. Written by the client
 * only — the switcher and the English root layout — so no public page reads
 * cookies on the server and each stays static/ISR. Not HttpOnly: Phase B reads
 * it on the server for the app pages, and the client must keep writing it.
 */
export const LANGUE_COOKIE = "langue";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** The `document.cookie` assignment that records `locale`. */
export function langueCookie(locale: Locale, { secure }: { secure: boolean }): string {
  const attributes = [`Path=/`, `Max-Age=${ONE_YEAR_SECONDS}`, "SameSite=Lax"];
  if (secure) attributes.push("Secure");
  return [`${LANGUE_COOKIE}=${locale}`, ...attributes].join("; ");
}

/** Browser only: records `locale` as the visitor's language. */
export function writeLangueCookie(locale: Locale): void {
  document.cookie = langueCookie(locale, { secure: window.location.protocol === "https:" });
}

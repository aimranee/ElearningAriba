import type { Locale } from "@/lib/i18n/locale";

/*
 * why (#17, I18N-03): the one FR↔EN route map. It drives each page's
 * language alternates, the header/footer links of the English shell, the
 * switcher (#20) and, later, the sitemap (Lot 5). English slugs are
 * provisional until the Head of SEO's spec (#26).
 */
export const EN_ROUTES = {
  "/": "/en",
  "/a-propos": "/en/about",
  "/formation": "/en/training",
  "/contact": "/en/contact",
  "/agenda": "/en/calendar",
} as const satisfies Record<string, "/en" | `/en/${string}`>;

export type TranslatedRoute = keyof typeof EN_ROUTES;

/* French public routes with no English copy yet. The page tickets (#21–#24)
   moved each one into EN_ROUTES; routes.test.ts fails on any French public
   page that is in neither. Empty since #24, and kept: a new French public
   page lands here until its English copy exists (#26 makes parity strict). */
export const PENDING_EN_ROUTES: readonly string[] = [];

/* why (#25): the programme PDF in each language. A file, not a page, so it
   stays out of EN_ROUTES: no switcher, no hreflang, no sitemap entry. */
export const PROGRAMME_PDF_PATH = {
  fr: "/programme.pdf",
  en: "/en/programme.pdf",
} as const satisfies Record<Locale, string>;

const EN_BY_FR: ReadonlyMap<string, string> = new Map(Object.entries(EN_ROUTES));
const FR_BY_EN: ReadonlyMap<string, string> = new Map(
  Object.entries(EN_ROUTES).map(([fr, en]) => [en, fr]),
);

/** The URL of a French path in `locale` — itself when it has no English copy. */
export function localizedPath(frenchPath: string, locale: Locale): string {
  if (locale === "fr") return frenchPath;
  return EN_BY_FR.get(frenchPath) ?? frenchPath;
}

export type LanguagePair = Record<Locale, string>;

/** Both language versions of the page at `pathname`, or null when it has no counterpart. */
export function languagePair(pathname: string): LanguagePair | null {
  const en = EN_BY_FR.get(pathname);
  if (en) return { fr: pathname, en };
  const fr = FR_BY_EN.get(pathname);
  if (fr) return { fr, en: pathname };
  return null;
}

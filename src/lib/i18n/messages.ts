import frAPropos from "@/locales/fr/a-propos.json";
import frCommon from "@/locales/fr/common.json";
import frFormation from "@/locales/fr/formation.json";
import frLanding from "@/locales/fr/landing.json";
import frProgramme from "@/locales/fr/programme.json";
import enAPropos from "@/locales/en/a-propos.json";
import enCommon from "@/locales/en/common.json";
import enFormation from "@/locales/en/formation.json";
import enLanding from "@/locales/en/landing.json";
import enProgramme from "@/locales/en/programme.json";
import type { Locale } from "@/lib/i18n/locale";

/*
 * why (#17, I18N-01): the namespaces an English page may read. A namespace
 * is listed here only once src/locales/en/<namespace>.json exists, so an
 * English page cannot reach French-only text through getMessages. To
 * translate one more namespace: add its English JSON, then its two imports
 * and one line in each object below.
 *
 * (#21) `programme` is read by the content seed, not by a page; it is listed
 * so its English file is held to the French keys like every other.
 */
const fr = {
  "a-propos": frAPropos,
  common: frCommon,
  formation: frFormation,
  landing: frLanding,
  programme: frProgramme,
};

export type Namespace = keyof typeof fr;
export type Messages<N extends Namespace> = (typeof fr)[N];

// Typed against the French twin: an English file missing a French key fails
// `npm run typecheck` on this line.
const en: { [N in Namespace]: Messages<N> } = {
  "a-propos": enAPropos,
  common: enCommon,
  formation: enFormation,
  landing: enLanding,
  programme: enProgramme,
};

export function getMessages<N extends Namespace>(locale: Locale, namespace: N): Messages<N> {
  return (locale === "en" ? en : fr)[namespace];
}

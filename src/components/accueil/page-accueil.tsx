import { Hero } from "@/components/sections/hero";
import { EtEnsuite } from "@/components/sections/et-ensuite";
import { PourQui } from "@/components/sections/pour-qui";
import { Competences } from "@/components/sections/competences";
import { ProgrammeAccordion } from "@/components/sections/programme-accordion";
import { FormatModalites } from "@/components/sections/format-modalites";
import { Confiance } from "@/components/sections/confiance";
import { CtaFinal } from "@/components/sections/cta-final";
import { Faq } from "@/components/sections/faq";
import { RailSections } from "@/components/motion/rail-sections";
import { BarreReservation } from "@/components/motion/barre-reservation";
import { Atmosphere } from "@/components/motion/atmosphere";
import { formatMinutes } from "@/lib/i18n/fr";
import { getMessages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import agenda from "@/locales/fr/agenda.json";

/*
 * why (#22): the landing body, rendered by both route files — (public)/ in
 * French and (public-en)/en in English — so the two cannot drift. Each route
 * file keeps its own `revalidate`. Links into the booking tunnel keep their
 * French URLs: the tunnel is French until Phase B.
 *
 * why (brief §C, "En-tête, pied, chrome global"): the rail and the sticky
 * booking bar are conversion mechanisms scoped to the landing page only —
 * they mount here, not in a layout, so no other route inherits them. Both are
 * client islands: their text is resolved here and passed down.
 *
 * The discovery call's length is read from agenda.json's bootstrap row, as
 * aide-rdv.tsx does (#21); its label is landing copy.
 */
export function PageAccueil({ locale }: { locale: Locale }) {
  const common = getMessages(locale, "common");
  const landing = getMessages(locale, "landing");
  const typeDecouverte = agenda.typesRendezVous[0];
  const decouverte = typeDecouverte
    ? {
        libelle: landing.rdvDecouverte.libelle,
        duree: formatMinutes(typeDecouverte.dureeMinutes, locale),
      }
    : null;

  return (
    <>
      <Atmosphere />
      <RailSections label={common.nav.sections} topLabel={common.metadata.title} />
      <BarreReservation action={common.actions.prendreRdv} decouverte={decouverte} />
      <Hero locale={locale} />
      <EtEnsuite locale={locale} />
      <PourQui locale={locale} />
      <Competences locale={locale} />
      <ProgrammeAccordion locale={locale} />
      <FormatModalites locale={locale} />
      <Confiance locale={locale} />
      <CtaFinal locale={locale} />
      <Faq locale={locale} />
    </>
  );
}

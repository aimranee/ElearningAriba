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

// why (D-38): the landing page must stay static/ISR, not dynamic, even
// though every section now reads Supabase through the cookieless client —
// an explicit revalidate window keeps the route on the ISR path.
export const revalidate = 3600;

// why (brief §C, "En-tête, pied, chrome global"): the rail and the sticky
// booking bar are conversion mechanisms scoped to the landing page only —
// they mount here, not in layout.tsx, so no other route inherits them.
export default function Home() {
  return (
    <>
      <Atmosphere />
      <RailSections />
      <BarreReservation />
      <Hero />
      <EtEnsuite />
      <PourQui />
      <Competences />
      <ProgrammeAccordion />
      <FormatModalites />
      <Confiance />
      <CtaFinal />
      <Faq />
    </>
  );
}

import { Hero } from "@/components/sections/hero";
import { PourQui } from "@/components/sections/pour-qui";
import { Competences } from "@/components/sections/competences";
import { ProgrammeAccordion } from "@/components/sections/programme-accordion";
import { FormatModalites } from "@/components/sections/format-modalites";
import { Confiance } from "@/components/sections/confiance";
import { CtaFinal } from "@/components/sections/cta-final";
import { Faq } from "@/components/sections/faq";

// why (D-38): the landing page must stay static/ISR, not dynamic, even
// though every section now reads Supabase through the cookieless client —
// an explicit revalidate window keeps the route on the ISR path.
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Hero />
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

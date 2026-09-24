import Link from "next/link";
import { Calendar } from "lucide-react";

import { Section } from "@/components/sections/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { RDV_DECOUVERTE_HREF } from "@/components/formation/aide-rdv";
import { formatMinutes } from "@/lib/i18n/fr";
import agenda from "@/locales/fr/agenda.json";
import common from "@/locales/fr/common.json";
import formation from "@/locales/fr/formation.json";

/**
 * The RDV band above the footer (#27 § 7): the reference's gradient band
 * rebuilt in the palette. The gradient runs --indigo -> --deep -> --violet
 * like the landing's final CTA, but the ink stays pure white (no /82 veil)
 * and the band carries no grid overlay: white 18px text over --violet
 * measures 4.7:1 and a lightening line under it would drop below 4.5.
 * The secondary button keeps a transparent fill for the same reason.
 */
function BandeauRdv() {
  const decouverte = agenda.typesRendezVous[0];
  const texte = formation.bandeau.texte.replace(
    "{duree}",
    decouverte ? formatMinutes(decouverte.dureeMinutes) : "",
  );

  return (
    <Section tone="default" data-section="reservation">
      <Reveal
        data-slot="bandeau-rdv"
        className="relative overflow-hidden rounded-[34px] px-[clamp(1.5rem,5vw,4rem)] py-[clamp(3rem,6vw,5rem)] text-center text-white shadow-[var(--shadow-brand)]"
        style={{
          background: "linear-gradient(125deg, var(--indigo), var(--deep) 55%, var(--violet))",
        }}
      >
        <div className="relative z-[1] mx-auto flex max-w-[46rem] flex-col items-center gap-4">
          <h2 className="font-heading text-[length:var(--text-title)] leading-[var(--text-title--line-height)] font-extrabold tracking-[-0.028em] text-balance">
            {formation.bandeau.titre}
          </h2>
          <p className="max-w-[52ch] text-[length:var(--text-lead)] leading-[var(--text-lead--line-height)] text-white">
            {texte}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-[0.85rem]">
            <Button
              render={<Link href={RDV_DECOUVERTE_HREF} />}
              nativeButton={false}
              size="lg"
              data-magnetic="true"
              className="min-h-11 bg-white text-[var(--deep)] shadow-[0_20px_40px_-18px_rgba(0,0,0,.45)] hover:bg-white hover:shadow-[0_28px_54px_-20px_rgba(0,0,0,.5)] hover:-translate-y-[2px]"
            >
              <Calendar aria-hidden="true" />
              {common.actions.prendreRdv}
            </Button>
            <Button
              render={<Link href="/contact" />}
              nativeButton={false}
              variant="outline"
              size="lg"
              className="min-h-11 border-white/60 bg-transparent text-white hover:bg-transparent hover:border-white hover:text-white hover:-translate-y-[2px]"
            >
              {common.actions.nousContacter}
            </Button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

export { BandeauRdv };

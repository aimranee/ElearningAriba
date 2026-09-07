import Link from "next/link";
import { Award } from "lucide-react";
import { Section, SectionHeader } from "@/components/sections/section";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { CardSpotlight } from "@/components/motion/card-spotlight";
import { Constellation } from "@/components/illustrations/constellation";
import { pictograms, type PictogramName } from "@/components/icons/pictograms";
import { getSection, getSectionItems } from "@/lib/content/queries";
import common from "@/locales/fr/common.json";

/**
 * PUB-03 — six white cards, one gradient icon tile per competency (D-96).
 * Saturated colour concentrates in the pastille, the card body stays white.
 */
const CARD_TEINTES: Record<string, { a: string; b: string }> = {
  "ecosysteme-ariba": { a: "var(--violet)", b: "var(--indigo)" },
  "procure-to-pay": { a: "var(--sky-ink)", b: "var(--azur-ink)" },
  "source-to-pay": { a: "var(--mint-ink)", b: "var(--azur-ink)" },
  "rfq-rfp": { a: "var(--amber-ink)", b: "var(--coral-ink)" },
  "gestion-catalogues": { a: "var(--magenta-ink)", b: "var(--violet-ink)" },
  certification: { a: "var(--coral-ink)", b: "var(--magenta-ink)" },
};

// why (CADR-04): un badge est une marque générique — le registre de
// pictogrammes interdit de la redessiner. Les cinq compétences de domaine
// résolvent depuis le registre ; la certification prend Award ici, au point
// d'appel, exactement comme le contrat du registre l'exige.
function resolvePictogram(cle: string | null) {
  if (cle === "certification") return Award;
  if (cle && cle in pictograms) return pictograms[cle as PictogramName];
  return null;
}

async function Competences() {
  const [sectionResult, itemsResult] = await Promise.all([
    getSection("competences"),
    getSectionItems("competences"),
  ]);

  if (!sectionResult.ok || !itemsResult.ok) {
    return (
      <Section tone="default">
        <EmptyState tone="error">
          <EmptyStateDescription>{common.etats.erreurGenerique}</EmptyStateDescription>
        </EmptyState>
      </Section>
    );
  }

  const section = sectionResult.data;
  const items = itemsResult.data;

  return (
    <Section tone="night" data-section="competences">
      <Constellation className="z-0" />
      <div className="relative z-10">
        <SectionHeader
          eyebrow={section.eyebrow ?? undefined}
          title={section.titre}
          titleAccent={section.titre_accent ?? undefined}
        />
        <ul className="mt-10 grid grid-cols-1 gap-[1.25rem] sm:grid-cols-2 lg:grid-cols-3 grid-auto-rows-[1fr]">
          {items.map((item, index) => {
            const teinte = CARD_TEINTES[item.cle] ?? { a: "var(--violet)", b: "var(--indigo)" };
            const Picto = resolvePictogram(item.cle);

            return (
              <Reveal
                key={item.id}
                as="li"
                dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}
                className="h-full"
              >
                <div
                  data-slot="card"
                  className="relative flex h-full min-h-[13.5rem] flex-col gap-[0.9rem] rounded-[22px] border border-[var(--glass-line)] bg-[var(--glass)] p-[1.6rem] backdrop-blur-[6px] transition-[transform,background-color,border-color] duration-[var(--duration-base)] ease-[var(--ease-brand)] hover:-translate-y-[7px] hover:bg-[var(--glass-2)] hover:border-[var(--glass-line-2)]"
                  style={
                    {
                      "--tuile-a": teinte.a,
                      "--tuile-b": teinte.b,
                    } as React.CSSProperties
                  }
                >
                  <CardSpotlight />
                  {Picto ? (
                    <span
                      aria-hidden="true"
                      className="flex size-[52px] shrink-0 items-center justify-center rounded-[16px] bg-[linear-gradient(140deg,var(--tuile-a)_0%,var(--tuile-b)_100%)] shadow-[0_14px_34px_-10px_color-mix(in_srgb,var(--tuile-b)_80%,transparent)]"
                    >
                      <Picto className="size-6 text-white" />
                    </span>
                  ) : null}
                  <div>
                    <p className="font-heading text-[length:var(--text-card)] leading-[var(--text-card--line-height)] font-bold tracking-[-0.02em] text-white">
                      {item.titre}
                    </p>
                    <p className="mt-[0.5rem] text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-white/72">
                      {item.description}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    data-slot="competence-rule"
                    className="mt-auto h-0.5 w-full rounded-full bg-[linear-gradient(90deg,var(--tuile-a),var(--tuile-b))]"
                  />
                </div>
              </Reveal>
            );
          })}
        </ul>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button
            render={<Link href="/reservation" />}
            nativeButton={false}
            data-magnetic="true"
            className="min-h-11 bg-white text-[var(--deep)] shadow-[0_20px_40px_-18px_rgba(0,0,0,.45)] hover:bg-white hover:text-[var(--deep)] hover:shadow-[0_28px_54px_-20px_rgba(0,0,0,.5)]"
          >
            {common.actions.prendreRdv}
          </Button>
          <Button
            variant="outline"
            render={<Link href="/programme" />}
            nativeButton={false}
            className="min-h-11 border-[var(--glass-line)] bg-[var(--glass)] text-white hover:bg-[var(--glass-2)] hover:text-white"
          >
            {common.actions.voirProgramme}
          </Button>
        </div>
      </div>
    </Section>
  );
}

export { Competences };

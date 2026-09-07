import { Award } from "lucide-react";
import { Section, SectionHeader } from "@/components/sections/section";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { CardSpotlight } from "@/components/motion/card-spotlight";
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
    <Section tone="default" data-section="competences">
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
                className="relative flex h-full min-h-[13.5rem] flex-col gap-[0.9rem] rounded-[22px] border border-[var(--hairline)] bg-white p-[1.6rem] shadow-[0_1px_2px_var(--carte-ombre-1),0_24px_50px_-28px_var(--carte-ombre-2)] transition-[transform,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-brand)] hover:-translate-y-[7px] hover:shadow-[0_1px_2px_var(--carte-ombre-1),0_24px_50px_-28px_color-mix(in_srgb,var(--tuile-b)_55%,transparent)]"
                style={
                  {
                    "--tuile-a": teinte.a,
                    "--tuile-b": teinte.b,
                    "--carte-ombre-1": "color-mix(in srgb, var(--tuile-b) 8%, transparent)",
                    "--carte-ombre-2": "color-mix(in srgb, var(--tuile-b) 42%, transparent)",
                  } as React.CSSProperties
                }
              >
                <CardSpotlight />
                {Picto ? (
                  <span
                    aria-hidden="true"
                    className="flex size-[52px] shrink-0 items-center justify-center rounded-[16px] bg-[linear-gradient(140deg,var(--tuile-a)_0%,var(--tuile-b)_100%)]"
                  >
                    <Picto className="size-6 text-white" />
                  </span>
                ) : null}
                <div>
                  <p className="font-heading text-[length:var(--text-card)] leading-[var(--text-card--line-height)] font-bold tracking-[-0.02em] text-[var(--ink)]">
                    {item.titre}
                  </p>
                  <p className="mt-[0.5rem] text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--ink-soft)]">
                    {item.description}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}

export { Competences };

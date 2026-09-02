import { Award } from "lucide-react";
import { Section, SectionHeader } from "@/components/sections/section";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { pictograms, type PictogramName } from "@/components/icons/pictograms";
import { getSection, getSectionItems } from "@/lib/content/queries";
import common from "@/locales/fr/common.json";

/**
 * PUB-03 — the chromatic wall (D-53). Six full-color result tiles, one hue
 * per competency, on the `default` (untinted) tone that alternates against
 * the tinted PourQui/ProgrammeAccordion sections either side of it (D-49).
 */
const CARD_TEINTES: Record<string, { soft: string; ink: string }> = {
  "ecosysteme-ariba": { soft: "var(--violet-soft)", ink: "var(--violet-ink)" },
  "procure-to-pay": { soft: "var(--azur-soft)", ink: "var(--azur-ink)" },
  "source-to-pay": { soft: "var(--mint-soft)", ink: "var(--mint-ink)" },
  "rfq-rfp": { soft: "var(--amber-soft)", ink: "var(--amber-ink)" },
  "gestion-catalogues": { soft: "var(--magenta-soft)", ink: "var(--magenta-ink)" },
  certification: { soft: "var(--coral-soft)", ink: "var(--coral-ink)" },
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
    <Section tone="default">
      <SectionHeader
        eyebrow={section.eyebrow ?? undefined}
        title={section.titre}
        titleAccent={section.titre_accent ?? undefined}
      />
      <ul className="mt-10 grid grid-cols-1 gap-[1.25rem] sm:grid-cols-2 lg:grid-cols-3 grid-auto-rows-[1fr]">
        {items.map((item, index) => {
          const teinte = CARD_TEINTES[item.cle] ?? {
            soft: "var(--violet-soft)",
            ink: "var(--violet-ink)",
          };
          const Picto = resolvePictogram(item.cle);

          return (
            <Reveal
              key={item.id}
              as="li"
              dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}
              className="h-full"
            >
              <div
                className="rounded-[20px] overflow-hidden p-[1.6rem] min-h-[13.5rem] h-full flex flex-col gap-[0.9rem] bg-[var(--tuile-soft)] transition-transform duration-[var(--duration-base)] ease-[var(--ease-brand)] hover:-translate-y-[2px]"
                style={{ "--tuile-soft": teinte.soft, "--tuile-ink": teinte.ink } as React.CSSProperties}
              >
                {Picto ? (
                  <Picto aria-hidden="true" className="size-7 shrink-0 text-[var(--tuile-ink)]" />
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

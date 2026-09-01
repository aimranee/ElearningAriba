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
const CARD_ACCENTS: Record<string, string> = {
  "ecosysteme-ariba": "var(--violet)",
  "procure-to-pay": "var(--blue)",
  "source-to-pay": "var(--mint)",
  "rfq-rfp": "var(--amber)",
  "gestion-catalogues": "var(--indigo)",
  certification: "var(--sky)",
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
          const accent = CARD_ACCENTS[item.cle] ?? "var(--violet)";
          const Picto = resolvePictogram(item.cle);

          return (
            <Reveal
              key={item.id}
              as="li"
              dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}
              className="h-full"
            >
              <div
                className="rounded-[20px] overflow-hidden p-[1.6rem] min-h-[13.5rem] h-full relative group bg-white border border-[color-mix(in_srgb,var(--card-accent)_22%,transparent)] transition-transform duration-[var(--duration-base)] ease-[var(--ease-brand)] hover:-translate-y-[2px]"
                style={{ "--card-accent": accent } as React.CSSProperties}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none opacity-[0.73] transition-opacity duration-[var(--duration-base)] ease-[var(--ease-brand)] group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(150deg, color-mix(in srgb, var(--card-accent) 30%, white) 0%, white 72%)",
                  }}
                />
                {/* why (D-55, 2026-09-01): the tile rose 2px while its own
                    watermark dropped 6px — opposing vectors that visibly
                    detached the icon from its card — and the element is
                    clipped by the tile's edge, so any offset re-cropped it
                    and changed its silhouette mid-motion. A 150px shape
                    blooms; it doesn't travel. */}
                {Picto ? (
                  <Picto
                    aria-hidden="true"
                    className="absolute -bottom-7 -right-7 size-[150px] pointer-events-none text-[var(--card-accent)] opacity-[0.18] transition-opacity duration-[var(--duration-reveal)] ease-[var(--ease-brand)] group-hover:opacity-[0.26]"
                  />
                ) : null}
                <div
                  data-slot="competence-rule"
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-[3px] bg-[var(--card-accent)]"
                />
                <div className="relative z-[1]">
                  <p className="font-heading text-[1.08rem] leading-[1.3] font-bold tracking-[-0.02em] text-[var(--ink)]">
                    {item.titre}
                  </p>
                  <p className="text-[0.92rem] leading-[1.55] text-[var(--ink-soft)] mt-[0.5rem]">
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

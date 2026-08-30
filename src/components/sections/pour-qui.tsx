import { Section, SectionHeader } from "@/components/sections/section";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { pictograms, type PictogramName } from "@/components/icons/pictograms";
import { getSection, getSectionItems } from "@/lib/content/queries";
import common from "@/locales/fr/common.json";

/**
 * PUB-02 — five floating profil tiles read from `pour-qui`. Six-column
 * asymmetric grid at >=1000px (items 1-3 span two, items 4-5 span three,
 * matching the maquette's `.profils` rule), two equal columns below 1000px,
 * one below 640px. `tone="default"` keeps the section transparent so the
 * root atmosphere layer reads through (D-20).
 */
async function PourQui() {
  const [sectionResult, itemsResult] = await Promise.all([
    getSection("pour-qui"),
    getSectionItems("pour-qui"),
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
  const profils = itemsResult.data;

  return (
    <Section tone="default">
      <SectionHeader
        eyebrow={section.eyebrow ?? undefined}
        title={section.titre}
        titleAccent={section.titre_accent ?? undefined}
        lead={section.lead ?? undefined}
      />
      <ul className="mt-10 grid grid-cols-1 gap-[1.35rem] sm:grid-cols-2 min-[1000px]:grid-cols-6">
        {profils.map((profil, index) => {
          const Picto = profil.picto ? pictograms[profil.picto as PictogramName] : null;
          return (
            <Reveal
              key={profil.id}
              as="li"
              dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}
              className={
                index < 3 ? "min-[1000px]:col-span-2" : "min-[1000px]:col-span-3"
              }
            >
              <Card variant="raised" className="group h-full p-[1.7rem]">
                {Picto ? (
                  <span
                    aria-hidden="true"
                    className="flex size-[52px] shrink-0 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,var(--violet),var(--deep))] text-white shadow-[0_12px_24px_-10px_rgba(99,91,255,.6)] transition-transform duration-[500ms] ease-[var(--ease-brand)] group-hover:scale-[1.08] group-hover:-rotate-[4deg]"
                  >
                    <Picto className="size-6" />
                  </span>
                ) : null}
                <CardTitle className="mt-3 text-[1.08rem] leading-[1.3] font-bold tracking-[-0.02em]">
                  {profil.titre}
                </CardTitle>
                <CardDescription className="text-[0.94rem] leading-[1.6] text-[var(--muted-ink)]">
                  {profil.description}
                </CardDescription>
              </Card>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}

export { PourQui };

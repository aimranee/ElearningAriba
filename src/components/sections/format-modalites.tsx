import { Clock, FileText, KeyRound, PlayCircle, Radio, Target, type LucideIcon } from "lucide-react";

import { Section, SectionHeader } from "@/components/sections/section";
import { Card } from "@/components/ui/card";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { getSection, getSectionItems } from "@/lib/content/queries";
import common from "@/locales/fr/common.json";

/* why: format-modalites items carry no domain picto column — pictograms.tsx's
   own header reserves marks this generic (broadcast, doc, clock...) for
   lucide-react at the call site, never redrawn into the domain sprite.
   Mapped by the item's stable slugified cle rather than a positional index,
   so a DB reorder can't silently mismatch the icon. */
const FORMAT_ICONS: Record<string, LucideIcon> = {
  "formations-live": Radio,
  "supports-pdf": FileText,
  "videos-a-venir": PlayCircle,
  "duree-d-acces": Clock,
  "cas-pratiques-en-fin-de-module": Target,
  prerequis: KeyRound,
};

/**
 * PUB-05 — the six format repères, on the --lav2 tinted band (D-21) that
 * alternates against the transparent ProgrammeAccordion/Confiance sections
 * either side of it. The `futur` item (Vidéos à venir) wears the maquette's
 * honest amber marker — never presented as delivered (D-31's sibling rule
 * for a different kind of not-yet-shipped content).
 */
async function FormatModalites() {
  const [sectionResult, itemsResult] = await Promise.all([
    getSection("format-modalites"),
    getSectionItems("format-modalites"),
  ]);

  if (!sectionResult.ok || !itemsResult.ok) {
    return (
      <Section tone="band">
        <EmptyState tone="error">
          <EmptyStateDescription>{common.etats.erreurGenerique}</EmptyStateDescription>
        </EmptyState>
      </Section>
    );
  }

  const section = sectionResult.data;
  const items = itemsResult.data;

  return (
    <Section tone="band">
      <SectionHeader
        eyebrow={section.eyebrow ?? undefined}
        title={section.titre}
        titleAccent={section.titre_accent ?? undefined}
        lead={section.lead ?? undefined}
      />
      <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item, index) => {
          const Icon = FORMAT_ICONS[item.cle];
          const isFutur = item.statut === "futur";
          return (
            <Reveal key={item.id} as="li" dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}>
              <Card variant="tint" className="h-full flex-row items-start gap-4 px-[1.5rem] py-[1.4rem]">
                {Icon ? (
                  <span
                    aria-hidden="true"
                    className={
                      isFutur
                        ? "flex size-[42px] shrink-0 items-center justify-center rounded-[13px] bg-[#FFF4E3] text-[#B4771A]"
                        : "flex size-[42px] shrink-0 items-center justify-center rounded-[13px] bg-[var(--lav)] text-[var(--deep)]"
                    }
                  >
                    <Icon className="size-5" />
                  </span>
                ) : null}
                <div className="flex flex-col gap-[0.3rem]">
                  <p className="text-[1.02rem] leading-[1.3] font-bold tracking-[-0.02em]">
                    {item.titre}
                    {isFutur ? (
                      <span className="ml-2 inline-flex items-center rounded-full bg-[#FFF4E3] px-[0.55rem] py-[0.22rem] align-middle text-[0.68rem] font-bold tracking-[0.06em] text-[#B4771A] uppercase">
                        À venir
                      </span>
                    ) : null}
                  </p>
                  {item.description ? (
                    <p className="text-[0.94rem] leading-[1.6] text-[var(--muted-ink)]">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </Card>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}

export { FormatModalites };

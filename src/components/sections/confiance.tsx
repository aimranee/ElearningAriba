import { BadgeCheck, Camera, RefreshCw, Shield, type LucideIcon } from "lucide-react";

import { Section, SectionHeader } from "@/components/sections/section";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { getSection, getSectionItems } from "@/lib/content/queries";
import common from "@/locales/fr/common.json";

/* why: the three faits carry generic marks (shield/badge/refresh), the same
   class pictograms.tsx's header reserves for lucide-react at the call site
   rather than the domain sprite. Keyed by the item's stable slugified cle. */
const CONFIANCE_ICONS: Record<string, LucideIcon> = {
  "protection-des-donnees": Shield,
  "experts-sap-ariba-certifies": BadgeCheck,
  "contenus-regulierement-mis-a-jour": RefreshCw,
};

/**
 * PUB-06 — three trust facts as floating cards (same 52x52 gradient tile as
 * pour-qui's profils), plus two honest dashed placeholders for the
 * témoignages and logos slots (D-31). The placeholder branch keys off the
 * row's own `statut === "placeholder"`, never a positional index, and never
 * renders a name, a quote, a star rating or a partner logo.
 */
async function Confiance() {
  const [sectionResult, itemsResult] = await Promise.all([
    getSection("confiance"),
    getSectionItems("confiance"),
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
  const faits = itemsResult.data.filter((item) => item.statut !== "placeholder");
  const placeholders = itemsResult.data.filter((item) => item.statut === "placeholder");

  return (
    <Section tone="band">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <SectionHeader
          eyebrow={section.eyebrow ?? undefined}
          title={section.titre}
          titleAccent={section.titre_accent ?? undefined}
          lead={section.lead ?? undefined}
          className="mx-0 max-w-none text-left"
        />
        <Reveal
          as="figure"
          dataD={2}
          className="grid aspect-[16/9] place-items-center gap-2 rounded-[20px] border-[1.5px] border-dashed border-[#D6D3F0] bg-[var(--tint-violet)] p-6 text-center"
        >
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-[14px] border border-[var(--hairline)] bg-white text-[var(--violet)]"
          >
            <Camera className="size-5" />
          </span>
          <span className="text-[0.68rem] font-bold tracking-[0.14em] text-[var(--violet)] uppercase">
            {common.photoSlot.label}
          </span>
          <p className="max-w-[30ch] text-[0.9rem] text-[var(--muted-ink)]">
            {common.photoSlot.description}
          </p>
        </Reveal>
      </div>
      <ul className="mt-[3.25rem] grid grid-cols-1 gap-[1.35rem] sm:grid-cols-2 lg:grid-cols-3">
        {faits.map((fait, index) => {
          const Icon = CONFIANCE_ICONS[fait.cle];
          return (
            <Reveal key={fait.id} as="li" dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}>
              <Card variant="default" className="group h-full p-[1.7rem]">
                {Icon ? (
                  <span
                    aria-hidden="true"
                    className="flex size-[52px] shrink-0 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,var(--violet),var(--deep))] text-white shadow-[0_12px_24px_-10px_rgba(99,91,255,.6)] transition-transform duration-[500ms] ease-[var(--ease-brand)] group-hover:scale-[1.08] group-hover:-rotate-[4deg]"
                  >
                    <Icon className="size-6" />
                  </span>
                ) : null}
                {fait.titre ? (
                  <CardTitle className="mt-3 text-[1.08rem] leading-[1.3] font-bold tracking-[-0.02em]">
                    {fait.titre}
                  </CardTitle>
                ) : null}
                {fait.description ? (
                  <CardDescription className="text-[0.94rem] leading-[1.6] text-[var(--muted-ink)]">
                    {fait.description}
                  </CardDescription>
                ) : null}
              </Card>
            </Reveal>
          );
        })}
      </ul>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {placeholders.map((placeholder, index) => (
          <Reveal
            key={placeholder.id}
            dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}
            className="flex flex-col items-center gap-2 rounded-[18px] border-[1.5px] border-dashed border-[#D6D3F0] bg-white/50 px-6 py-8 text-center"
          >
            {placeholder.titre ? (
              <span className="text-[0.68rem] font-bold tracking-[0.14em] text-[var(--violet)] uppercase">
                {placeholder.titre}
              </span>
            ) : null}
            {placeholder.description ? (
              <p className="text-[0.94rem] text-[var(--muted-ink)]">{placeholder.description}</p>
            ) : null}
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export { Confiance };

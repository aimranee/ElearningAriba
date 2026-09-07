import Link from "next/link";
import { z } from "zod";

import { Section, SectionHeader } from "@/components/sections/section";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { getSection, getSectionItems } from "@/lib/content/queries";
import common from "@/locales/fr/common.json";
import landing from "@/locales/fr/landing.json";

/* why: `donnees` is jsonb — validated at the read boundary (CLAUDE.md)
   rather than trusted unchecked; a malformed row is dropped instead of
   crashing the whole section. */
const faqDonneesSchema = z.object({
  question: z.string(),
  reponse: z.string(),
});

type FaqEntry = { id: string; question: string; reponse: string };

/**
 * PUB-07 (FAQ half) — seven entries reused through the Lot 1 Accordion
 * family (D-42): no second accordion implementation, no raw browser toggle
 * markup. Scale copied literally from `programme-accordion.tsx` (D-70): no
 * new design value invented here. First entry opens on load.
 */
async function Faq() {
  const [sectionResult, itemsResult] = await Promise.all([
    getSection("faq"),
    getSectionItems("faq"),
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

  const entries: FaqEntry[] = [];
  for (const item of itemsResult.data) {
    const parsed = faqDonneesSchema.safeParse(item.donnees);
    if (parsed.success) {
      entries.push({ id: item.id, ...parsed.data });
    }
  }

  return (
    <Section tone="default" data-section="faq">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
        <div className="lg:sticky lg:top-[100px]">
          <SectionHeader
            eyebrow={section.eyebrow ?? undefined}
            title={section.titre}
            titleAccent={section.titre_accent ?? undefined}
            className="mx-0 max-w-none text-left"
          />
          <p className="mt-6 text-[length:var(--text-body)] leading-[var(--text-body--line-height)] text-[var(--muted-ink)]">
            {landing.faq.cloture.question}{" "}
            <Link
              href="/contact"
              className="font-semibold text-[var(--deep)] underline underline-offset-4 hover:text-[var(--violet-ink)]"
            >
              {landing.faq.cloture.lien}
            </Link>
          </p>
        </div>

        <Accordion className="gap-[0.9rem]" defaultValue={entries[0] ? [entries[0].id] : []}>
          {entries.map((entry, index) => (
            <Reveal key={entry.id} dataD={((index % 3) + 1) as 1 | 2 | 3}>
              <AccordionItem
                value={entry.id}
                className="rounded-[20px] border border-[var(--hairline)] bg-[var(--tint)] shadow-none transition-[background-color,border-color] duration-[var(--duration-base)] ease-[var(--ease-brand)] hover:bg-white hover:border-[var(--hairline-2)] data-[open]:bg-white data-[open]:border-[var(--hairline-2)]"
              >
                <AccordionHeader>
                  <AccordionTrigger className="group gap-4 rounded-[18px] px-[1.5rem] py-[1.35rem] transition-colors duration-[var(--duration-base)] ease-[var(--ease-brand)] hover:bg-transparent hover:text-[var(--deep)] [&_svg[data-slot=accordion-chevron]]:hidden">
                    <span className="flex-1 text-[length:var(--text-card)] leading-[var(--text-card--line-height)] font-bold tracking-[-0.015em]">
                      {entry.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className="relative flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[var(--lav)] text-[var(--deep)]"
                    >
                      <span className="absolute h-0.5 w-3 rounded-full bg-current" />
                      <span className="absolute h-0.5 w-3 rotate-90 rounded-full bg-current transition-transform duration-[var(--duration-base)] ease-[var(--ease-brand)] group-data-[panel-open]:rotate-0" />
                    </span>
                  </AccordionTrigger>
                </AccordionHeader>
                <AccordionPanel className="text-[length:var(--text-body)] leading-[var(--text-body--line-height)] text-[var(--muted-ink)]">
                  {entry.reponse}
                </AccordionPanel>
              </AccordionItem>
            </Reveal>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

export { Faq };

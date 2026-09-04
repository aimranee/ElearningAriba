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
    <Section tone="default">
      <SectionHeader
        eyebrow={section.eyebrow ?? undefined}
        title={section.titre}
        titleAccent={section.titre_accent ?? undefined}
        className="max-w-[880px]"
      />
      <Accordion
        className="mx-auto mt-10 max-w-[880px] gap-[0.9rem]"
        defaultValue={entries[0] ? [entries[0].id] : []}
      >
        {entries.map((entry, index) => (
          <Reveal key={entry.id} dataD={((index % 3) + 1) as 1 | 2 | 3}>
            <AccordionItem
              value={entry.id}
              className="rounded-[20px] border border-[var(--hairline)] bg-[var(--tint)] shadow-none transition-[background-color,border-color] duration-[var(--duration-base)] ease-[var(--ease-brand)] hover:bg-white hover:border-[var(--hairline-2)] data-[panel-open]:bg-white data-[panel-open]:border-[var(--hairline-2)]"
            >
              <AccordionHeader>
                <AccordionTrigger className="gap-4 rounded-[18px] px-[1.5rem] py-[1.35rem] transition-colors duration-[var(--duration-base)] ease-[var(--ease-brand)] hover:bg-transparent hover:text-[var(--deep)]">
                  <span className="flex-1 text-[length:var(--text-card)] leading-[var(--text-card--line-height)] font-bold tracking-[-0.015em]">
                    {entry.question}
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

      <p className="mx-auto mt-8 max-w-[880px] text-center text-[length:var(--text-body)] leading-[var(--text-body--line-height)] text-[var(--muted-ink)]">
        {landing.faq.cloture.question}{" "}
        <Link
          href="/contact"
          className="font-semibold text-[var(--deep)] underline underline-offset-4 hover:text-[var(--violet-ink)]"
        >
          {landing.faq.cloture.lien}
        </Link>
      </p>
    </Section>
  );
}

export { Faq };

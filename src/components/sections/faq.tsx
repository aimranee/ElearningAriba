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
 * family (D-42): no second accordion implementation, no raw browser toggle markup.
 */
async function Faq() {
  const [sectionResult, itemsResult] = await Promise.all([
    getSection("faq"),
    getSectionItems("faq"),
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

  const entries: FaqEntry[] = [];
  for (const item of itemsResult.data) {
    const parsed = faqDonneesSchema.safeParse(item.donnees);
    if (parsed.success) {
      entries.push({ id: item.id, ...parsed.data });
    }
  }

  return (
    <Section tone="band">
      <SectionHeader
        eyebrow={section.eyebrow ?? undefined}
        title={section.titre}
        titleAccent={section.titre_accent ?? undefined}
        className="max-w-[880px]"
      />
      <Accordion className="mx-auto mt-10 max-w-[880px] gap-[0.8rem]">
        {entries.map((entry, index) => (
          <Reveal key={entry.id} dataD={((index % 3) + 1) as 1 | 2 | 3}>
            <AccordionItem>
              <AccordionHeader>
                <AccordionTrigger>{entry.question}</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>{entry.reponse}</AccordionPanel>
            </AccordionItem>
          </Reveal>
        ))}
      </Accordion>
    </Section>
  );
}

export { Faq };

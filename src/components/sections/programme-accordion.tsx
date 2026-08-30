import Link from "next/link";
import { Download } from "lucide-react";

import { Section, SectionHeader } from "@/components/sections/section";
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { getModules, getSection, getSectionItems } from "@/lib/content/queries";
import { formatHours } from "@/lib/i18n/fr";
import common from "@/locales/fr/common.json";

/**
 * PUB-04 — five programme modules read from `getModules()`, rendered through
 * the Lot 1 Accordion family (D-42, no second accordion). The first module
 * opens by default. Below it, a ghost PDF-download CTA (route built in
 * 02-08, D-24 label) and a primary reservation CTA (D-12 magnetic).
 */
async function ProgrammeAccordion() {
  const [sectionResult, modulesResult, itemsResult] = await Promise.all([
    getSection("programme"),
    getModules(),
    getSectionItems("programme"),
  ]);

  if (!sectionResult.ok || !modulesResult.ok || !itemsResult.ok) {
    return (
      <Section tone="default">
        <EmptyState tone="error">
          <EmptyStateDescription>{common.etats.erreurGenerique}</EmptyStateDescription>
        </EmptyState>
      </Section>
    );
  }

  const section = sectionResult.data;
  const modules = modulesResult.data;
  const telechargerPdf = itemsResult.data.find(
    (item) => item.cle === "telecharger-pdf",
  )?.titre;

  return (
    <Section tone="default">
      <SectionHeader
        eyebrow={section.eyebrow ?? undefined}
        title={section.titre}
        titleAccent={section.titre_accent ?? undefined}
      />
      <Accordion
        className="mt-10 gap-[0.9rem]"
        defaultValue={modules[0] ? [modules[0].id] : []}
      >
        {modules.map((module, index) => (
          <Reveal
            key={module.id}
            as="div"
            dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}
          >
            <AccordionItem
              value={module.id}
              className="rounded-[18px] border-none bg-white shadow-[var(--shadow-2)] transition-shadow duration-[420ms] ease-[var(--ease-brand)] data-[panel-open]:shadow-[var(--shadow-3)]"
            >
              <AccordionHeader>
                <AccordionTrigger className="gap-4 rounded-[18px] px-[1.5rem] py-[1.35rem] transition-colors duration-[300ms] ease-[var(--ease-brand)] hover:bg-transparent hover:text-[var(--deep)]">
                  <span
                    aria-hidden="true"
                    className="flex size-[34px] shrink-0 items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,var(--violet),var(--deep))] font-heading text-[0.78rem] font-extrabold text-white tabular-nums"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-[1.02rem] font-bold tracking-[-0.015em]">
                    {module.titre}
                  </span>
                  <span className="hidden shrink-0 rounded-full bg-[var(--lav)] px-[0.7rem] py-[0.32rem] text-[0.8rem] font-semibold text-[var(--deep)] tabular-nums sm:inline-block">
                    {formatHours(module.dureeHeures)}
                  </span>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel className="text-[0.96rem] leading-[1.65] text-[var(--muted-ink)]">
                {module.description}
              </AccordionPanel>
            </AccordionItem>
          </Reveal>
        ))}
      </Accordion>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {telechargerPdf ? (
          <Button variant="ghost" render={<a href="/programme.pdf" />}>
            <Download aria-hidden="true" />
            {telechargerPdf}
          </Button>
        ) : null}
        <Button render={<Link href="/reservation" />} data-magnetic="true">
          {common.actions.reserver}
        </Button>
      </div>
    </Section>
  );
}

export { ProgrammeAccordion };

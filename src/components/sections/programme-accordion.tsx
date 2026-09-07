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
import landing from "@/locales/fr/landing.json";

/**
 * PUB-04 — five programme modules read from `getModules()`, rendered through
 * the Lot 1 Accordion family (D-42, no second accordion). The first module
 * opens by default. Below it, a ghost PDF-download CTA (route built in
 * 02-08, D-24 label) and a primary reservation CTA (D-12 magnetic).
 */
async function ProgrammeAccordion() {
  const [sectionResult, modulesResult, itemsResult, pdfResult] = await Promise.all([
    getSection("programme"),
    getModules(),
    getSectionItems("programme"),
    getSectionItems("page-programme"),
  ]);

  if (!sectionResult.ok || !modulesResult.ok || !itemsResult.ok) {
    return (
      <Section tone="wash">
        <EmptyState tone="error">
          <EmptyStateDescription>{common.etats.erreurGenerique}</EmptyStateDescription>
        </EmptyState>
      </Section>
    );
  }

  const section = sectionResult.data;
  const modules = modulesResult.data;
  // why (2026-09-01): telecharger-pdf has no duree_heures, and getModules()
  // rejects the whole section if any item lacks one — seeding it into
  // "programme" would break the render. Its label lives in "page-programme"
  // instead, and this query stays outside the error guard above so its own
  // failure only hides the CTA, never blanks the section.
  const telechargerPdf = pdfResult.ok
    ? pdfResult.data.find((item) => item.cle === "telecharger-pdf")?.titre
    : undefined;

  return (
    <Section tone="wash" data-section="programme">
      <SectionHeader
        eyebrow={section.eyebrow ?? undefined}
        title={section.titre}
        titleAccent={section.titre_accent ?? undefined}
      />
      <Reveal as="div" className="relative mx-auto mt-11 max-w-[54rem]">
        <span
          aria-hidden="true"
          data-slot="timeline-line"
          className="absolute left-[27px] top-5 bottom-5 w-0.5 bg-[linear-gradient(180deg,var(--violet),var(--sky-ink)_60%,var(--mint-ink))]"
        />
        <Accordion
          className="relative gap-4"
          defaultValue={modules[0] ? [modules[0].id] : []}
        >
          {modules.map((module, index) => (
            <Reveal
              key={module.id}
              as="div"
              dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}
              className="grid grid-cols-[56px_1fr] items-start gap-2"
            >
              <span
                aria-hidden="true"
                className="relative z-[1] mt-[0.9rem] ml-2 flex size-[38px] shrink-0 items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,var(--violet),var(--deep))] font-heading text-[length:var(--text-micro)] font-extrabold text-white tabular-nums shadow-[0_0_0_6px_white,0_10px_20px_-10px_rgba(99,91,255,.7)]"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <AccordionItem
                value={module.id}
                className="rounded-[20px] border border-[var(--hairline)] bg-[var(--tint)] shadow-none transition-[background-color,border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-brand)] hover:bg-white hover:border-[var(--hairline-2)] data-[open]:bg-white data-[open]:border-[var(--hairline-2)] data-[open]:shadow-[var(--shadow-1)]"
              >
                <AccordionHeader>
                  <AccordionTrigger className="gap-4 rounded-[18px] px-[1.5rem] py-[1.35rem] transition-colors duration-[var(--duration-base)] ease-[var(--ease-brand)] hover:bg-transparent hover:text-[var(--deep)]">
                    <span className="flex-1 text-[length:var(--text-card)] leading-[var(--text-card--line-height)] font-bold tracking-[-0.015em]">
                      {module.titre}
                    </span>
                    <span className="hidden shrink-0 rounded-full bg-[var(--lav)] px-[0.7rem] py-[0.32rem] text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] font-semibold text-[var(--deep)] tabular-nums sm:inline-block">
                      {formatHours(module.dureeHeures)}
                    </span>
                  </AccordionTrigger>
                </AccordionHeader>
                <AccordionPanel className="text-[length:var(--text-body)] leading-[var(--text-body--line-height)] text-[var(--muted-ink)]">
                  <p className="text-[length:var(--text-body)] leading-[var(--text-body--line-height)] text-[var(--muted-ink)]">
                    {module.description}
                  </p>
                  {module.contenu.length > 0 ? (
                    <>
                      <p className="mt-[1.1rem] text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] font-semibold uppercase tracking-[0.14em] text-[var(--deep)]">
                        {landing.programme.auProgramme}
                      </p>
                      <ul className="mt-[0.55rem] flex flex-col gap-[0.4rem]">
                        {module.contenu.map((ligne) => (
                          <li
                            key={ligne}
                            className="flex items-start gap-[0.6rem] text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--muted-ink)]"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-[0.55rem] size-1 shrink-0 rounded-full bg-[var(--violet)] opacity-60"
                            />
                            {ligne}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </AccordionPanel>
              </AccordionItem>
            </Reveal>
          ))}
        </Accordion>
      </Reveal>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {telechargerPdf ? (
          <Button
            variant="ghost"
            render={<a href="/programme.pdf" />}
            nativeButton={false}
            className="min-h-11"
          >
            <Download aria-hidden="true" />
            {telechargerPdf}
          </Button>
        ) : null}
        <Button
          render={<Link href="/reservation" />}
          nativeButton={false}
          data-magnetic="true"
          className="min-h-11"
        >
          {common.actions.reserver}
        </Button>
      </div>
    </Section>
  );
}

export { ProgrammeAccordion };

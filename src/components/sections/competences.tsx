import { Section, SectionHeader } from "@/components/sections/section";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { Reveal } from "@/components/motion/reveal";
import { pictograms, type PictogramName } from "@/components/icons/pictograms";
import { getSection, getSectionItems } from "@/lib/content/queries";
import common from "@/locales/fr/common.json";

/**
 * PUB-03 — six competency rows read from `competences`, on the --lav2
 * tinted band (D-21) that alternates against the transparent PourQui/
 * ProgrammeAccordion sections either side of it.
 */
async function Competences() {
  const [sectionResult, itemsResult] = await Promise.all([
    getSection("competences"),
    getSectionItems("competences"),
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
      />
      <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 min-[1000px]:grid-cols-3">
        {items.map((item, index) => {
          const Picto = item.picto ? pictograms[item.picto as PictogramName] : null;
          return (
            <Reveal
              key={item.id}
              as="li"
              dataD={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}
              className="flex items-center gap-4 rounded-[18px] bg-white p-[1.15rem] px-[1.35rem] shadow-[var(--shadow-2)] transition-[transform,box-shadow] duration-[420ms] ease-[var(--ease-brand)] hover:-translate-y-[5px] hover:shadow-[var(--shadow-3)]"
            >
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[var(--lav)] font-heading text-[0.78rem] font-extrabold tracking-normal text-[var(--deep)] tabular-nums"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              {Picto ? <Picto className="size-5 shrink-0 text-[var(--deep)]" /> : null}
              <span className="text-[0.97rem] leading-[1.4] font-semibold tracking-[-0.01em]">
                {item.titre}
              </span>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}

export { Competences };

import { Section, SectionHeader } from "@/components/sections/section";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { FormatParcours } from "@/components/motion/format-parcours";
import { getModules, getSection, getSectionItems } from "@/lib/content/queries";
import { formatHours, formatNumber } from "@/lib/i18n/fr";
import common from "@/locales/fr/common.json";

/**
 * PUB-05 — the six format repères, on the --lav2 tinted band (D-21) that
 * alternates against the transparent ProgrammeAccordion/Confiance sections
 * either side of it. Run 3: v2 rewrite as a numbered "parcours" (niveau 1,
 * D-19 — zero box-shadow ever) with a sticky niveau-2 companion aside. The
 * `futur` item (Vidéos à venir) keeps the maquette's honest amber marker —
 * never presented as delivered (D-31's sibling rule for a different kind of
 * not-yet-shipped content).
 */
async function FormatModalites() {
  const [sectionResult, itemsResult, modulesResult] = await Promise.all([
    getSection("format-modalites"),
    getSectionItems("format-modalites"),
    getModules(),
  ]);

  if (!sectionResult.ok || !itemsResult.ok || !modulesResult.ok) {
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
  const moduleCount = modulesResult.data.length;
  const totalHours = modulesResult.data.reduce((sum, module) => sum + module.dureeHeures, 0);
  const aside = common.formatModalitesAside;
  const resume = aside.resume
    .replace("{modules}", formatNumber(moduleCount))
    .replace("{heures}", formatHours(totalHours));

  return (
    <Section tone="default">
      <SectionHeader
        eyebrow={section.eyebrow ?? undefined}
        title={section.titre}
        titleAccent={section.titre_accent ?? undefined}
        lead={section.lead ?? undefined}
      />
      <FormatParcours items={items} aside={{ ...common.formatModalitesAside, resume }} />
    </Section>
  );
}

export { FormatModalites };

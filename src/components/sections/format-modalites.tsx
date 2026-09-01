import { Section, SectionHeader } from "@/components/sections/section";
import { EmptyState, EmptyStateDescription } from "@/components/ui/empty-state";
import { FormatDeroule } from "@/components/motion/format-deroule";
import {
  getFormationDeroule,
  getFormationFourni,
  getModules,
  getSection,
  getSectionItems,
} from "@/lib/content/queries";
import { formatHours, formatNumber } from "@/lib/i18n/fr";
import common from "@/locales/fr/common.json";
import landing from "@/locales/fr/landing.json";

/**
 * PUB-05 — the section renders `tone="default"` (transparent), alternating
 * against the `tone="band"` Programme/Confiance sections either side of it
 * (D-21). Run 4 (D-57): the left column is the real chronological `deroule`
 * of page-formation, the right column is a five-layout preview reusing the
 * hero's window chrome, and "Ce qui est fourni" is a band under both
 * columns. The deroule *is* the section — an empty/missing read renders the
 * D-32 error state, same as the other four reads below.
 */
async function FormatModalites() {
  const [sectionResult, itemsResult, derouleResult, fourniResult, modulesResult] =
    await Promise.all([
      getSection("format-modalites"),
      getSectionItems("format-modalites"),
      getFormationDeroule(),
      getFormationFourni(),
      getModules(),
    ]);

  if (
    !sectionResult.ok ||
    !itemsResult.ok ||
    !derouleResult.ok ||
    !fourniResult.ok ||
    !modulesResult.ok
  ) {
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
  const deroule = derouleResult.data;
  const fourni = fourniResult.data;
  const modules = modulesResult.data;

  const moduleCount = modules.length;
  const totalHours = modules.reduce((sum, module) => sum + module.dureeHeures, 0);
  const resume = common.formatModalitesAside.resume
    .replace("{modules}", formatNumber(moduleCount))
    .replace("{heures}", formatHours(totalHours));

  const introItem = items.find((item) => item.cle === "formations-live");
  const futurItem = items.find((item) => item.statut === "futur");

  const fourniLignes: { texte: string; coche: boolean }[] = [
    ...fourni.fourni.map((texte) => ({ texte, coche: true })),
    ...(fourni.prerequis ? [{ texte: fourni.prerequis, coche: true }] : []),
    ...(fourni.dureeAcces ? [{ texte: fourni.dureeAcces, coche: true }] : []),
    ...(futurItem?.description
      ? [{ texte: futurItem.description, coche: false }]
      : futurItem?.titre
        ? [{ texte: futurItem.titre, coche: false }]
        : []),
  ];

  return (
    <Section tone="default">
      <SectionHeader
        eyebrow={section.eyebrow ?? undefined}
        title={section.titre}
        titleAccent={section.titre_accent ?? undefined}
        lead={section.lead ?? undefined}
      />
      {introItem?.description ? (
        <p className="mx-auto mt-5 max-w-[52ch] text-center text-[0.98rem] leading-[1.6] text-[var(--muted-ink)]">
          {introItem.description}
        </p>
      ) : null}
      <FormatDeroule
        deroule={deroule}
        fourniLignes={fourniLignes}
        apercu={landing.formatModalites.apercu}
        premierModuleTitre={modules[0]?.titre ?? ""}
        resume={resume}
      />
    </Section>
  );
}

export { FormatModalites };

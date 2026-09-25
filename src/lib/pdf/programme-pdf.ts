import "server-only";

import { getModules, getSection } from "@/lib/content/queries";
import { formatHours } from "@/lib/i18n/fr";
import { buildPdf, layoutLines, type PdfLine } from "@/lib/pdf/writer";
import programme from "@/locales/fr/programme.json";

export type ProgrammePdfResult = { ok: true; bytes: Uint8Array } | { ok: false };

/**
 * Renders the programme PDF straight from `app.content_item` (D-29): the
 * title/subtitle come from the `page-programme` section row, the modules
 * from the same rows the Programme page reads (getModules), and the total
 * is a runtime sum of `dureeHeures` — never a literal 17 (D-30).
 */
export async function buildProgrammePdf(): Promise<ProgrammePdfResult> {
  const [sectionResult, modulesResult] = await Promise.all([
    getSection("page-programme"),
    getModules(),
  ]);

  if (!sectionResult.ok || !modulesResult.ok) {
    return { ok: false };
  }

  const section = sectionResult.data;
  const modules = modulesResult.data;

  const totalHours = modules.reduce((sum, module) => sum + module.dureeHeures, 0);

  const lines: PdfLine[] = [
    { text: section.titre, size: 22, weight: "bold", gapAfter: 6 },
  ];
  if (section.lead) {
    lines.push({ text: section.lead, size: 13, weight: "regular", gapAfter: 20 });
  }

  for (const currentModule of modules) {
    lines.push({
      text: `${currentModule.position}. ${currentModule.titre} — ${formatHours(currentModule.dureeHeures)}`,
      size: 14,
      weight: "bold",
      gapAfter: 6,
    });
    for (const objectif of currentModule.objectifs) {
      lines.push({ text: `• ${objectif}`, size: 11, weight: "regular", gapAfter: 2, hangingPrefix: "• " });
    }
    for (const item of currentModule.contenu) {
      lines.push({ text: `• ${item}`, size: 11, weight: "regular", gapAfter: 2, hangingPrefix: "• " });
    }
    lines.push({ text: "", size: 6, weight: "regular", gapAfter: 10 });
  }

  lines.push({
    text: `${programme.totalLabelPdf} : ${formatHours(totalHours)}`,
    size: 14,
    weight: "bold",
  });

  const pages = layoutLines(lines);
  const bytes = buildPdf(pages);

  return { ok: true, bytes };
}

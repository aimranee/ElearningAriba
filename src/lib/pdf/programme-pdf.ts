import "server-only";

import { getModules, getSection } from "@/lib/content/queries";
import { formatHours } from "@/lib/i18n/fr";
import type { Locale } from "@/lib/i18n/locale";
import { getMessages } from "@/lib/i18n/messages";
import { buildPdf, layoutLines, type PdfLine, type PdfOptions } from "@/lib/pdf/writer";

export type ProgrammePdfResult = { ok: true; bytes: Uint8Array } | { ok: false };

/* why (#25): the French PDF declares no language, as before #25, so its
   bytes stay the same; the English one declares British English. */
const PDF_OPTIONS: Record<Locale, PdfOptions> = {
  fr: {},
  en: { lang: "en-GB" },
};

/**
 * Renders the programme PDF straight from `app.content_item` (D-29): the
 * title/subtitle come from the `page-programme` section row, the modules
 * from the same rows the Programme page reads (getModules), and the total
 * is a runtime sum of `dureeHeures` — never a literal 17 (D-30).
 *
 * (#25) English reads the same rows' English columns, French field by field
 * where one is empty (localize.ts), and formats durations in British English.
 */
export async function buildProgrammePdf(locale: Locale = "fr"): Promise<ProgrammePdfResult> {
  const [sectionResult, modulesResult] = await Promise.all([
    getSection("page-programme", locale),
    getModules(locale),
  ]);

  if (!sectionResult.ok || !modulesResult.ok) {
    return { ok: false };
  }

  const programme = getMessages(locale, "programme");
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
      text: `${currentModule.position}. ${currentModule.titre} — ${formatHours(currentModule.dureeHeures, locale)}`,
      size: 14,
      weight: "bold",
      gapAfter: 6,
    });
    for (const objectif of currentModule.objectifs) {
      lines.push({ text: `• ${objectif}`, size: 11, weight: "regular", gapAfter: 2 });
    }
    for (const item of currentModule.contenu) {
      lines.push({ text: `• ${item}`, size: 11, weight: "regular", gapAfter: 2 });
    }
    lines.push({ text: "", size: 6, weight: "regular", gapAfter: 10 });
  }

  lines.push({
    text: programme.totalPdf.replace("{heures}", formatHours(totalHours, locale)),
    size: 14,
    weight: "bold",
  });

  const pages = layoutLines(lines);
  const bytes = buildPdf(pages, undefined, PDF_OPTIONS[locale]);

  return { ok: true, bytes };
}

/**
 * The HTTP answer of both programme PDF routes — /programme.pdf and
 * /en/programme.pdf. Each route file keeps its own `revalidate` (segment
 * config is read from the route file itself).
 */
export async function programmePdfResponse(locale: Locale): Promise<Response> {
  const programme = getMessages(locale, "programme");
  const result = await buildProgrammePdf(locale);

  if (!result.ok) {
    return new Response(programme.indisponiblePdf, {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // why: TS's DOM lib types Response's BodyInit against Uint8Array<ArrayBuffer>,
  // narrower than the Uint8Array<ArrayBufferLike> buildPdf returns — copy into
  // a plain-ArrayBuffer-backed view rather than widen the writer's return type.
  const body = new Uint8Array(result.bytes);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${programme.nomFichierPdf}"`,
    },
  });
}

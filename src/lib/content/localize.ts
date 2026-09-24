import type { Locale } from "@/lib/i18n/locale";
import type { Database, Json } from "@/types/database.types";

type SectionRow = Database["app"]["Tables"]["content_section"]["Row"];
type ItemRow = Database["app"]["Tables"]["content_item"]["Row"];
type JsonObject = { [key: string]: Json | undefined };

/*
 * why (#17, I18N-07): English is optional on every content row, French is
 * required. The English site reads each *_en column and falls back to the
 * French one field by field, so a half-translated row renders in English
 * where it can and in French elsewhere, never blank. The result keeps the
 * row's own shape — callers read `titre`, `donnees`… exactly as in French,
 * and validate `donnees` with the same zod schemas.
 *
 * An English value counts as empty when it is null, absent (a database that
 * has not run the migration yet), a blank string, or an empty list.
 */

function isEmpty(value: Json | undefined): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function isObject(value: Json | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pick<F extends string | null>(french: F, english: string | null | undefined): F | string {
  if (english === null || english === undefined || english.trim() === "") return french;
  return english;
}

// Key by key, recursing into objects; a list is replaced whole, never
// merged element by element.
function mergeJson(french: Json, english: Json | undefined): Json {
  if (isEmpty(english)) return french;
  if (!isObject(french) || !isObject(english)) return english ?? french;
  const merged: JsonObject = { ...french };
  for (const [key, value] of Object.entries(english)) {
    const base = french[key];
    merged[key] = base === undefined ? value : mergeJson(base, value);
  }
  return merged;
}

export function localizeSection(row: SectionRow, locale: Locale): SectionRow {
  if (locale === "fr") return row;
  return {
    ...row,
    eyebrow: pick(row.eyebrow, row.eyebrow_en),
    titre: pick(row.titre, row.titre_en),
    titre_accent: pick(row.titre_accent, row.titre_accent_en),
    lead: pick(row.lead, row.lead_en),
  };
}

export function localizeItem(row: ItemRow, locale: Locale): ItemRow {
  if (locale === "fr") return row;
  return {
    ...row,
    titre: pick(row.titre, row.titre_en),
    description: pick(row.description, row.description_en),
    donnees: mergeJson(row.donnees, row.donnees_en ?? undefined),
  };
}

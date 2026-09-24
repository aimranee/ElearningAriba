import "server-only";

import { z } from "zod";

import { localizeItem, localizeSection } from "@/lib/content/localize";
import type { Locale } from "@/lib/i18n/locale";
import { createPublicClient } from "@/lib/supabase/public";
import type { Database } from "@/types/database.types";

export type ContentSection = Database["app"]["Tables"]["content_section"]["Row"];
export type ContentItem = Database["app"]["Tables"]["content_item"]["Row"];

/**
 * Discriminated read result: callers render the D-32 error surface instead
 * of a blank section on a failed read, rather than throwing across a Server
 * Component boundary.
 *
 * why (D-38): every export below reads through the cookieless public read
 * client (src/lib/supabase/public.ts). Pages call these from a Server
 * Component and set their own `export const revalidate`, keeping the route
 * static/ISR — this module never reads the request cookie jar and must not
 * import the session-aware client.
 */
export type QueryResult<T> = { ok: true; data: T } | { ok: false };

/* why (#17): `locale` defaults to French, so every French caller and its
   query stay as they were; English reads the same rows and falls back to
   French field by field (localize.ts). (#22) The landing's helpers below
   take the same optional locale. */
export async function getSection(
  cle: string,
  locale: Locale = "fr",
): Promise<QueryResult<ContentSection>> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("content_section")
    .select("*")
    .eq("cle", cle)
    .eq("publie", true)
    .maybeSingle();

  if (error || !data) {
    return { ok: false };
  }
  return { ok: true, data: localizeSection(data, locale) };
}

export async function getSectionItems(
  sectionCle: string,
  locale: Locale = "fr",
): Promise<QueryResult<ContentItem[]>> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("content_item")
    .select("*")
    .eq("section_cle", sectionCle)
    .eq("publie", true)
    .order("position", { ascending: true });

  if (error || !data) {
    return { ok: false };
  }
  return { ok: true, data: data.map((row) => localizeItem(row, locale)) };
}

/* why: `donnees` is jsonb — validated at the boundary (CLAUDE.md) rather than
   trusted as an unchecked value. The schema itself defaults missing
   `objectifs`/`contenu` arrays to empty; the loop in getModules() below is
   stricter on purpose and drops the whole section on one malformed row
   (deliberate block-fail policy, not an inconsistency with this schema). */
const moduleDonneesSchema = z.object({
  objectifs: z.array(z.string()).default([]),
  contenu: z.array(z.string()).default([]),
});

/* why: `accroche` is jsonb, validated at the boundary per CLAUDE.md; optional
   so a missing/malformed value degrades silently instead of throwing. */
export const profilDonneesSchema = z.object({ accroche: z.string().optional() });

export type ModuleContent = {
  id: string;
  cle: string;
  titre: string;
  description: string | null;
  dureeHeures: number;
  position: number;
  objectifs: string[];
  contenu: string[];
};

/**
 * The five programme modules, ordered by position. Duration stays numeric on
 * every row so the 17 h total (D-30) is `sum(dureeHeures)` computed here,
 * never a stored string.
 */
/* why (2026-09-01): these schemas duplicate src/app/formation/page.tsx:20-28
   on purpose — that page already works, converging them in this run would
   widen the risk surface for no benefit to section 5. */
const derouleDonneesSchema = z.object({
  deroule: z.array(z.string()).default([]),
});

const fourniDonneesSchema = z.object({
  fourni: z.array(z.string()).default([]),
  prerequis: z.string().optional(),
  dureeAcces: z.string().optional(),
});

/**
 * The five page-formation `deroule` steps. An empty array is treated as a
 * read failure, not a valid empty list — a "how it runs" section with zero
 * steps is a defect (D-57).
 */
export async function getFormationDeroule(
  locale: Locale = "fr",
): Promise<QueryResult<string[]>> {
  const result = await getSectionItems("page-formation", locale);
  if (!result.ok) {
    return result;
  }

  const item = result.data.find((row) => row.cle === "deroule");
  if (!item) {
    return { ok: false };
  }

  const parsed = derouleDonneesSchema.safeParse(item.donnees);
  if (!parsed.success || parsed.data.deroule.length === 0) {
    return { ok: false };
  }

  return { ok: true, data: parsed.data.deroule };
}

/**
 * The page-formation `fourni` list plus `prerequis`/`dureeAcces`. Only the
 * read/parse itself fails the whole result — a missing `prerequis` or
 * `dureeAcces` degrades silently for the caller.
 */
export async function getFormationFourni(
  locale: Locale = "fr",
): Promise<QueryResult<{ fourni: string[]; prerequis?: string; dureeAcces?: string }>> {
  const result = await getSectionItems("page-formation", locale);
  if (!result.ok) {
    return result;
  }

  const item = result.data.find((row) => row.cle === "fourni");
  if (!item) {
    return { ok: false };
  }

  const parsed = fourniDonneesSchema.safeParse(item.donnees);
  if (!parsed.success) {
    return { ok: false };
  }

  return { ok: true, data: parsed.data };
}

/* why: `donnees.preuve` is jsonb, validated at the boundary per CLAUDE.md —
   lienHref/lienLabel stay optional (the third fact carries no link). */
const confianceDonneesSchema = z.object({
  preuve: z.object({
    texte: z.string(),
    lienHref: z.string().optional(),
    lienLabel: z.string().optional(),
  }),
});

export type ConfianceFait = {
  id: string;
  cle: string;
  titre: string;
  description: string;
  preuveTexte: string;
  preuveLienHref?: string;
  preuveLienLabel?: string;
};

export async function getConfianceFaits(
  locale: Locale = "fr",
): Promise<QueryResult<ConfianceFait[]>> {
  const result = await getSectionItems("confiance", locale);
  if (!result.ok) {
    return result;
  }

  const faits: ConfianceFait[] = [];
  for (const item of result.data) {
    const parsedDonnees = confianceDonneesSchema.safeParse(item.donnees);
    if (!parsedDonnees.success || item.titre === null || item.description === null) {
      console.error("getConfianceFaits: rejecting section 'confiance'", {
        cle: item.cle,
        issues: parsedDonnees.success ? undefined : parsedDonnees.error.issues,
        missingIdentityField: parsedDonnees.success
          ? item.titre === null
            ? "titre"
            : "description"
          : undefined,
      });
      return { ok: false };
    }
    faits.push({
      id: item.id,
      cle: item.cle,
      titre: item.titre,
      description: item.description,
      preuveTexte: parsedDonnees.data.preuve.texte,
      preuveLienHref: parsedDonnees.data.preuve.lienHref,
      preuveLienLabel: parsedDonnees.data.preuve.lienLabel,
    });
  }

  return { ok: true, data: faits };
}

export async function getModules(locale: Locale = "fr"): Promise<QueryResult<ModuleContent[]>> {
  const result = await getSectionItems("programme", locale);
  if (!result.ok) {
    return result;
  }

  const modules: ModuleContent[] = [];
  for (const item of result.data) {
    const parsedDonnees = moduleDonneesSchema.safeParse(item.donnees);
    if (!parsedDonnees.success || item.titre === null || item.duree_heures === null) {
      console.error("getModules: rejecting section 'programme'", {
        cle: item.cle,
        issues: parsedDonnees.success ? undefined : parsedDonnees.error.issues,
        missingIdentityField: parsedDonnees.success
          ? item.titre === null
            ? "titre"
            : "duree_heures"
          : undefined,
      });
      return { ok: false };
    }
    modules.push({
      id: item.id,
      cle: item.cle,
      titre: item.titre,
      description: item.description,
      dureeHeures: item.duree_heures,
      position: item.position,
      objectifs: parsedDonnees.data.objectifs,
      contenu: parsedDonnees.data.contenu,
    });
  }

  return { ok: true, data: modules };
}

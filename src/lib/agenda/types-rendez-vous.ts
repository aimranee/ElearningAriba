import "server-only";

import { z } from "zod";

import { createPublicClient } from "@/lib/supabase/public";
import type { QueryResult } from "@/lib/content/queries";
import type { Locale } from "@/lib/i18n/locale";

/**
 * app.type_rendez_vous is the single source of truth for the appointment
 * types — label, duration, buffer and price. The booking RPC reads it too,
 * so the buyer's chooser must come from here and not from
 * src/locales/fr/agenda.json's typesRendezVous, which is the bootstrap seed
 * input (D-21/D-22) and stays byte-identical, but is read by no runtime
 * consumer.
 */
export type TypeRendezVous = {
  id: string;
  libelle: string;
  dureeMinutes: number;
  tamponMinutes: number;
  prixCentimes: number;
  ordre: number;
};

const typeRendezVousRowSchema = z.object({
  id: z.string(),
  libelle: z.string(),
  // (#24) read by the English agenda only; absent from the French query.
  libelle_en: z.string().nullish(),
  duree_minutes: z.number(),
  tampon_minutes: z.number(),
  prix_centimes: z.number(),
  ordre: z.number(),
});

const COLONNES_FR = "id, libelle, duree_minutes, tampon_minutes, prix_centimes, ordre";
const COLONNES_EN = "id, libelle, libelle_en, duree_minutes, tampon_minutes, prix_centimes, ordre";

/* why (#17, #24): English is optional on each type, French required — a
   missing or blank English name shows the French one, type by type. */
function libelleLocalise(libelle: string, libelleEn: string | null | undefined, locale: Locale): string {
  if (locale === "fr" || !libelleEn || libelleEn.trim() === "") return libelle;
  return libelleEn;
}

/**
 * Reads the active app.type_rendez_vous rows, ordered by ordre. Runs as a
 * plain module-scope await in a Server Component under
 * `export const revalidate`, through the cookie-free anonymous client — no
 * cookies(), no headers(), no searchParams — so /agenda stays static (D-06).
 *
 * On a failed read the caller renders the existing agenda.aucunCreneau
 * empty state rather than throwing — a database hiccup must not take the
 * shop window down.
 */
export async function getTypesRendezVous(
  locale: Locale = "fr",
): Promise<QueryResult<TypeRendezVous[]>> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("type_rendez_vous")
    .select(locale === "en" ? COLONNES_EN : COLONNES_FR)
    .eq("actif", true)
    .order("ordre", { ascending: true });

  if (error || !data) {
    return { ok: false };
  }

  const types: TypeRendezVous[] = [];
  for (const row of data) {
    const parsed = typeRendezVousRowSchema.safeParse(row);
    if (!parsed.success) {
      return { ok: false };
    }
    types.push({
      id: parsed.data.id,
      libelle: libelleLocalise(parsed.data.libelle, parsed.data.libelle_en, locale),
      dureeMinutes: parsed.data.duree_minutes,
      tamponMinutes: parsed.data.tampon_minutes,
      prixCentimes: parsed.data.prix_centimes,
      ordre: parsed.data.ordre,
    });
  }

  return { ok: true, data: types };
}

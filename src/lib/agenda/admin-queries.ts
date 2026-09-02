import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { QueryResult } from "@/lib/content/queries";

export type DisponibiliteHebdomadaire =
  Database["app"]["Tables"]["disponibilite_hebdomadaire"]["Row"];
export type ExceptionAgenda = Database["app"]["Tables"]["exception_agenda"]["Row"];

/* why: no export below filters by role or ownership — dispo_admin_all and
   exception_admin_all (plan 04-01) are the filter, evaluated through
   app.est_administrateur(). Adding an application-level check here would
   hide a policy regression behind application code; the negative proof in
   supabase/tests/lot4_rls_reservation.sql is what guards this choice —
   a non-administrator session reading these tables gets zero rows, not an
   error, since RLS with no matching policy returns an empty set. */

/** The weekly working-hours ranges, ordered the way the editor renders them. */
export async function listerDisponibilites(): Promise<
  QueryResult<DisponibiliteHebdomadaire[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("disponibilite_hebdomadaire")
    .select("*")
    .order("jour_semaine", { ascending: true })
    .order("heure_debut", { ascending: true });

  if (error || !data) {
    return { ok: false };
  }
  return { ok: true, data };
}

/**
 * Dated exceptions over a window, split by motif at the call site — this
 * read stays a single query so the two editors (blocages/ouvertures on
 * horaires, feries on jours-feries) share one source of truth instead of
 * two divergent reads.
 */
export async function listerExceptions(
  du: string,
  au: string,
): Promise<QueryResult<ExceptionAgenda[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exception_agenda")
    .select("*")
    .gte("jour", du)
    .lte("jour", au)
    .order("jour", { ascending: true });

  if (error || !data) {
    return { ok: false };
  }
  return { ok: true, data };
}

/** The seeded `motif = 'ferie'` rows for one calendar year (D-17). */
export async function listerJoursFeries(
  annee: number,
): Promise<QueryResult<ExceptionAgenda[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exception_agenda")
    .select("*")
    .eq("motif", "ferie")
    .gte("jour", `${annee}-01-01`)
    .lte("jour", `${annee}-12-31`)
    .order("jour", { ascending: true });

  if (error || !data) {
    return { ok: false };
  }
  return { ok: true, data };
}

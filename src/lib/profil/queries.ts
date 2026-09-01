import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { QueryResult } from "@/lib/content/queries";

export type Profil = Database["app"]["Tables"]["profil"]["Row"];

/**
 * The six columns a learner may write, mirroring the column-scoped
 * `grant update` in supabase/migrations/20260831161000_lot3_grants.sql —
 * if one list changes, the other must too.
 */
export type ProfilEcriture = Pick<
  Database["app"]["Tables"]["profil"]["Update"],
  | "prenom"
  | "nom"
  | "telephone"
  | "profil_professionnel"
  | "preference_rappels"
  | "preference_actualites"
>;

/**
 * why: no owner-column filter here — RLS (`profil_self_select`, keyed on
 * `auth.uid()`) is the filter. Adding an application-level `.eq()` on the
 * identity column would hide a policy regression behind a query that still
 * narrows the result correctly; supabase/tests/lot3_rls_isolation.sql is
 * the guard that actually proves the isolation.
 */
export async function lireProfil(): Promise<QueryResult<Profil>> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("profil").select("*").maybeSingle();

  if (error || !data) {
    return { ok: false };
  }

  return { ok: true, data };
}

/**
 * why: `valeurs` is typed as a `Pick` over the derived Update type, not a
 * spread of an unknown object — a seventh column cannot be introduced
 * without editing ProfilEcriture. RLS (`profil_self_update`) plus the
 * column-scoped grant remain the actual authorisation, proven negatively by
 * supabase/tests/lot3_rls_isolation.sql — not the filter below.
 *
 * why (the filter itself): PostgREST refuses a filterless PATCH outright —
 * SQLSTATE 21000, "UPDATE requires a WHERE clause" — regardless of RLS.
 * Discovered live: identical request without a filter returns that error on
 * every call, 502 at this route. The `.eq()` on the identity column exists
 * only to satisfy that request-shape rule; it narrows nothing RLS did not
 * already narrow, since a cross-learner `utilisateur_id` would already be
 * refused by the same RLS predicate this filter duplicates.
 */
export async function mettreAJourProfil(
  valeurs: ProfilEcriture,
): Promise<QueryResult<Profil>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false };
  }

  const { data, error } = await supabase
    .from("profil")
    .update(valeurs)
    .eq("utilisateur_id", user.id)
    .select()
    .maybeSingle();

  if (error || !data) {
    return { ok: false };
  }

  return { ok: true, data };
}

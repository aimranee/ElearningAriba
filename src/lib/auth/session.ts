import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { QueryResult } from "@/lib/content/queries";

export type Learner = { id: string } & Database["app"]["Tables"]["profil"]["Row"];

/**
 * The single session read every /espace surface uses. Reads the auth user,
 * then the matching app.profil row — the RLS `utilisateur_id = auth.uid()`
 * filter makes the explicit .eq() redundant, kept anyway as defence in
 * depth.
 */
export async function getLearner(): Promise<QueryResult<Learner>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false };
  }

  const { data, error } = await supabase
    .from("profil")
    .select("*")
    .eq("utilisateur_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return { ok: false };
  }

  return { ok: true, data: { id: user.id, ...data } };
}

/**
 * why (D-27): a session failure must never render a half-authenticated page
 * — no greeting with an empty name, no card grid behind a spinner. Redirect
 * happens before any markup is produced by the caller.
 */
export async function requireLearner(): Promise<Learner> {
  const result = await getLearner();
  if (!result.ok) {
    redirect("/connexion");
  }
  return result.data;
}

/**
 * why: this is the first surface to read profil.role (Lot 3 D-02 created and
 * isolated the column with no consumer). No second query — role is already
 * on the row getLearner() returns. Redirect happens before any markup is
 * produced by the caller, same discipline as requireLearner(). A signed-out
 * or broken session goes to /connexion; a signed-in learner who guesses the
 * /admin URL goes back to their own space, not to a login form. This UI gate
 * is the first of three layers — RLS (dispo_admin_all, exception_admin_all)
 * and the withheld table privileges are the non-bypassable ones (T-04-35).
 */
export async function requireAdministrator(): Promise<Learner> {
  const result = await getLearner();
  if (!result.ok) {
    redirect("/connexion");
  }
  if (result.data.role !== "administrator") {
    redirect("/espace");
  }
  return result.data;
}

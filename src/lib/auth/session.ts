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

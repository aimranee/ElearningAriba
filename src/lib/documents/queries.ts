import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { QueryResult } from "@/lib/content/queries";

export type AccesSupport = Database["app"]["Tables"]["acces_support"]["Row"];

/* why: neither function below filters on the owning-learner column — RLS
   (acces_support_self_select, plan 03-01) is the filter. Adding an
   application-level `.eq()` here would hide a policy regression behind
   application code; the negative proof in
   supabase/tests/lot3_rls_isolation.sql is what guards this choice. */

export async function listerSupports(): Promise<QueryResult<AccesSupport[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("acces_support")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { ok: false };
  }
  return { ok: true, data };
}

export async function trouverSupport(id: string): Promise<QueryResult<AccesSupport>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("acces_support")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return { ok: false };
  }
  return { ok: true, data };
}

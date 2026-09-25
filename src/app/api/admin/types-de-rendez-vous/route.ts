import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdministrator } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { localizedPath } from "@/lib/i18n/routes";
import {
  typeRendezVousEditSchema,
  mapTypeRendezVousIssuesToErreurKey,
} from "@/lib/validation/types-rendez-vous";

/*
 * why: AGD-03 configures the four attributes of an existing appointment
 * type — label, duration, buffer and price. It does not create a type and
 * it does not destroy one, so this file exports PATCH only: no POST, no
 * DELETE. The database backs that up independently — app.type_rendez_vous
 * carries no insert grant/policy and no delete grant/policy (migration
 * 20260901180000_lot4_agenda.sql, policy type_admin_update) — so even a
 * crafted request against a hypothetical extra verb here would still be
 * refused at the RLS layer.
 *
 * requireAdministrator() runs before anything is parsed. The write goes
 * through the session-scoped client (src/lib/supabase/server.ts) — never
 * the elevated key-based client with a bypassing role, which has no
 * legitimate caller in this phase — so type_admin_update is the enforcing
 * layer: a learner's direct PATCH is refused by RLS independently of this
 * handler being right (T-04-58).
 */

function erreurJson(cle: string, status: number) {
  return NextResponse.json(
    { erreur: cle },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function PATCH(request: Request) {
  await requireAdministrator();

  const body = await request.json().catch(() => null);
  const parsed = typeRendezVousEditSchema.safeParse(body);
  if (!parsed.success) {
    return erreurJson(mapTypeRendezVousIssuesToErreurKey(parsed.error.issues), 422);
  }
  const { id, libelle, dureeMinutes, tamponMinutes, prixCentimes } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("type_rendez_vous")
    .update({
      libelle,
      duree_minutes: dureeMinutes,
      tampon_minutes: tamponMinutes,
      prix_centimes: prixCentimes,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return erreurJson("erreurGenerique", 502);
  }

  /* why: an RLS-filtered update raises no error on zero matched rows — a
     handler that only checked `error` would report success while changing
     nothing. Asking PostgREST for the updated representation and treating
     an empty result as a French "introuvable" refusal is what catches
     both an unknown id and a policy that silently matched nothing. */
  if (!data) {
    return erreurJson("introuvable", 404);
  }

  /* why (T-04-61, D-06): /agenda is a static shell under revalidate = 3600
     — without this, a new price would sit stale in front of buyers for up
     to an hour while the database, the booking RPC and the confirmation
     email all already used the new one. revalidatePath does not make the
     route dynamic; the build must still show "○ /agenda".
     /reservation is NOT revalidated here: since plan 04-05's D-28 change
     that route reads the session with getLearner() and is already dynamic
     (ƒ) — it has no cached render to invalidate, so a second call would be
     a no-op dressed as a guarantee.
     (#24) The English agenda shows the same prices, durations and French
     name fallback, under the same revalidate — it is refreshed with it. */
  revalidatePath("/agenda");
  revalidatePath(localizedPath("/agenda", "en"));

  return NextResponse.json({ ok: true }, { status: 200 });
}

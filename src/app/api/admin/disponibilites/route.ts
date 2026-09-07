import { NextResponse } from "next/server";

import { requireAdministrator } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  disponibiliteSchema,
  mapAgendaAdminIssueToErreurKey,
} from "@/lib/validation/agenda-admin";

/*
 * why: creates, updates and deactivates a weekly working-hours range —
 * app.disponibilite_hebdomadaire never sees a delete from application code,
 * only actif=false through PATCH (the row stays as a record, not a hole).
 * This file exports POST and PATCH only. No GET (the horaires page reads
 * through src/lib/agenda/admin-queries.ts), no DELETE.
 *
 * Both handlers call requireAdministrator() before parsing anything and
 * write through the session-scoped client (src/lib/supabase/server.ts) —
 * never the elevated key-based client with a bypassing role — so
 * dispo_admin_all is the enforcing layer: a learner's direct POST is
 * refused by RLS independently of this handler being right (T-04-36).
 */

function erreurJson(cle: string, status: number) {
  return NextResponse.json(
    { erreur: cle },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  await requireAdministrator();

  const body = await request.json().catch(() => null);
  const parsed = disponibiliteSchema.safeParse(body);
  if (!parsed.success) {
    return erreurJson(mapAgendaAdminIssueToErreurKey(parsed.error.issues), 422);
  }
  const { jourSemaine, heureDebut, heureFin, actif } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("disponibilite_hebdomadaire")
    .insert({
      jour_semaine: jourSemaine,
      heure_debut: `${heureDebut}:00`,
      heure_fin: `${heureFin}:00`,
      actif,
    })
    .select("id")
    .single();

  if (error || !data) {
    return erreurJson("erreurGenerique", 502);
  }

  return NextResponse.json({ ok: true, id: data.id }, { status: 200 });
}

export async function PATCH(request: Request) {
  await requireAdministrator();

  const body = await request.json().catch(() => null);
  const parsed = disponibiliteSchema.safeParse(body);
  if (!parsed.success || !parsed.data.id) {
    return erreurJson(
      parsed.success ? "champsInvalides" : mapAgendaAdminIssueToErreurKey(parsed.error.issues),
      422,
    );
  }
  const { id, jourSemaine, heureDebut, heureFin, actif } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("disponibilite_hebdomadaire")
    .update({
      jour_semaine: jourSemaine,
      heure_debut: `${heureDebut}:00`,
      heure_fin: `${heureFin}:00`,
      actif,
    })
    .eq("id", id);

  if (error) {
    return erreurJson("erreurGenerique", 502);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

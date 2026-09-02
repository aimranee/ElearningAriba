import { NextResponse } from "next/server";

import { requireAdministrator } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  exceptionSchema,
  exceptionSuppressionSchema,
  mapAgendaAdminIssueToErreurKey,
} from "@/lib/validation/agenda-admin";

/*
 * why: creates and updates dated exceptions — including flipping a `ferie`
 * row's `ouvert` flag (D-17's whole reopening mechanism) — and deletes a
 * `blocage`/`ouverture` the trainer added. This file exports POST, PATCH and
 * DELETE. No GET (both admin pages read through
 * src/lib/agenda/admin-queries.ts).
 *
 * Every handler calls requireAdministrator() before parsing anything and
 * writes through the session-scoped client (src/lib/supabase/server.ts) —
 * never the elevated key-based client with a bypassing role — so
 * exception_admin_all is the enforcing layer (T-04-36). None of these
 * handlers writes to the booking table at all.
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
  const parsed = exceptionSchema.safeParse(body);
  if (!parsed.success) {
    return erreurJson(mapAgendaAdminIssueToErreurKey(parsed.error.issues), 422);
  }
  const { jour, ouvert, motif, libelle, heureDebut, heureFin } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exception_agenda")
    .insert({
      jour,
      ouvert,
      motif,
      libelle: libelle ?? null,
      heure_debut: heureDebut ? `${heureDebut}:00` : null,
      heure_fin: heureFin ? `${heureFin}:00` : null,
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
  const parsed = exceptionSchema.safeParse(body);
  if (!parsed.success || !parsed.data.id) {
    return erreurJson(
      parsed.success ? "champsInvalides" : mapAgendaAdminIssueToErreurKey(parsed.error.issues),
      422,
    );
  }
  const { id, jour, ouvert, motif, libelle, heureDebut, heureFin } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("exception_agenda")
    .update({
      jour,
      ouvert,
      motif,
      libelle: libelle ?? null,
      heure_debut: heureDebut ? `${heureDebut}:00` : null,
      heure_fin: heureFin ? `${heureFin}:00` : null,
    })
    .eq("id", id);

  if (error) {
    return erreurJson("erreurGenerique", 502);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE(request: Request) {
  await requireAdministrator();

  const body = await request.json().catch(() => null);
  const parsed = exceptionSuppressionSchema.safeParse(body);
  if (!parsed.success) {
    return erreurJson("champsInvalides", 422);
  }

  const supabase = await createClient();

  /* why: a ferie row is never deleted, only reopened via PATCH's ouvert
     flip (D-17) — the row is read first so an attempt to delete one, from a
     crafted request rather than this plan's own UI, is refused explicitly
     rather than silently removing a French holiday from the calendar. */
  const { data: existing, error: readError } = await supabase
    .from("exception_agenda")
    .select("motif")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (readError || !existing) {
    return erreurJson("erreurGenerique", 502);
  }
  if (existing.motif === "ferie") {
    return erreurJson("nonAutorise", 403);
  }

  const { error } = await supabase
    .from("exception_agenda")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    return erreurJson("erreurGenerique", 502);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

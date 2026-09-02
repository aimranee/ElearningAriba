import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdministrator } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { trouverReservationAdmin, type ReservationAdmin } from "@/lib/agenda/admin-queries";
import type { QueryResult } from "@/lib/content/queries";
import {
  deplacementSchema,
  mapResultatDeplacementToErreurKey,
  mapResultatAnnulationToErreurKey,
  type AdminAgendaErreurKey,
} from "@/lib/validation/agenda-admin";
import { sendEmail, EmailTransportError } from "@/lib/email/resend";
import { renderReservationAnnulationOuDeplacementNotice } from "@/lib/email/render";
import * as i18n from "@/lib/i18n/fr";
import contact from "@/locales/fr/contact.json";
import admin from "@/locales/fr/admin.json";

/*
 * why: moves (PATCH) or cancels (DELETE) one existing reservation on the
 * administrator's initiative — AGD-08/AGD-09. app.deplacer_reservation and
 * app.annuler_reservation (plan 04-07's own migration) are the only
 * writers. This file exports PATCH and DELETE only. No GET — the admin
 * reservation reads go through src/lib/agenda/admin-queries.ts from a
 * server component, never through this route.
 *
 * why: both handlers branch on the RPC's typed `resultat`, never on
 * error.code and never on an HTTP status.
 */

const idSchema = z.uuid();

function erreurJson(cle: AdminAgendaErreurKey, status: number) {
  return NextResponse.json(
    { erreur: cle },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function dateHeureProse(iso: string): string {
  const date = new Date(iso);
  return `${i18n.formatDateAvecJour(date)} à ${i18n.formatHeureProse(date)}`;
}

/* why: an erased account (D-08, utilisateur_id null) leaves nobody to
   notify — the send is skipped silently rather than throwing. A failed send
   for a still-present learner never rolls back the write that already
   committed (rgpd/suppression/route.ts's own discipline). */
async function notifierApprenant(
  rowResult: QueryResult<ReservationAdmin>,
  dateHeurePrecedente: string,
  dateHeureNouvelle: string,
): Promise<void> {
  if (!rowResult.ok || !rowResult.data.profil) {
    return;
  }
  const { profil } = rowResult.data;

  try {
    const notice = renderReservationAnnulationOuDeplacementNotice({
      prenom: profil.prenom,
      dateHeurePrecedente,
      dateHeureNouvelle,
      contactEmail: contact.coordonnees.email,
    });
    await sendEmail({ to: profil.email, subject: notice.subject, text: notice.text });
  } catch (err) {
    if (!(err instanceof EmailTransportError)) {
      throw err;
    }
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdministrator();

  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return erreurJson("introuvable", 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = deplacementSchema.safeParse(body);
  if (!parsed.success) {
    return erreurJson("champsInvalides", 422);
  }

  /* why: read before the write, purely to compose the "previous date/time"
     half of the learner's notice below — this read is not the entitlement
     check (RLS/reservation_admin_all is), and its failure never blocks the
     move itself. */
  const beforeResult = await trouverReservationAdmin(parsedId.data);
  const dateHeurePrecedente = beforeResult.ok
    ? dateHeureProse(beforeResult.data.debut)
    : "";

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("deplacer_reservation", {
    p_id: parsedId.data,
    p_debut: parsed.data.debut,
  });

  if (error || !data || data.length === 0) {
    return erreurJson("erreurGenerique", 502);
  }

  const { resultat } = data[0];
  if (resultat !== "ok") {
    const cle = mapResultatDeplacementToErreurKey(resultat) ?? "erreurGenerique";
    return erreurJson(cle, 409);
  }

  /* why: the write is committed from here on — a failed re-read or a
     failed send is recoverable by hand, never rolled back. */
  const afterResult = await trouverReservationAdmin(parsedId.data);
  const dateHeureNouvelle = afterResult.ok ? dateHeureProse(afterResult.data.debut) : "";

  await notifierApprenant(afterResult, dateHeurePrecedente, dateHeureNouvelle);

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdministrator();

  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return erreurJson("introuvable", 404);
  }

  const beforeResult = await trouverReservationAdmin(parsedId.data);
  const dateHeurePrecedente = beforeResult.ok
    ? dateHeureProse(beforeResult.data.debut)
    : "";

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("annuler_reservation", {
    p_id: parsedId.data,
  });

  if (error || !data || data.length === 0) {
    return erreurJson("erreurGenerique", 502);
  }

  const { resultat } = data[0];
  if (resultat !== "ok") {
    const cle = mapResultatAnnulationToErreurKey(resultat) ?? "erreurGenerique";
    return erreurJson(cle, 409);
  }

  /* why: the cancellation shares api/reservation route's confirmation
     renderer (plan 04-04) — there is no separate "you're cancelled"
     template, so the shared "date/time changed" body carries a fixed
     French sentence (admin.reservations.annulation.dateHeureNouvelle)
     instead of a second date/time in the {dateHeureNouvelle} slot. */
  await notifierApprenant(
    beforeResult,
    dateHeurePrecedente,
    admin.reservations.annulation.dateHeureNouvelle,
  );

  return NextResponse.json({ ok: true }, { status: 200 });
}

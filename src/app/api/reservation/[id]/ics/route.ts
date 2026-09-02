import { NextResponse } from "next/server";
import { z } from "zod";

import { getLearner } from "@/lib/auth/session";
import { trouverReservation } from "@/lib/agenda/queries";
import { construireIcs } from "@/lib/agenda/ics";
import contact from "@/locales/fr/contact.json";
import reservation from "@/locales/fr/reservation.json";
import * as i18n from "@/lib/i18n/fr";

/*
 * why: the screen-4 "Ajouter à mon agenda" download — this file exports
 * GET only. No POST/PUT/PATCH/DELETE.
 *
 * why: no other cache declaration is made in this file, for the same
 * reason documents/[id]/route.ts states it — caching one learner's .ics
 * would serve it to the next caller.
 */

const idSchema = z.uuid();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return NextResponse.json(
      { erreur: reservation.erreurs.icsIndisponible },
      { status: 404 },
    );
  }

  const learnerResult = await getLearner();
  if (!learnerResult.ok) {
    return NextResponse.json(
      { erreur: reservation.erreurs.icsIndisponible },
      { status: 404 },
    );
  }
  const { data: learner } = learnerResult;

  /* why: reads through the session-scoped query — RLS alone decides
     entitlement, so this endpoint never becomes an existence oracle: the
     same 404 body, whether the id does not exist or the caller is not
     entitled. */
  const result = await trouverReservation(parsedId.data);
  if (!result.ok) {
    return NextResponse.json(
      { erreur: reservation.erreurs.icsIndisponible },
      { status: 404 },
    );
  }

  const row = result.data;
  const debutDate = new Date(row.debut);
  const finDate = new Date(row.fin);
  const typeLibelle = row.type_rendez_vous.libelle;
  const dateHeure = `${i18n.formatDateAvecJour(debutDate)} à ${i18n.formatHeureProse(debutDate)}`;

  const ics = construireIcs({
    uid: row.ics_uid,
    sequence: row.ics_sequence,
    debut: debutDate,
    fin: finDate,
    titre: typeLibelle,
    description: `${typeLibelle} — ${dateHeure}`,
    lieu: row.lieu,
    organisateurEmail: contact.coordonnees.email,
    // why: the attendee is the session's own learner — the same identity
    // trouverReservation's RLS read just proved owns this row, never a
    // value taken from the route param or request body.
    participantEmail: learner.email,
  });

  /* why: the filename is derived from the reservation date only, never
     from user input — a header-injection guard (T-04-26) — and encoded
     RFC 5987 because the date carries no accents but the pattern is kept
     identical to documents/[id]/route.ts for consistency. */
  const filename = `reservation-${i18n
    .formatDate(debutDate)
    .replace(/\s+/g, "-")}.ics`;

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8; method=REQUEST",
      "Cache-Control": "no-store, no-cache, private",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}

import { NextResponse } from "next/server";

import { getLearner } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { consume } from "@/lib/rate-limit";
import { serverEnv } from "@/lib/env/server";
import { getTypesRendezVous } from "@/lib/agenda/types-rendez-vous";
import { trouverReservation } from "@/lib/agenda/queries";
import {
  buildReservationSchema,
  mapResultatReservationToErreurKey,
  type ReservationErreurKey,
} from "@/lib/validation/reservation";
import { construireIcs } from "@/lib/agenda/ics";
import { sendEmail, EmailTransportError } from "@/lib/email/resend";
import {
  renderReservationConfirmation,
  renderReservationNotification,
} from "@/lib/email/render";
import * as i18n from "@/lib/i18n/fr";
import contact from "@/locales/fr/contact.json";

/*
 * why: this is the booking commit (AGD-04/AGD-05) — every write to
 * app.reservation goes through app.reserver_creneau (plan 04-01), and this
 * route is its only application-side caller. This file exports POST only.
 * No GET/PUT/PATCH/DELETE.
 *
 * why: PostgREST maps the exclusion violation SQLSTATE to HTTP 400, not
 * 409 (proven live against this stack) — every branch below reads the
 * RPC's typed `resultat` string, never `error.code` and never an HTTP
 * status.
 */

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

function erreurJson(cle: ReservationErreurKey, status: number) {
  return NextResponse.json(
    { erreur: cle },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  /* why: the identity used everywhere below is the session's own — never a
     request-body field. app.reserver_creneau independently re-derives it a
     second time, inside the same transaction, from auth.uid(). */
  const learnerResult = await getLearner();
  if (!learnerResult.ok) {
    return erreurJson("nonAuthentifie", 401);
  }
  const { data: learner } = learnerResult;

  /* why: an IP-only limit is insufficient for a resource a free account can
     spam (CONTEXT) — keyed on the learner id combined with the IP. */
  const ip = clientIp(request);
  const rateLimit = consume(`reservation:${learner.id}:${ip}`);
  if (!rateLimit.allowed) {
    return erreurJson("erreurGenerique", 429);
  }

  /* why: the accepted typeId set is read here, at request time, from
     app.type_rendez_vous — never hard-coded and never read from
     agenda.json (that file is bootstrap seed input only). This is the
     zod-boundary field error; app.reserver_creneau's 'type_inconnu' stays
     the authoritative backstop. */
  const typesResult = await getTypesRendezVous();
  if (!typesResult.ok || typesResult.data.length === 0) {
    return erreurJson("erreurGenerique", 502);
  }
  const typeIdsActifs = typesResult.data.map((type) => type.id);
  const typesParId = new Map(typesResult.data.map((type) => [type.id, type]));

  const body = await request.json().catch(() => null);
  const parsed = buildReservationSchema(typeIdsActifs).safeParse(body);
  if (!parsed.success) {
    return erreurJson("champsInvalides", 422);
  }
  const { typeId, debut, jeton } = parsed.data;

  /* why (D-15/T-04-24): re-validated strictly here, at request time, the
     same optional-at-boot/strict-at-use split resend.ts already applies to
     RESEND_API_KEY — never book a meeting with no location. Safe to read
     here specifically: the caller is authenticated by the session gate
     above, so the value only ever reaches a signed-in learner who has just
     booked, never an anonymous surface. */
  const lieu = serverEnv.FORMATEUR_LIEN_VISIO;
  if (!lieu) {
    return erreurJson("erreurGenerique", 502);
  }

  /* why: session-scoped client — the RPC runs as the caller's own identity.
     p_jeton passes straight through, undefined when the learner never held
     a retention; the RPC releases it itself on success — no second release
     call here, which would run outside the booking transaction. Branch on
     `resultat`, never on error.code and never on an HTTP status. */
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reserver_creneau", {
    p_type_id: typeId,
    p_debut: debut,
    p_lieu: lieu,
    p_jeton: jeton,
  });

  if (error || !data || data.length === 0) {
    /* why: never let a PostgrestError message, table name or column name
       reach the response. */
    return erreurJson("erreurGenerique", 502);
  }

  const { resultat, reservation_id: reservationId } = data[0];

  if (resultat !== "ok" || !reservationId) {
    const cle = mapResultatReservationToErreurKey(resultat) ?? "erreurGenerique";
    return erreurJson(cle, 409);
  }

  /* why: the row is committed from here on — nothing below may roll it
     back. A failed re-read or a failed send is recoverable by hand; a lost
     booking is not. */
  const rowResult = await trouverReservation(reservationId);
  if (!rowResult.ok) {
    return NextResponse.json({ ok: true, reservationId }, { status: 200 });
  }
  const row = rowResult.data;
  const type = typesParId.get(row.type_id);
  const typeLibelle = type?.libelle ?? row.type_id;
  const dureeHeures = (type?.dureeMinutes ?? 0) / 60;

  const debutDate = new Date(row.debut);
  const finDate = new Date(row.fin);
  const dateHeure = `${i18n.formatDateAvecJour(debutDate)} à ${i18n.formatHeureProse(debutDate)}`;
  const duree = i18n.formatHours(dureeHeures);
  const montant = i18n.formatCurrency((type?.prixCentimes ?? 0) / 100);

  const ics = construireIcs({
    uid: row.ics_uid,
    sequence: row.ics_sequence,
    debut: debutDate,
    fin: finDate,
    titre: typeLibelle,
    description: `${typeLibelle} — ${dateHeure}`,
    lieu: row.lieu,
    organisateurEmail: contact.coordonnees.email,
    participantEmail: learner.email,
  });
  const icsBase64 = Buffer.from(ics, "utf8").toString("base64");
  const icsFilename = `reservation-${i18n
    .formatDate(debutDate)
    .replace(/\s+/g, "-")}.ics`;

  try {
    const confirmation = renderReservationConfirmation({
      prenom: learner.prenom,
      typeRendezVous: typeLibelle,
      dateHeure,
      duree,
      montant,
      lieu: row.lieu,
    });
    await sendEmail({
      to: learner.email,
      subject: confirmation.subject,
      text: confirmation.text,
      attachments: [
        {
          filename: icsFilename,
          content: icsBase64,
          content_type: "text/calendar",
        },
      ],
    });

    const notification = renderReservationNotification({
      prenom: learner.prenom,
      nom: learner.nom,
      email: learner.email,
      typeRendezVous: typeLibelle,
      dateHeure,
      duree,
      lieu: row.lieu,
    });
    await sendEmail({
      to: contact.coordonnees.email,
      subject: notification.subject,
      text: notification.text,
    });
  } catch (err) {
    /* why: the row is already stored — do not roll it back. A booked slot
       with a failed email is recoverable by hand; a lost booking is not
       (the same discipline api/rgpd/suppression/route.ts applies). */
    if (!(err instanceof EmailTransportError)) {
      throw err;
    }
  }

  return NextResponse.json(
    { ok: true, reservationId, dateHeure, duree, montant, lieu: row.lieu },
    { status: 200 },
  );
}

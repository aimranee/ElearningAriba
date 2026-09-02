import { NextResponse } from "next/server";

import { requireAdministrator } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env/server";
import { getTypesRendezVous } from "@/lib/agenda/types-rendez-vous";
import { trouverReservationAdmin } from "@/lib/agenda/admin-queries";
import {
  buildCreationPourApprenantSchema,
  mapResultatCreationPourApprenantToErreurKey,
  type AdminAgendaErreurKey,
} from "@/lib/validation/agenda-admin";
import { construireIcs } from "@/lib/agenda/ics";
import { sendEmail, EmailTransportError } from "@/lib/email/resend";
import {
  renderReservationConfirmation,
  renderReservationNotification,
} from "@/lib/email/render";
import * as i18n from "@/lib/i18n/fr";
import contact from "@/locales/fr/contact.json";

/*
 * why: AGD-08/D-18 — books an existing learner's account into a slot on the
 * administrator's initiative. app.reserver_pour_apprenant (plan 04-07's own
 * migration) is the only writer; this route never creates an account and
 * never inserts into the booking table directly. This file exports POST
 * only. No GET/PUT/PATCH/DELETE.
 *
 * why: branches only on the RPC's typed `resultat`, never on error.code and
 * never on an HTTP status — same discipline as api/reservation/route.ts.
 */

function erreurJson(cle: AdminAgendaErreurKey, status: number) {
  return NextResponse.json(
    { erreur: cle },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  await requireAdministrator();

  /* why: the accepted typeId set is read here, at request time, from
     app.type_rendez_vous — never hard-coded and never read from
     agenda.json. app.reserver_pour_apprenant's 'type_inconnu' stays the
     authoritative backstop. */
  const typesResult = await getTypesRendezVous();
  if (!typesResult.ok || typesResult.data.length === 0) {
    return erreurJson("erreurGenerique", 502);
  }
  const typeIdsActifs = typesResult.data.map((type) => type.id);

  const body = await request.json().catch(() => null);
  const parsed = buildCreationPourApprenantSchema(typeIdsActifs).safeParse(body);
  if (!parsed.success) {
    return erreurJson("champsInvalides", 422);
  }
  const { email, typeId, debut } = parsed.data;

  /* why (D-15): re-validated strictly here, at request time, the same
     optional-at-boot/strict-at-use split api/reservation/route.ts already
     applies — never book a meeting with no location. Read only after the
     admin gate above. */
  const lieu = serverEnv.FORMATEUR_LIEN_VISIO;
  if (!lieu) {
    return erreurJson("erreurGenerique", 502);
  }

  /* why: session-scoped client — the RPC runs as the administrator's own
     identity, and checks app.est_administrateur() in its own body as the
     control (the grant alone is not). */
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reserver_pour_apprenant", {
    p_email: email,
    p_type_id: typeId,
    p_debut: debut,
    p_lieu: lieu,
  });

  if (error || !data || data.length === 0) {
    return erreurJson("erreurGenerique", 502);
  }

  const { resultat, reservation_id: reservationId } = data[0];

  if (resultat !== "ok" || !reservationId) {
    const cle = mapResultatCreationPourApprenantToErreurKey(resultat) ?? "erreurGenerique";
    return erreurJson(cle, 409);
  }

  /* why: the row is committed from here on — nothing below may roll it
     back. A failed re-read or a failed send is recoverable by hand; a lost
     booking is not (documents/[id]/route.ts's own discipline). */
  const rowResult = await trouverReservationAdmin(reservationId);
  if (!rowResult.ok) {
    return NextResponse.json({ ok: true, reservationId }, { status: 200 });
  }
  const row = rowResult.data;
  if (!row.profil) {
    return NextResponse.json({ ok: true, reservationId }, { status: 200 });
  }
  const profil = row.profil;
  const typeLibelle = row.type_rendez_vous.libelle;
  const dureeHeures = row.type_rendez_vous.duree_minutes / 60;

  const debutDate = new Date(row.debut);
  const finDate = new Date(row.fin);
  const dateHeure = `${i18n.formatDateAvecJour(debutDate)} à ${i18n.formatHeureProse(debutDate)}`;
  const duree = i18n.formatHours(dureeHeures);
  const montant = i18n.formatCurrency(row.type_rendez_vous.prix_centimes / 100);

  const ics = construireIcs({
    uid: row.ics_uid,
    sequence: row.ics_sequence,
    debut: debutDate,
    fin: finDate,
    titre: typeLibelle,
    description: `${typeLibelle} — ${dateHeure}`,
    lieu: row.lieu,
    organisateurEmail: contact.coordonnees.email,
    participantEmail: profil.email,
  });
  const icsBase64 = Buffer.from(ics, "utf8").toString("base64");
  const icsFilename = `reservation-${i18n
    .formatDate(debutDate)
    .replace(/\s+/g, "-")}.ics`;

  try {
    const confirmation = renderReservationConfirmation({
      prenom: profil.prenom,
      typeRendezVous: typeLibelle,
      dateHeure,
      duree,
      montant,
      lieu: row.lieu,
    });
    await sendEmail({
      to: profil.email,
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
      prenom: profil.prenom,
      nom: profil.nom,
      email: profil.email,
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
    /* why: the row is already stored — do not roll it back. */
    if (!(err instanceof EmailTransportError)) {
      throw err;
    }
  }

  return NextResponse.json({ ok: true, reservationId }, { status: 200 });
}

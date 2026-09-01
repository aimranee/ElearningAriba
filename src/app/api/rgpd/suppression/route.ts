import { NextResponse } from "next/server";

import { getLearner } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { renderSuppressionNotification } from "@/lib/email/render";
import { sendEmail, EmailTransportError } from "@/lib/email/resend";
import * as i18n from "@/lib/i18n/fr";
import contact from "@/locales/fr/contact.json";
import donnees from "@/locales/fr/donnees.json";

/*
 * why: this endpoint records a deletion request, it does not delete
 * anything — execution stays in SQL until ADM-02 in Lot 10 (D-10), and
 * Lot 3 ships no administration screen (D-02). This file exports POST
 * only. No GET/PUT/PATCH/DELETE.
 */
export async function POST() {
  const learnerResult = await getLearner();
  if (!learnerResult.ok) {
    return NextResponse.json({ erreur: donnees.suppression.erreur }, { status: 401 });
  }

  const { data: learner } = learnerResult;
  const supabase = await createClient();

  /* why: the identity column has no database default (unlike app.profil's
     auth.users trigger), so PostgREST requires it in the insert payload
     regardless of RLS — the value below is the session's own id from
     getLearner(), never read from a request body (there is none), and the
     RLS `with check` on demande_suppression_self_insert still refuses any
     other value. This insert leaves `statut` at its `enregistree`
     default. */
  const { data: inserted, error: insertError } = await supabase
    .from("demande_suppression")
    .insert({ utilisateur_id: learner.id })
    .select("demandee_le")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: existing } = await supabase
        .from("demande_suppression")
        .select("demandee_le")
        .eq("statut", "enregistree")
        .maybeSingle();

      return NextResponse.json(
        {
          erreur: "dejaDemandee",
          date: existing ? i18n.formatDate(new Date(existing.demandee_le)) : "",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ erreur: donnees.suppression.erreur }, { status: 502 });
  }

  try {
    const notification = renderSuppressionNotification({
      prenom: learner.prenom,
      nom: learner.nom,
      email: learner.email,
      /* why: the trainer-facing email date reuses the same fr-FR/
         Europe/Paris formatter instance the dejaDemandee response above
         calls through, without invoking that same helper a second time in
         this file (see src/lib/i18n/fr.ts). */
      date: i18n.dateFormatter.format(new Date(inserted.demandee_le)),
    });

    await sendEmail({
      to: contact.coordonnees.email,
      subject: notification.subject,
      text: notification.text,
    });
  } catch (error) {
    /* why: the row is already stored — do not roll it back. A recorded
       request with a failed notification is recoverable by hand; a lost
       request is a broken GDPR obligation (T-03-10). */
    if (!(error instanceof EmailTransportError)) {
      throw error;
    }
  }

  /* why: a deliberate divergence from api/contact/route.ts, which returns
     502 on a send failure because there the notification IS the
     deliverable. Here the row is — the learner's right was exercised the
     moment it was stored, and returning an error because an email failed
     would be false. */
  return NextResponse.json({ ok: true }, { status: 200 });
}

import { NextResponse } from "next/server";

import contact from "@/locales/fr/contact.json";
import { contactSchema, contactIssuesToFieldErrors } from "@/lib/validation/contact";
import { consume } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/public";
import { sendEmail } from "@/lib/email/resend";
import { renderContactNotification, renderContactAcknowledgement } from "@/lib/email/render";

const MIN_TIME_TO_SUBMIT_MS = 3000;

/*
 * why: contact messages are personal data (D-37) — this file exports POST
 * only. No GET (no public list route), no DELETE, no export endpoint;
 * deletion and export are Lot 5's RGPD work.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    const errors = contactIssuesToFieldErrors(parsed.error.issues);
    return NextResponse.json({ errors }, { status: 422 });
  }

  const { nom, email, telephone, profil, message, societe, rendu } = parsed.data;

  /* why (AC-9, D-35): honeypot check runs before any send or insert. A bot
     that fills every visible field also fills this hidden one; returning
     the same success shape a real submission gets denies it a signal to
     learn from. Nothing is stored, nothing is sent. */
  const isHoneypotTriggered = societe.trim().length > 0;
  const isTooFast = Date.now() - rendu < MIN_TIME_TO_SUBMIT_MS;

  if (isHoneypotTriggered || isTooFast) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = consume(`contact:${ip}`);
  if (!allowed) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const supabase = createPublicClient();
  const { error: insertError } = await supabase.from("contact_message").insert({
    nom,
    email,
    telephone: telephone || null,
    profil,
    message,
  });

  if (insertError) {
    return NextResponse.json({ errors: {} }, { status: 502 });
  }

  try {
    const notification = renderContactNotification({
      nom,
      email,
      telephone: telephone || "—",
      profil: contact.profil[profil as keyof typeof contact.profil],
      message,
    });
    const acknowledgement = renderContactAcknowledgement({ prenom: nom });

    await sendEmail({
      to: contact.coordonnees.email,
      subject: notification.subject,
      text: notification.text,
    });
    await sendEmail({
      to: email,
      subject: acknowledgement.subject,
      text: acknowledgement.text,
    });
  } catch {
    /* why: the row is already stored — do not roll it back. A stored
       message with a failed notification is recoverable by hand; a lost
       message is not (T-02-11, accepted). The form shows the transport-
       error state and the visitor is told to retry. */
    return NextResponse.json({ errors: {} }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

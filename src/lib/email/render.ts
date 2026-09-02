import "server-only";

import emails from "@/locales/fr/emails.json";

interface RenderedEmail {
  subject: string;
  text: string;
}

/*
 * why: single-brace placeholder substitution by String.replace, exactly as
 * footer.tsx:109 does — no templating library exists in this repo (§2.13).
 */
function substitute(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
    template,
  );
}

interface EmailEntry {
  objet: string;
  preheader: string;
  salutation: string;
  corps: string[];
  action: { libelle: string; contexte: string };
  signature: string;
  pied: string;
}

function renderEntry(entry: EmailEntry, values: Record<string, string>): RenderedEmail {
  const subject = substitute(entry.objet, values);
  const lines = [
    substitute(entry.salutation, values),
    "",
    ...entry.corps.map((line) => substitute(line, values)),
    "",
    substitute(entry.action.libelle, values),
    substitute(entry.action.contexte, values),
    "",
    substitute(entry.signature, values),
    substitute(entry.pied, values),
  ];
  return { subject, text: lines.join("\n") };
}

/** The notification sent to the trainer for every valid submission. */
export function renderContactNotification(values: {
  nom: string;
  email: string;
  telephone: string;
  profil: string;
  message: string;
}): RenderedEmail {
  return renderEntry(emails.contactNotification as EmailEntry, values);
}

/** The acknowledgement sent back to the prospect. */
export function renderContactAcknowledgement(values: { prenom: string }): RenderedEmail {
  return renderEntry(emails.contactAccusReception as EmailEntry, values);
}

/** The notification sent to the trainer when a learner requests account deletion. */
export function renderSuppressionNotification(values: {
  prenom: string;
  nom: string;
  email: string;
  date: string;
}): RenderedEmail {
  return renderEntry(emails.suppressionCompteNotification as EmailEntry, values);
}

/**
 * The learner's booking confirmation (AGD-06). Every date, hour, price and
 * duration value must arrive pre-formatted by src/lib/i18n/fr.ts at the call
 * site — formatDateAvecJour/formatHeureProse for {dateHeure}, formatCurrency
 * for {montant}, formatNumber/formatHours for {duree}. Nothing is assembled
 * here.
 */
export function renderReservationConfirmation(values: {
  prenom: string;
  typeRendezVous: string;
  dateHeure: string;
  duree: string;
  montant: string;
  lieu: string;
}): RenderedEmail {
  return renderEntry(emails.confirmationReservation as EmailEntry, values);
}

/** The trainer's immediate notification of a new booking (AGD-06). */
export function renderReservationNotification(values: {
  prenom: string;
  nom: string;
  email: string;
  typeRendezVous: string;
  dateHeure: string;
  duree: string;
  lieu: string;
}): RenderedEmail {
  return renderEntry(emails.reservationNotification as EmailEntry, values);
}

/** The learner's notice of an administrator cancellation or move (plan 04-07). */
export function renderReservationAnnulationOuDeplacementNotice(values: {
  prenom: string;
  dateHeurePrecedente: string;
  dateHeureNouvelle: string;
  contactEmail: string;
}): RenderedEmail {
  return renderEntry(
    emails.reservationAnnulationOuDeplacementNotice as EmailEntry,
    values,
  );
}

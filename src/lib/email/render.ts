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

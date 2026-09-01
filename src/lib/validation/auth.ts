import { z } from "zod";

/**
 * Auth boundary schemas, validated at the API boundary the five Lot 3 forms
 * submit to.
 *
 * why: mirrors src/lib/validation/contact.ts's idiom — schema carrying no
 * French text, a locale-key union, and a reducer to a field-keyed error map
 * (CLAUDE.md: no hardcoded strings, Zod's own messages are English).
 */

/**
 * why: mirrors supabase/config.toml `minimum_password_length = 8` and
 * `password_requirements = "letters_digits"` (D-12), which in turn were
 * moved to match the signed copy at inscription.aideParChamp.motDePasse
 * (eight characters minimum, at least one digit). Three places, one rule:
 * if one moves, all three must move.
 */
const motDePasseSchema = z.string().min(8).regex(/\d/);

export const inscriptionSchema = z
  .object({
    prenom: z.string().trim().min(1),
    nom: z.string().trim().min(1),
    email: z.email(),
    motDePasse: motDePasseSchema,
    confirmation: z.string(),
    profil: z.enum(["acheteur", "consultant", "etudiant", "entreprise"]),
  })
  .refine((data) => data.motDePasse === data.confirmation, {
    path: ["confirmation"],
    error: "confirmationDifferente",
  });

export type InscriptionInput = z.infer<typeof inscriptionSchema>;

/** Matches the leaf keys of `inscription.erreurs` in src/locales/fr/inscription.json. */
export type InscriptionErreurKey =
  | "requis"
  | "emailInvalide"
  | "motDePasseFaible"
  | "confirmationDifferente"
  | "rejetServeur";

export function mapInscriptionIssueToErreurKey(
  path: PropertyKey,
  code: string,
): InscriptionErreurKey | undefined {
  switch (path) {
    case "email":
      return code === "invalid_format" ? "emailInvalide" : "requis";
    case "motDePasse":
      return code === "too_small" || code === "invalid_format"
        ? "motDePasseFaible"
        : "requis";
    case "confirmation":
      return code === "custom" ? "confirmationDifferente" : "requis";
    default:
      return "requis";
  }
}

export function inscriptionIssuesToFieldErrors(
  issues: readonly { path: PropertyKey[]; code: string }[],
): Partial<Record<keyof InscriptionInput, InscriptionErreurKey>> {
  const errors: Partial<Record<keyof InscriptionInput, InscriptionErreurKey>> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;
    const key = mapInscriptionIssueToErreurKey(field, issue.code);
    if (key) {
      errors[field as keyof InscriptionInput] = key;
    }
  }
  return errors;
}

/**
 * why: sign-in validates only that a password is present, never its
 * strength (not the shared motDePasseSchema) — a strength failure returned
 * on sign-in would tell an attacker the stored password is short, which is
 * an oracle a sign-in form must never expose.
 */
export const connexionSchema = z.object({
  email: z.email(),
  motDePasse: z.string().min(1),
});

export type ConnexionInput = z.infer<typeof connexionSchema>;

/** Matches the leaf keys of `connexion.erreurs` in src/locales/fr/connexion.json. */
export type ConnexionErreurKey =
  | "identifiantsInvalides"
  | "rejetServeur"
  | "tropDeTentatives";

export function mapConnexionIssueToErreurKey(
  path: PropertyKey,
): ConnexionErreurKey | undefined {
  switch (path) {
    case "email":
    case "motDePasse":
      return "identifiantsInvalides";
    default:
      return undefined;
  }
}

export function connexionIssuesToFieldErrors(
  issues: readonly { path: PropertyKey[]; code: string }[],
): Partial<Record<keyof ConnexionInput, ConnexionErreurKey>> {
  const errors: Partial<Record<keyof ConnexionInput, ConnexionErreurKey>> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;
    const key = mapConnexionIssueToErreurKey(field);
    if (key) {
      errors[field as keyof ConnexionInput] = key;
    }
  }
  return errors;
}

export const demandeResetSchema = z.object({
  email: z.email(),
});

export type DemandeResetInput = z.infer<typeof demandeResetSchema>;

/** Matches the leaf keys of `mot-de-passe.erreurs` in src/locales/fr/mot-de-passe.json. */
export type MotDePasseErreurKey = "lienExpire" | "rejetServeur";

export const nouveauMotDePasseSchema = z
  .object({
    motDePasse: motDePasseSchema,
    confirmation: z.string(),
  })
  .refine((data) => data.motDePasse === data.confirmation, {
    path: ["confirmation"],
    error: "confirmationDifferente",
  });

export type NouveauMotDePasseInput = z.infer<typeof nouveauMotDePasseSchema>;

export function mapNouveauMotDePasseIssueToErreurKey(
  path: PropertyKey,
  code: string,
): InscriptionErreurKey | undefined {
  switch (path) {
    case "motDePasse":
      return code === "too_small" || code === "invalid_format"
        ? "motDePasseFaible"
        : "requis";
    case "confirmation":
      return code === "custom" ? "confirmationDifferente" : "requis";
    default:
      return "requis";
  }
}

export function nouveauMotDePasseIssuesToFieldErrors(
  issues: readonly { path: PropertyKey[]; code: string }[],
): Partial<Record<keyof NouveauMotDePasseInput, InscriptionErreurKey>> {
  const errors: Partial<
    Record<keyof NouveauMotDePasseInput, InscriptionErreurKey>
  > = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;
    const key = mapNouveauMotDePasseIssueToErreurKey(field, issue.code);
    if (key) {
      errors[field as keyof NouveauMotDePasseInput] = key;
    }
  }
  return errors;
}

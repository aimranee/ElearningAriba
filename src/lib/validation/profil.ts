import { z } from "zod";

/**
 * Profile form boundary schema, validated on both the client island and the
 * route handler behind /espace/profil (neither imports server-only).
 *
 * why: mirrors src/lib/validation/contact.ts's idiom — no French text in the
 * schema, a locale-key union, and a reducer to a field-keyed error map.
 * The auth identifier field is deliberately absent: it is read-only (D-A7).
 * No company/team field: a learner is a natural person (D-24).
 */

/* why: French-tolerant, not strict E.164 — must accept "01 23 45 67 89"
   (D-A7). Digits, spaces, dots, hyphens and an optional leading "+";
   10 to 20 characters after normalisation. */
const telephoneRegex = /^\+?[\d\s.-]{10,20}$/;

export const profilSchema = z.object({
  prenom: z.string().trim().min(1),
  nom: z.string().trim().min(1),
  telephone: z
    .string()
    .trim()
    .regex(telephoneRegex)
    .optional()
    .or(z.literal("")),
  profil_professionnel: z.enum([
    "acheteur",
    "consultant",
    "etudiant",
    "entreprise",
  ]),
  preference_rappels: z.coerce.boolean(),
  preference_actualites: z.coerce.boolean(),
});

export type ProfilInput = z.infer<typeof profilSchema>;

/** Matches the leaf keys of `profil.erreurs` in src/locales/fr/profil.json, plus inscription.erreurs.requis. */
export type ProfilErreurKey =
  | "telephoneInvalide"
  | "rejetServeur"
  | "requis";

export function mapProfilIssueToErreurKey(
  path: PropertyKey,
): ProfilErreurKey | undefined {
  switch (path) {
    case "telephone":
      return "telephoneInvalide";
    case "prenom":
    case "nom":
    case "profil_professionnel":
      return "requis";
    default:
      return undefined;
  }
}

export function profilIssuesToFieldErrors(
  issues: readonly { path: PropertyKey[]; code: string }[],
): Partial<Record<keyof ProfilInput, ProfilErreurKey>> {
  const errors: Partial<Record<keyof ProfilInput, ProfilErreurKey>> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;
    const key = mapProfilIssueToErreurKey(field);
    if (key) {
      errors[field as keyof ProfilInput] = key;
    }
  }
  return errors;
}

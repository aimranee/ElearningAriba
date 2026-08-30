import { z } from "zod";

/**
 * Contact form input, validated at the API boundary (src/app/api/contact).
 *
 * why: mirrors the src/lib/env/server.ts idiom — schema, safeParse, mapped
 * issues — but the messages resolve to contact.json's `erreurs.*` French
 * keys instead of Zod's English defaults (CLAUDE.md: no hardcoded strings).
 * `societe` is the honeypot (D-35); `rendu` is the submit-time timestamp
 * used for the minimum-time-to-submit guard, set client-side on mount.
 */
export const contactSchema = z.object({
  nom: z.string().trim().min(1),
  email: z.email(),
  telephone: z.string().trim().optional(),
  profil: z.enum(["acheteur", "consultant", "etudiant", "entreprise"]),
  message: z.string().trim().min(1),
  societe: z.string().optional().default(""),
  rendu: z.coerce.number(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Matches the leaf keys of `contact.erreurs` in src/locales/fr/contact.json. */
export type ContactErreurKey =
  | "nomRequis"
  | "emailRequis"
  | "emailInvalide"
  | "messageRequis"
  | "profilRequis";

/**
 * Maps a Zod issue's field path to the matching contact.erreurs.* key. The
 * email field distinguishes "missing" from "invalid format" by issue code;
 * every other field only has one failure mode worth naming.
 */
export function mapContactIssueToErreurKey(
  path: PropertyKey,
  code: string,
): ContactErreurKey | undefined {
  switch (path) {
    case "nom":
      return "nomRequis";
    case "email":
      return code === "invalid_format" ? "emailInvalide" : "emailRequis";
    case "message":
      return "messageRequis";
    case "profil":
      return "profilRequis";
    default:
      return undefined;
  }
}

/**
 * Reduces a ZodError into a field-keyed map of contact.erreurs.* codes, one
 * entry per field that failed — this is the shape the route returns as
 * `{ errors }` and the form maps back onto `contact.erreurs`.
 */
export function contactIssuesToFieldErrors(
  issues: readonly { path: PropertyKey[]; code: string }[],
): Partial<Record<keyof ContactInput, ContactErreurKey>> {
  const errors: Partial<Record<keyof ContactInput, ContactErreurKey>> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;
    const key = mapContactIssueToErreurKey(field, issue.code);
    if (key) {
      errors[field as keyof ContactInput] = key;
    }
  }
  return errors;
}

import { z } from "zod";

/**
 * Admin appointment-type edit input, validated at the API boundary
 * (src/app/api/admin/types-de-rendez-vous). Mirrors src/lib/validation/
 * contact.ts's idiom: schema, safeParse, mapped issues resolving to
 * admin.json's `erreurs.*` French keys instead of Zod's English defaults
 * (CLAUDE.md: no hardcoded strings). The three numeric fields mirror the
 * check constraints already on app.type_rendez_vous
 * (supabase/migrations/20260901180000_lot4_agenda.sql) so an invalid value
 * produces a French field error rather than a raw constraint violation.
 *
 * `id` addresses the row and is never itself editable — it travels in the
 * payload only to say which row the other four fields apply to.
 *
 * Price is validated and transported in centimes, never in euros: the store
 * holds centimes (app.type_rendez_vous.prix_centimes), and a euro round trip
 * at this boundary is where a factor-of-100 bug lives. The euro rendering
 * happens only at the UI edge, through formatCurrency.
 */
export const typeRendezVousEditSchema = z.object({
  id: z.string().trim().min(1),
  libelle: z.string().trim().min(1).max(120),
  dureeMinutes: z.int().min(1).max(480),
  tamponMinutes: z.int().min(0).max(480),
  prixCentimes: z.int().min(0),
});

export type TypeRendezVousEditInput = z.infer<typeof typeRendezVousEditSchema>;

/** Matches the leaf keys of `admin.erreurs` in src/locales/fr/admin.json. */
export type TypeRendezVousErreurKey =
  | "libelleInvalide"
  | "dureeInvalide"
  | "tamponInvalide"
  | "prixInvalide"
  | "champsInvalides"
  | "nonAutorise"
  | "introuvable"
  | "erreurGenerique";

/**
 * Maps a Zod issue's field path to the matching admin.erreurs.* key — one
 * error surfaces per field, the same idiom src/lib/validation/contact.ts
 * uses.
 */
export function mapTypeRendezVousIssueToErreurKey(
  path: PropertyKey,
): TypeRendezVousErreurKey | undefined {
  switch (path) {
    case "libelle":
      return "libelleInvalide";
    case "dureeMinutes":
      return "dureeInvalide";
    case "tamponMinutes":
      return "tamponInvalide";
    case "prixCentimes":
      return "prixInvalide";
    case "id":
      return "champsInvalides";
    default:
      return undefined;
  }
}

/**
 * Reduces a ZodError into the first admin.erreurs.* key it names — one
 * message per submit, mirroring src/lib/validation/agenda-admin.ts's
 * mapAgendaAdminIssueToErreurKey.
 */
export function mapTypeRendezVousIssuesToErreurKey(
  issues: readonly { path: PropertyKey[] }[],
): TypeRendezVousErreurKey {
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;
    const key = mapTypeRendezVousIssueToErreurKey(field);
    if (key) return key;
  }
  return "champsInvalides";
}

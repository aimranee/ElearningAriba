import { z } from "zod";

/**
 * Slot retention (D-27) input, validated at the API boundary
 * (src/app/api/creneaux/maintien). Mirrors src/lib/validation/contact.ts's
 * idiom: schema, safeParse, mapped issues resolving to agenda.json's French
 * keys instead of Zod's English defaults (CLAUDE.md: no hardcoded strings).
 *
 * No identity field, no duration field and no retention-window field: the
 * fifteen minutes are a server-side SQL literal in app.maintenir_creneau —
 * a client that could name its own window would grant itself an
 * eight-hour hold.
 */
export const maintienPostSchema = z.object({
  typeId: z.string().min(1),
  debut: z.iso.datetime({ offset: true }),
  jeton: z.uuid().optional(),
});

export type MaintienPostInput = z.infer<typeof maintienPostSchema>;

/**
 * The DELETE body does not fit the POST schema — it requires only `jeton`,
 * required and nothing else — a release has no reason to send `typeId`/
 * `debut`. Without its own schema the DELETE path would reach
 * app.liberer_creneau with an unvalidated value, against CLAUDE.md's
 * Zod-at-the-boundary rule.
 */
export const maintienDeleteSchema = z.object({
  jeton: z.uuid(),
});

export type MaintienDeleteInput = z.infer<typeof maintienDeleteSchema>;

/** Matches the leaf keys of `agenda.erreurs` in src/locales/fr/agenda.json. */
export type MaintienErreurKey =
  | "creneauIndisponible"
  | "typeInconnu"
  | "jetonInconnu"
  | "champsInvalides"
  | "erreurGenerique";

/**
 * Maps app.maintenir_creneau's/app.liberer_creneau's outcome string to the
 * matching agenda.erreurs.* key. `'jeton_inconnu'` is not an error the
 * visitor should ever read as one — it means the stored token was never
 * issued or has lapsed, so its key tells the client to drop the token and
 * retry as a mint rather than to show a message.
 */
export function mapResultatMaintienToErreurKey(
  resultat: string,
): MaintienErreurKey | undefined {
  switch (resultat) {
    case "creneau_indisponible":
      return "creneauIndisponible";
    case "type_inconnu":
      return "typeInconnu";
    case "jeton_inconnu":
      return "jetonInconnu";
    default:
      return undefined;
  }
}

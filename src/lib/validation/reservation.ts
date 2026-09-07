import { z } from "zod";

/**
 * Booking commit input, validated at the API boundary
 * (src/app/api/reservation). Mirrors src/lib/validation/contact.ts's idiom:
 * schema, safeParse, mapped issues resolving to reservation.json's
 * `erreurs.*` French keys instead of Zod's English defaults (CLAUDE.md: no
 * hardcoded strings).
 *
 * No identity field (utilisateur_id/userId/apprenantId): the learner is
 * always read from the session inside the route, never from the body — and
 * again, independently, from auth.uid() inside app.reserver_creneau. No
 * price, no duration and no statut: those come from app.type_rendez_vous
 * and the RPC, never from the client. No hold-duration field (D-27): the
 * retention window is a server-side SQL literal in the upstream RPC a
 * client never calls directly — a client that could name its own window
 * would grant itself an arbitrarily long hold.
 */
export function buildReservationSchema(typeIdsActifs: readonly string[]) {
  return z.object({
    typeId: z.enum(typeIdsActifs as [string, ...string[]]),
    debut: z.iso.datetime({ offset: true }),
    jeton: z.uuid().optional(),
  });
}

export type ReservationInput = z.infer<ReturnType<typeof buildReservationSchema>>;

/**
 * app.reserver_creneau's typed outcome union. `'ok'` is the success case and
 * carries no error key; every other value maps to a leaf key of
 * `reservation.erreurs` in src/locales/fr/reservation.json.
 */
export type ResultatReservation =
  | "ok"
  | "non_authentifie"
  | "type_inconnu"
  | "creneau_indisponible"
  | "appel_decouverte_deja_reserve";

/** Matches the leaf keys of `reservation.erreurs` in src/locales/fr/reservation.json. */
export type ReservationErreurKey =
  | "creneauIndisponible"
  | "appelDecouverteDejaReserve"
  | "typeInconnu"
  | "nonAuthentifie"
  | "champsInvalides"
  | "erreurGenerique";

/**
 * Maps app.reserver_creneau's outcome string to the matching
 * reservation.erreurs.* key. `'creneau_indisponible'` reuses the existing,
 * unchanged `creneauIndisponible` key (D-24 fence: not touched by this
 * plan). `'appel_decouverte_deja_reserve'` is new (D-12): it points the
 * learner at the individual session rather than reading as a generic
 * refusal.
 */
export function mapResultatReservationToErreurKey(
  resultat: string,
): ReservationErreurKey | undefined {
  switch (resultat) {
    case "creneau_indisponible":
      return "creneauIndisponible";
    case "appel_decouverte_deja_reserve":
      return "appelDecouverteDejaReserve";
    case "type_inconnu":
      return "typeInconnu";
    case "non_authentifie":
      return "nonAuthentifie";
    default:
      return undefined;
  }
}

import { z } from "zod";

/**
 * Admin agenda-shaping input, validated at the API boundary
 * (src/app/api/admin/disponibilites, src/app/api/admin/exceptions). Mirrors
 * src/lib/validation/contact.ts's idiom: schema, safeParse, mapped issues
 * resolving to admin.json's `erreurs.*` French keys instead of Zod's English
 * defaults (CLAUDE.md: no hardcoded strings). Both schemas mirror the check
 * constraints already on app.disponibilite_hebdomadaire and
 * app.exception_agenda (supabase/migrations/20260901180000_lot4_agenda.sql)
 * so an invalid range produces a French field error rather than a raw
 * constraint violation.
 */

const heureSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "heureInvalide");

/**
 * jourSemaine is ISO-8601 isodow (1 = lundi ... 7 = dimanche), matching the
 * column comment and the seed script — never extract(dow) numbering.
 */
export const disponibiliteSchema = z
  .object({
    id: z.uuid().optional(),
    jourSemaine: z.number().int().min(1).max(7),
    heureDebut: heureSchema,
    heureFin: heureSchema,
    actif: z.boolean().default(true),
  })
  .refine((value) => value.heureFin > value.heureDebut, {
    error: "heureFinAvantDebut",
    path: ["heureFin"],
  });

export type DisponibiliteInput = z.infer<typeof disponibiliteSchema>;

const MOTIFS_EXCEPTION = ["blocage", "ferie", "ouverture"] as const;

/**
 * Both hour columns null means whole day (the table's own convention); the
 * refine below mirrors the two check constraints on app.exception_agenda:
 * heure_debut/heure_fin are either both present or both absent, and when
 * present heure_fin > heure_debut.
 */
export const exceptionSchema = z
  .object({
    id: z.uuid().optional(),
    jour: z.iso.date(),
    ouvert: z.boolean(),
    motif: z.enum(MOTIFS_EXCEPTION),
    libelle: z.string().trim().min(1).optional(),
    heureDebut: heureSchema.optional(),
    heureFin: heureSchema.optional(),
  })
  .refine(
    (value) => (value.heureDebut === undefined) === (value.heureFin === undefined),
    { error: "heuresIncompletes", path: ["heureFin"] },
  )
  .refine(
    (value) =>
      value.heureDebut === undefined ||
      value.heureFin === undefined ||
      value.heureFin > value.heureDebut,
    { error: "heureFinAvantDebut", path: ["heureFin"] },
  );

export type ExceptionInput = z.infer<typeof exceptionSchema>;

/** The exception delete boundary — id only, never a body-supplied motif. */
export const exceptionSuppressionSchema = z.object({
  id: z.uuid(),
});

/**
 * The move boundary (PATCH /api/admin/reservations/[id]) — the reservation
 * id itself comes from the URL param, validated separately with a bare
 * z.uuid() at the route, matching src/app/api/documents/[id]/route.ts's
 * idiom.
 */
export const deplacementSchema = z.object({
  debut: z.iso.datetime({ offset: true }),
});

export type DeplacementInput = z.infer<typeof deplacementSchema>;

/**
 * The create-on-behalf boundary (POST /api/admin/reservations) — a schema
 * factory taking the active app.type_rendez_vous id set at request time,
 * exactly like src/lib/validation/reservation.ts's buildReservationSchema:
 * never a hard-coded list, never src/locales/fr/agenda.json (bootstrap seed
 * input the administrator does not own). No `lieu` field — the trainer's
 * fixed video link is read server-side from serverEnv.FORMATEUR_LIEN_VISIO,
 * the same D-15 discipline the booking route already applies.
 */
export function buildCreationPourApprenantSchema(typeIdsActifs: readonly string[]) {
  return z.object({
    email: z.email(),
    typeId: z.enum(typeIdsActifs as [string, ...string[]]),
    debut: z.iso.datetime({ offset: true }),
  });
}

export type CreationPourApprenantInput = z.infer<
  ReturnType<typeof buildCreationPourApprenantSchema>
>;

/**
 * The export boundary (GET /api/admin/reservations/export) — both bounds
 * are required and the span is capped (T-04-48) so a single request cannot
 * stream the whole table. ISO date strings compare correctly with plain
 * string `>=` (YYYY-MM-DD is lexically ordered).
 */
const EXPORT_SPAN_MAX_JOURS = 366;

export const exportSchema = z
  .object({
    du: z.iso.date(),
    au: z.iso.date(),
  })
  .refine((value) => value.au >= value.du, {
    error: "jourInvalide",
    path: ["au"],
  })
  .refine(
    (value) => {
      const jours =
        (new Date(value.au).getTime() - new Date(value.du).getTime()) / (1000 * 60 * 60 * 24);
      return jours <= EXPORT_SPAN_MAX_JOURS;
    },
    { error: "champsInvalides", path: ["au"] },
  );

export type ExportInput = z.infer<typeof exportSchema>;

/** Matches the leaf keys of `admin.erreurs` in src/locales/fr/admin.json. */
export type AdminAgendaErreurKey =
  | "jourSemaineInvalide"
  | "heureInvalide"
  | "heureFinAvantDebut"
  | "jourInvalide"
  | "motifInvalide"
  | "heuresIncompletes"
  | "champsInvalides"
  | "nonAutorise"
  | "introuvable"
  | "dejaAnnulee"
  | "creneauIndisponible"
  | "apprenantIntrouvable"
  | "typeInconnu"
  | "appelDecouverteDejaReserve"
  | "erreurGenerique";

/**
 * Reduces a ZodError into the first admin.erreurs.* key it names — one error
 * surfaces per submit, the same "one message, not a wall of them" idiom
 * src/lib/validation/contact.ts uses at the field level. Custom refine
 * messages (heureFinAvantDebut, heuresIncompletes) arrive as the issue's own
 * `message`; built-in issues (invalid_type, too_small, invalid_format on the
 * regex-checked heure fields) fall back to champsInvalides.
 */
export function mapAgendaAdminIssueToErreurKey(
  issues: readonly { message: string }[],
): AdminAgendaErreurKey {
  const KNOWN: readonly AdminAgendaErreurKey[] = [
    "jourSemaineInvalide",
    "heureInvalide",
    "heureFinAvantDebut",
    "jourInvalide",
    "motifInvalide",
    "heuresIncompletes",
  ];
  for (const issue of issues) {
    if ((KNOWN as readonly string[]).includes(issue.message)) {
      return issue.message as AdminAgendaErreurKey;
    }
  }
  return "champsInvalides";
}

/**
 * app.deplacer_reservation's typed outcome union (plan 04-07, migration
 * 20260901182000_lot4_admin_reservation.sql).
 */
export type ResultatDeplacement =
  | "ok"
  | "non_autorise"
  | "introuvable"
  | "reservation_annulee"
  | "creneau_indisponible";

/**
 * Maps app.deplacer_reservation's outcome to an admin.erreurs.* key.
 * 'reservation_annulee' (attempting to move an already-cancelled row) and
 * 'deja_annulee' (app.annuler_reservation's own already-cancelled outcome,
 * below) share the same French key: both describe the identical state to
 * the administrator.
 */
export function mapResultatDeplacementToErreurKey(
  resultat: string,
): AdminAgendaErreurKey | undefined {
  switch (resultat) {
    case "non_autorise":
      return "nonAutorise";
    case "introuvable":
      return "introuvable";
    case "reservation_annulee":
      return "dejaAnnulee";
    case "creneau_indisponible":
      return "creneauIndisponible";
    default:
      return undefined;
  }
}

/** app.annuler_reservation's typed outcome union. */
export type ResultatAnnulation = "ok" | "non_autorise" | "introuvable" | "deja_annulee";

export function mapResultatAnnulationToErreurKey(
  resultat: string,
): AdminAgendaErreurKey | undefined {
  switch (resultat) {
    case "non_autorise":
      return "nonAutorise";
    case "introuvable":
      return "introuvable";
    case "deja_annulee":
      return "dejaAnnulee";
    default:
      return undefined;
  }
}

/** app.reserver_pour_apprenant's typed outcome union. */
export type ResultatCreationPourApprenant =
  | "ok"
  | "non_autorise"
  | "apprenant_introuvable"
  | "type_inconnu"
  | "creneau_indisponible"
  | "appel_decouverte_deja_reserve";

export function mapResultatCreationPourApprenantToErreurKey(
  resultat: string,
): AdminAgendaErreurKey | undefined {
  switch (resultat) {
    case "non_autorise":
      return "nonAutorise";
    case "apprenant_introuvable":
      return "apprenantIntrouvable";
    case "type_inconnu":
      return "typeInconnu";
    case "creneau_indisponible":
      return "creneauIndisponible";
    case "appel_decouverte_deja_reserve":
      return "appelDecouverteDejaReserve";
    default:
      return undefined;
  }
}

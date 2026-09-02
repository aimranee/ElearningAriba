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

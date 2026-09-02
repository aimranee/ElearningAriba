import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { QueryResult } from "@/lib/content/queries";

export type DisponibiliteHebdomadaire =
  Database["app"]["Tables"]["disponibilite_hebdomadaire"]["Row"];
export type ExceptionAgenda = Database["app"]["Tables"]["exception_agenda"]["Row"];
export type TypeRendezVousRow = Database["app"]["Tables"]["type_rendez_vous"]["Row"];
export type ReservationRow = Database["app"]["Tables"]["reservation"]["Row"];

/**
 * Only the columns plan 04-07's reads and the CSV export need — never the
 * full app.profil row (telephone, preferences, role are none of an export's
 * business).
 */
export type ProfilApprenant = Pick<
  Database["app"]["Tables"]["profil"]["Row"],
  "utilisateur_id" | "prenom" | "nom" | "email"
>;

export type ReservationAdmin = ReservationRow & {
  type_rendez_vous: TypeRendezVousRow;
  /**
   * why: null both when utilisateur_id itself is null (D-08 erasure, `on
   * delete set null`) and — belt and suspenders — if the profil row were
   * ever missing for a still-present id. Never a snapshot on the
   * reservation row; always this read-time join. Callers render
   * admin.reservations.compteSupprime with an empty email when this is
   * null.
   */
  profil: ProfilApprenant | null;
};

/* why: no export below filters by role or ownership — dispo_admin_all and
   exception_admin_all (plan 04-01) are the filter, evaluated through
   app.est_administrateur(). Adding an application-level check here would
   hide a policy regression behind application code; the negative proof in
   supabase/tests/lot4_rls_reservation.sql is what guards this choice —
   a non-administrator session reading these tables gets zero rows, not an
   error, since RLS with no matching policy returns an empty set. */

/** The weekly working-hours ranges, ordered the way the editor renders them. */
export async function listerDisponibilites(): Promise<
  QueryResult<DisponibiliteHebdomadaire[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("disponibilite_hebdomadaire")
    .select("*")
    .order("jour_semaine", { ascending: true })
    .order("heure_debut", { ascending: true });

  if (error || !data) {
    return { ok: false };
  }
  return { ok: true, data };
}

/**
 * Dated exceptions over a window, split by motif at the call site — this
 * read stays a single query so the two editors (blocages/ouvertures on
 * horaires, feries on jours-feries) share one source of truth instead of
 * two divergent reads.
 */
export async function listerExceptions(
  du: string,
  au: string,
): Promise<QueryResult<ExceptionAgenda[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exception_agenda")
    .select("*")
    .gte("jour", du)
    .lte("jour", au)
    .order("jour", { ascending: true });

  if (error || !data) {
    return { ok: false };
  }
  return { ok: true, data };
}

/** The seeded `motif = 'ferie'` rows for one calendar year (D-17). */
export async function listerJoursFeries(
  annee: number,
): Promise<QueryResult<ExceptionAgenda[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exception_agenda")
    .select("*")
    .eq("motif", "ferie")
    .gte("jour", `${annee}-01-01`)
    .lte("jour", `${annee}-12-31`)
    .order("jour", { ascending: true });

  if (error || !data) {
    return { ok: false };
  }
  return { ok: true, data };
}

/**
 * Fetches the profil rows for a set of learner ids and returns them keyed
 * by id, so both reservation reads below share one join strategy. Not a
 * PostgREST embed: app.reservation.utilisateur_id and app.profil both
 * reference auth.users independently, with no direct foreign key between
 * the two app tables, so embedding syntax (`.select("*, profil(*)")`) is
 * unavailable here — a second, explicit query is the only path.
 */
async function chargerProfilsApprenants(
  supabase: Awaited<ReturnType<typeof createClient>>,
  utilisateurIds: readonly string[],
): Promise<QueryResult<Map<string, ProfilApprenant>>> {
  if (utilisateurIds.length === 0) {
    return { ok: true, data: new Map() };
  }
  const { data, error } = await supabase
    .from("profil")
    .select("utilisateur_id, prenom, nom, email")
    .in("utilisateur_id", utilisateurIds);

  if (error || !data) {
    return { ok: false };
  }
  return { ok: true, data: new Map(data.map((profil) => [profil.utilisateur_id, profil])) };
}

/**
 * The reservations over a date window, joining app.type_rendez_vous and
 * app.profil at read time — never a name/email snapshotted on the
 * reservation row (D-08). No application-level owner filter: RLS
 * (reservation_admin_all, plan 04-01) is the filter, proven negative in
 * supabase/tests/lot4_rls_reservation.sql. `du`/`au` bound the `debut`
 * column, ISO date strings (YYYY-MM-DD).
 */
export async function listerReservationsAdmin(
  du: string,
  au: string,
): Promise<QueryResult<ReservationAdmin[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservation")
    .select("*, type_rendez_vous(*)")
    .gte("debut", du)
    .lte("debut", au)
    .order("debut", { ascending: true });

  if (error || !data) {
    return { ok: false };
  }
  const reservations = data as (ReservationRow & { type_rendez_vous: TypeRendezVousRow })[];

  const utilisateurIds = [
    ...new Set(
      reservations
        .map((reservation) => reservation.utilisateur_id)
        .filter((id): id is string => id !== null),
    ),
  ];
  const profilsResult = await chargerProfilsApprenants(supabase, utilisateurIds);
  if (!profilsResult.ok) {
    return { ok: false };
  }

  const rows: ReservationAdmin[] = reservations.map((reservation) => ({
    ...reservation,
    profil: reservation.utilisateur_id
      ? (profilsResult.data.get(reservation.utilisateur_id) ?? null)
      : null,
  }));

  return { ok: true, data: rows };
}

/**
 * One reservation by id, joining the same way as listerReservationsAdmin
 * above — used by the move/cancel/create-on-behalf route handlers to read
 * the learner's notification address and by the CSV export's row builder.
 */
export async function trouverReservationAdmin(
  id: string,
): Promise<QueryResult<ReservationAdmin>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservation")
    .select("*, type_rendez_vous(*)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return { ok: false };
  }
  const reservation = data as ReservationRow & { type_rendez_vous: TypeRendezVousRow };

  let profil: ProfilApprenant | null = null;
  if (reservation.utilisateur_id) {
    const profilsResult = await chargerProfilsApprenants(supabase, [reservation.utilisateur_id]);
    if (!profilsResult.ok) {
      return { ok: false };
    }
    profil = profilsResult.data.get(reservation.utilisateur_id) ?? null;
  }

  return { ok: true, data: { ...reservation, profil } };
}

import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { QueryResult } from "@/lib/content/queries";

export type Reservation = Database["app"]["Tables"]["reservation"]["Row"];
export type ReservationAvecType = Reservation & {
  type_rendez_vous: Database["app"]["Tables"]["type_rendez_vous"]["Row"];
};

/* why: neither function below filters on the owning-learner column
   (utilisateur_id) — RLS (reservation_self_select, plan 04-01) is the
   filter. Adding an application-level `.eq()` here would hide a policy
   regression behind application code; the negative proof in
   supabase/tests/lot4_rls_reservation.sql is what guards this choice. */

/** The signed-in learner's upcoming, non-cancelled reservations, for /espace. */
export async function listerReservationsApprenant(): Promise<
  QueryResult<ReservationAvecType[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservation")
    .select("*, type_rendez_vous(*)")
    .neq("statut", "annulee")
    .gte("debut", new Date().toISOString())
    .order("debut", { ascending: true });

  if (error || !data) {
    return { ok: false };
  }
  return { ok: true, data: data as ReservationAvecType[] };
}

/**
 * One reservation by id, for the .ics download (screen 4 CTA and
 * espace) and for the post-commit read the booking route uses to build the
 * .ics attachment. RLS alone decides entitlement — the same row stays
 * unreachable from a different learner's session.
 */
export async function trouverReservation(
  id: string,
): Promise<QueryResult<ReservationAvecType>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservation")
    .select("*, type_rendez_vous(*)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return { ok: false };
  }
  return { ok: true, data: data as ReservationAvecType };
}

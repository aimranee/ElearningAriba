import { NextResponse } from "next/server";

import { requireAdministrator } from "@/lib/auth/session";
import { listerReservationsAdmin } from "@/lib/agenda/admin-queries";
import { construireCsv } from "@/lib/agenda/csv";
import { exportSchema, mapAgendaAdminIssueToErreurKey } from "@/lib/validation/agenda-admin";
import * as i18n from "@/lib/i18n/fr";
import admin from "@/locales/fr/admin.json";

/*
 * why: D-19 — streams a chosen period's reservations as a CSV that opens
 * correctly and safely in French Excel. This file exports GET only. No
 * POST/PUT/PATCH/DELETE.
 *
 * why: no cache declaration beyond the one below, following
 * documents/[id]/route.ts's stated reasoning — this is a stream of
 * personal data (T-04-46) and must never be cached or served to a second
 * caller.
 */

const STATUT_LABELS: Record<string, string> = {
  confirmee: admin.reservations.statuts.confirmee,
  en_attente_paiement: admin.reservations.statuts.enAttentePaiement,
  annulee: admin.reservations.statuts.annulee,
};

export async function GET(request: Request) {
  await requireAdministrator();

  const url = new URL(request.url);
  const parsed = exportSchema.safeParse({
    du: url.searchParams.get("du"),
    au: url.searchParams.get("au"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { erreur: mapAgendaAdminIssueToErreurKey(parsed.error.issues) },
      { status: 422, headers: { "Cache-Control": "no-store" } },
    );
  }
  const { du, au } = parsed.data;

  const result = await listerReservationsAdmin(du, au);
  if (!result.ok) {
    return NextResponse.json(
      { erreur: admin.erreurs.erreurGenerique },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  const header = [
    admin.reservations.colonnes.date,
    admin.reservations.colonnes.type,
    admin.reservations.colonnes.duree,
    admin.reservations.colonnes.apprenant,
    admin.reservations.colonnes.email,
    admin.reservations.colonnes.statut,
  ];

  /* why: never a name/email snapshotted on the reservation row (D-08) —
     "compte supprime" with an empty email comes straight from the
     read-time join in admin-queries.ts, the same rendering the [id] route
     applies before skipping a notification. */
  const rows = result.data.map((reservation) => {
    const debut = new Date(reservation.debut);
    const dateHeure = `${i18n.formatDateAvecJour(debut)} à ${i18n.formatHeureProse(debut)}`;
    const dureeHeures = reservation.type_rendez_vous.duree_minutes / 60;
    const apprenant = reservation.profil
      ? `${reservation.profil.prenom} ${reservation.profil.nom}`.trim()
      : admin.reservations.compteSupprime;
    const email = reservation.profil?.email ?? "";
    const statut = STATUT_LABELS[reservation.statut] ?? reservation.statut;

    return [dateHeure, reservation.type_rendez_vous.libelle, i18n.formatHours(dureeHeures), apprenant, email, statut];
  });

  const csv = construireCsv(header, rows);

  /* why (T-04-47): the filename is derived from the validated date range
     only, never from user input — no header-injection surface exists
     here. */
  const filename = `reservations-${du}-${au}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store, no-cache, private",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}

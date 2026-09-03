import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReservationActions } from "@/components/admin/reservation-actions";
import type { ReservationAdmin } from "@/lib/agenda/admin-queries";
import * as i18n from "@/lib/i18n/fr";
import admin from "@/locales/fr/admin.json";

const STATUT_VARIANT: Record<string, "success" | "muted"> = {
  confirmee: "success",
  en_attente_paiement: "muted",
  annulee: "muted",
};

const STATUT_LABEL: Record<string, string> = {
  confirmee: admin.reservations.statuts.confirmee,
  en_attente_paiement: admin.reservations.statuts.enAttentePaiement,
  annulee: admin.reservations.statuts.annulee,
};

/*
 * why: hand-rolled on card/badge/button rows, no data-grid dependency
 * (zero-new-dependency budget). Each row is a flex column at rest — the
 * mobile restack — becoming a horizontal row at md and above, so there is
 * no separate "desktop" and "mobile" markup and no sideways-scrolling
 * escape hatch is ever reachable. Move/cancel live in ReservationActions,
 * a client component per row.
 */
export function ReservationsTable({ reservations }: { reservations: ReservationAdmin[] }) {
  if (reservations.length === 0) {
    return <p className="text-muted-foreground text-sm">{admin.reservations.vide}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-muted-foreground hidden text-xs font-medium uppercase md:flex md:gap-4 md:px-4">
        <span className="md:flex-1">{admin.reservations.colonnes.date}</span>
        <span className="md:flex-1">{admin.reservations.colonnes.type}</span>
        <span className="md:w-28">{admin.reservations.colonnes.statut}</span>
        <span className="md:flex-1">{admin.reservations.colonnes.apprenant}</span>
      </div>

      {reservations.map((reservation) => {
        const debut = new Date(reservation.debut);
        const dureeHeures = reservation.type_rendez_vous.duree_minutes / 60;
        const apprenant = reservation.profil
          ? `${reservation.profil.prenom} ${reservation.profil.nom}`.trim()
          : admin.reservations.compteSupprime;
        const email = reservation.profil?.email ?? "";

        return (
          <Card key={reservation.id} variant="outline">
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col gap-0.5 md:flex-1">
                  <span className="text-muted-foreground text-xs md:hidden">
                    {admin.reservations.colonnes.date}
                  </span>
                  <span className="text-foreground text-sm font-medium">
                    {i18n.formatDateAvecJour(debut)}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {i18n.formatHeureProse(debut)}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 md:flex-1">
                  <span className="text-muted-foreground text-xs md:hidden">
                    {admin.reservations.colonnes.type}
                  </span>
                  <span className="text-foreground text-sm">
                    {reservation.type_rendez_vous.libelle}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {i18n.formatHours(dureeHeures)}
                  </span>
                </div>

                <div className="md:w-28">
                  <span className="text-muted-foreground text-xs md:hidden">
                    {admin.reservations.colonnes.statut}
                  </span>
                  <div>
                    <Badge variant={STATUT_VARIANT[reservation.statut] ?? "muted"}>
                      {STATUT_LABEL[reservation.statut] ?? reservation.statut}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 md:flex-1">
                  <span className="text-muted-foreground text-xs md:hidden">
                    {admin.reservations.colonnes.apprenant}
                  </span>
                  <span className="text-foreground text-sm">{apprenant}</span>
                  {email ? (
                    <span className="text-muted-foreground text-sm">{email}</span>
                  ) : null}
                </div>
              </div>

              <ReservationActions reservation={reservation} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

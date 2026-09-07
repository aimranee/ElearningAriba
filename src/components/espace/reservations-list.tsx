import type { ReservationAvecType } from "@/lib/agenda/queries";
import { Badge } from "@/components/ui/badge";
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state";
import agenda from "@/locales/fr/agenda.json";
import espace from "@/locales/fr/espace.json";
import { formatDateAvecJour, formatHeureProse, formatHours } from "@/lib/i18n/fr";

/*
 * why (D-11): the Mes prochains rendez-vous card body — the first plan to
 * populate it. Zero rows renders the existing byte-identical empty state
 * (espace.rendezVous.vide.*, unchanged); one or more rows renders a list,
 * with no cancel and no reschedule control anywhere — that gesture belongs
 * to the trainer, stated once beneath the rows rather than as a per-row
 * action. A reservation whose utilisateur_id is null (D-08, erasure) can
 * never reach this surface: RLS filters on the session's own id, so no
 * "compte supprimé" case belongs here — that reads on /admin (plan 04-08).
 */
export function ReservationsList({
  reservations,
}: {
  reservations: ReservationAvecType[];
}) {
  if (reservations.length === 0) {
    return (
      <EmptyState tone="waiting" size="sm">
        <EmptyStateTitle>{espace.rendezVous.vide.titre}</EmptyStateTitle>
        <EmptyStateDescription>{espace.rendezVous.vide.message}</EmptyStateDescription>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {reservations.map((row) => {
          const debut = new Date(row.debut);
          return (
            <li
              key={row.id}
              className="flex flex-col gap-1 in-data-[density=compact]:gap-0.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  {row.type_rendez_vous.libelle}
                </span>
                <Badge variant="success">{espace.rendezVous.statutConfirme}</Badge>
              </div>
              <span className="text-muted-foreground text-sm capitalize">
                {formatDateAvecJour(debut)} · {formatHeureProse(debut)} ·{" "}
                {formatHours(row.type_rendez_vous.duree_minutes / 60)}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-muted-foreground text-sm in-data-[density=compact]:text-xs">
        {agenda.confiance.modification}
      </p>
    </div>
  );
}

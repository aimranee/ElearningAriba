import { listerReservationsAdmin } from "@/lib/agenda/admin-queries";
import { getTypesRendezVous } from "@/lib/agenda/types-rendez-vous";
import { jourIsoParis } from "@/lib/agenda/creneaux";
import { ReservationsTable } from "@/components/admin/reservations-table";
import { ReservationCreation } from "@/components/admin/reservation-creation";
import { ExportPanel } from "@/components/admin/export-panel";
import admin from "@/locales/fr/admin.json";

const FENETRE_PASSEE_JOURS = 30;
const FENETRE_FUTURE_JOURS = 60;

/*
 * why: role gate already ran in src/app/admin/layout.tsx
 * (requireAdministrator()) before this Server Component renders — no
 * second check here, same discipline as admin/horaires/page.tsx and
 * admin/jours-feries/page.tsx. The default window spans
 * FENETRE_PASSEE_JOURS days back, so a just-completed appointment is still
 * visible, through FENETRE_FUTURE_JOURS days ahead — beyond D-13's own
 * eight-week public booking horizon, so the trainer sees the whole booked
 * future, not only what a visitor could still book today.
 */
export default async function AdminReservationsPage() {
  const maintenant = new Date();
  const du = jourIsoParis(
    new Date(maintenant.getTime() - FENETRE_PASSEE_JOURS * 24 * 60 * 60 * 1000),
  );
  const au = jourIsoParis(
    new Date(maintenant.getTime() + FENETRE_FUTURE_JOURS * 24 * 60 * 60 * 1000),
  );

  const [reservationsResult, typesResult] = await Promise.all([
    listerReservationsAdmin(du, au),
    getTypesRendezVous(),
  ]);

  const reservations = reservationsResult.ok ? reservationsResult.data : [];
  const types = typesResult.ok ? typesResult.data : [];

  return (
    <div className="flex flex-col gap-6 py-6 md:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          {admin.reservations.titre}
        </h1>
        <p className="text-muted-foreground text-sm">{admin.reservations.intro}</p>
      </div>

      <ReservationsTable reservations={reservations} />

      {types.length > 0 ? <ReservationCreation types={types} /> : null}

      <ExportPanel />
    </div>
  );
}

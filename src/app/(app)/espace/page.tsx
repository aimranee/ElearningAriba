import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "@/components/ui/empty-state";
import { DocumentsList } from "@/components/espace/documents-list";
import { ReservationsList } from "@/components/espace/reservations-list";
import { requireLearner } from "@/lib/auth/session";
import { listerSupports } from "@/lib/documents/queries";
import { listerReservationsApprenant } from "@/lib/agenda/queries";
import espace from "@/locales/fr/espace.json";

const SURFACES = [
  { key: "rendezVous", tone: "waiting" as const },
  { key: "sessions", tone: "waiting" as const },
  { key: "historique", tone: "neutral" as const },
  { key: "documents", tone: "neutral" as const },
  { key: "factures", tone: "neutral" as const },
  { key: "avancement", tone: "neutral" as const },
] as const;

export default async function Espace() {
  const learner = await requireLearner();
  const supports = await listerSupports();
  const reservations = await listerReservationsApprenant();

  return (
    <div className="flex flex-col gap-10 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          {espace.titre}
        </h1>
        <p className="text-muted-foreground">{espace.intro}</p>
      </div>

      <EmptyState tone="waiting">
        <EmptyStateTitle>{espace.aucuneReservation.titre}</EmptyStateTitle>
        <EmptyStateDescription>
          {espace.aucuneReservation.message}
        </EmptyStateDescription>
        <EmptyStateAction>
          <Button render={<Link href="/agenda" />} nativeButton={false}>
            {espace.aucuneReservation.action}
          </Button>
        </EmptyStateAction>
      </EmptyState>

      {/* why: the greeting doubles as the section heading above the surface
          grid — h1 -> h2 -> h3 (card titles), no level skipped, with no
          invented copy: the string is required content, not decoration. */}
      <h2 className="font-heading text-xl font-semibold text-foreground">
        {espace.bienvenue.replace("{prenom}", learner.prenom)}
      </h2>

      {/* why: the back-office reuses this component set at a tighter
          density (D-24) — the contract is one attribute away, left at its
          default value here. */}
      <div
        data-density="default"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {SURFACES.map(({ key, tone }) => {
          const surface = espace[key];
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle>{surface.titre}</CardTitle>
              </CardHeader>
              {key === "documents" ? (
                <DocumentsList supports={supports.ok ? supports.data : []} />
              ) : key === "rendezVous" ? (
                <ReservationsList
                  reservations={reservations.ok ? reservations.data : []}
                />
              ) : (
                <EmptyState tone={tone} size="sm">
                  <EmptyStateTitle>{surface.vide.titre}</EmptyStateTitle>
                  <EmptyStateDescription>
                    {surface.vide.message}
                  </EmptyStateDescription>
                </EmptyState>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

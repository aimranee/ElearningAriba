import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";

import agenda from "@/locales/fr/agenda.json";
import reservation from "@/locales/fr/reservation.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Message } from "@/components/ui/message";
import { EmptyState, EmptyStateTitle } from "@/components/ui/empty-state";
import { requireLearner } from "@/lib/auth/session";
import { trouverReservation } from "@/lib/agenda/queries";
import {
  formatCurrency,
  formatDateAvecJour,
  formatHeureProse,
  formatHours,
} from "@/lib/i18n/fr";

type ConfirmationPageProps = {
  searchParams: Promise<{ id?: string }>;
};

const idSchema = z.uuid();

/*
 * why (D-10): the fourth surface — a distinct route, not a step of the
 * three-step stepper on /reservation. Personal data lives here, so this
 * page keeps requireLearner() in the redirect-before-markup shape that
 * /reservation deliberately lifted (D-28).
 */
export default async function ReservationConfirmation({
  searchParams,
}: ConfirmationPageProps) {
  await requireLearner();
  const { id } = await searchParams;
  const parsedId = id ? idSchema.safeParse(id) : null;

  if (!parsedId) {
    redirect("/espace");
  }

  /* why (T-04-29): trouverReservation reads through RLS with no
     application-level owner filter, so an id that does not exist and an id
     belonging to a different learner render the same not-found surface —
     never an existence oracle. A malformed id fails the same way, below. */
  const result = parsedId.success
    ? await trouverReservation(parsedId.data)
    : { ok: false as const };

  if (!result.ok) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <EmptyState tone="error">
          <EmptyStateTitle>{reservation.erreurs.icsIndisponible}</EmptyStateTitle>
        </EmptyState>
      </div>
    );
  }

  const row = result.data;
  const debut = new Date(row.debut);
  const type = row.type_rendez_vous;
  const gratuit = type.prix_centimes === 0;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <Card variant="raised">
        <CardHeader className="flex flex-col gap-2">
          <Message variant="success">{reservation.succes.titre}</Message>
          <p className="text-muted-foreground">{reservation.succes.message}</p>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-muted-foreground">{reservation.recapitulatif.type}</p>
            <p>{type.libelle}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{reservation.recapitulatif.date}</p>
            <p className="capitalize">{formatDateAvecJour(debut)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{reservation.recapitulatif.heure}</p>
            <p>{formatHeureProse(debut)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{reservation.recapitulatif.duree}</p>
            <p>{formatHours(type.duree_minutes / 60)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{reservation.recapitulatif.prix}</p>
            <p>{formatCurrency(type.prix_centimes / 100)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{reservation.recapitulatif.lieu}</p>
            <p>{row.lieu}</p>
          </div>
        </CardContent>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm">
            {gratuit ? reservation.reglement.gratuit : reservation.reglement.payant}
          </p>
          <p className="text-muted-foreground text-sm">{agenda.confiance.modification}</p>
          <div className="flex flex-wrap gap-3">
            <Button
              render={<Link href={`/api/reservation/${row.id}/ics`} />}
              nativeButton={false}
              className="h-11"
            >
              {reservation.actions.ajouterAMonAgenda}
            </Button>
            <Button
              render={<Link href="/espace" />}
              nativeButton={false}
              variant="outline"
              className="h-11"
            >
              {reservation.actions.retourEspace}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

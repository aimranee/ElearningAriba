import { z } from "zod";

import reservation from "@/locales/fr/reservation.json";
import { EmptyState, EmptyStateTitle } from "@/components/ui/empty-state";
import * as authSession from "@/lib/auth/session";
import { getTypesRendezVous } from "@/lib/agenda/types-rendez-vous";
import { serverEnv } from "@/lib/env/server";
import { ParcoursReservation } from "@/components/reservation/parcours-reservation";

/*
 * why (D-28): this page is deliberately NOT gated — the visitor chooses
 * first (screens 1 and 2) and identifies only to commit (screen 3), so the
 * session is read tolerantly here rather than required. The redirect-
 * before-markup guard used elsewhere would fire before any markup renders,
 * which is exactly the barrier D-28 removes. The confirmation surface,
 * which holds personal data, keeps that stricter guard — see that route.
 */
/* why (#27): `?type=<id>` is a deep link from the Formation page's RDV
   surfaces — validated at the boundary, and kept only when it names an
   active type, so an unknown, missing or inactive id leaves the flow
   exactly as it is without the parameter. */
const searchParamsSchema = z.object({ type: z.string().optional() });

export default async function Reservation({ searchParams }: PageProps<"/reservation">) {
  const learnerResult = await authSession.getLearner();
  const estConnecte = learnerResult.ok;

  const [typesResult, params] = await Promise.all([
    getTypesRendezVous(),
    searchParams.then((raw) => searchParamsSchema.safeParse(raw)),
  ]);
  const typeDemande = params.success ? params.data.type : undefined;
  const typeInitial =
    typesResult.ok && typeDemande && typesResult.data.some((type) => type.id === typeDemande)
      ? typeDemande
      : null;

  /* why (D-15, T-04-31c): FORMATEUR_LIEN_VISIO is the trainer's *permanent*
     meeting room, not a per-meeting link — reading it here only when
     estConnecte is true, and passing null otherwise, is what keeps it out
     of the response body of every unauthenticated request against this
     now-public route. An anonymous visitor at screen 3 is not committing,
     they are being asked to identify, and sees the neutral
     reservation.recapitulatif.lieuVisio sentence instead. */
  const lieu = estConnecte ? (serverEnv.FORMATEUR_LIEN_VISIO ?? null) : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          {reservation.titre}
        </h1>
        <p className="text-muted-foreground">{reservation.intro}</p>
      </header>

      {typesResult.ok && typesResult.data.length > 0 ? (
        <ParcoursReservation
          types={typesResult.data}
          estConnecte={estConnecte}
          lieu={lieu}
          typeInitial={typeInitial}
        />
      ) : (
        <EmptyState tone="error">
          <EmptyStateTitle>{reservation.erreurs.erreurGenerique}</EmptyStateTitle>
        </EmptyState>
      )}
    </div>
  );
}

import agenda from "@/locales/fr/agenda.json";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatMinutes } from "@/lib/i18n/fr";
import { getTypesRendezVous } from "@/lib/agenda/types-rendez-vous";
import { AgendaBooker } from "@/components/agenda/agenda-booker";

/* why (D-06, a-propos precedent): a cookie-free server read under
   revalidate keeps the route static/ISR — no request-scoped dynamic API
   (the cookie jar, the header map, the query string) is read at the top
   level. The live availability read happens entirely inside
   <AgendaBooker />, a client island mounted below. */
export const revalidate = 3600;

export default async function Agenda() {
  const typesResult = await getTypesRendezVous();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          {agenda.titre}
        </h1>
        <p className="text-muted-foreground">{agenda.intro}</p>
      </header>

      {typesResult.ok ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {typesResult.data.map((type) => (
              <Card key={type.id}>
                <CardHeader>
                  {/* why: no h2 precedes the chooser (no copy key exists for
                      a section title here); a heading tag would skip a
                      level, so the type name is a styled paragraph, not
                      CardTitle's h3 */}
                  <p className="font-heading text-base font-semibold">
                    {type.libelle}
                  </p>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-sm">
                    {formatMinutes(type.dureeMinutes)}
                  </span>
                  <Badge variant={type.prixCentimes === 0 ? "success" : "outline"}>
                    {formatCurrency(type.prixCentimes / 100)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* D-24: the public legend — Libre / Indisponible / Passé, never
              Réservé/Bloqué. Static and server-rendered, never destructive
              (D-U3): "Indisponible" is a neutral state, not an error. */}
          <div className="flex flex-wrap gap-3 text-sm" aria-label="Légende">
            <span className="flex items-center gap-1.5">
              <Badge variant="default" className="size-2 rounded-full p-0" />
              {agenda.legende.libre}
            </span>
            <span className="flex items-center gap-1.5">
              <Badge variant="muted" className="size-2 rounded-full p-0" />
              {agenda.legende.indisponible}
            </span>
            <span className="flex items-center gap-1.5">
              <Badge variant="muted" className="size-2 rounded-full p-0" />
              {agenda.legende.passe}
            </span>
          </div>

          <AgendaBooker types={typesResult.data} />
        </>
      ) : (
        <section aria-label={agenda.aucunCreneau.titre}>
          <h2 className="mb-3 font-heading text-lg font-semibold sm:text-xl">
            {agenda.aucunCreneau.titre}
          </h2>
          <EmptyState tone="waiting">
            <EmptyStateTitle>{agenda.aucunCreneau.titre}</EmptyStateTitle>
            <EmptyStateDescription>
              {agenda.aucunCreneau.message}
            </EmptyStateDescription>
            <EmptyStateAction>
              <Button variant="secondary">{agenda.aucunCreneau.action}</Button>
            </EmptyStateAction>
          </EmptyState>
        </section>
      )}
    </div>
  );
}

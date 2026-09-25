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
import { getMessages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import { getTypesRendezVous } from "@/lib/agenda/types-rendez-vous";
import { AgendaBooker } from "@/components/agenda/agenda-booker";

/*
 * why (#24): the agenda body, rendered by both route files — (public)/agenda
 * in French and (public-en)/en/calendar in English — so the two copies cannot
 * drift. The booker is a client island: its text arrives from here, already
 * in the page's language. Picking a slot hands over to the same /reservation
 * in both languages (the booking flow stays French until Phase B).
 *
 * (D-06, a-propos precedent) a cookie-free server read under the route's
 * revalidate keeps it static/ISR — no request-scoped dynamic API (the cookie
 * jar, the header map, the query string) is read here. The live availability
 * read happens entirely inside <AgendaBooker />.
 */
export async function PageAgenda({ locale }: { locale: Locale }) {
  const agenda = getMessages(locale, "agenda");
  const common = getMessages(locale, "common");
  const typesResult = await getTypesRendezVous(locale);

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
                    {formatMinutes(type.dureeMinutes, locale)}
                  </span>
                  <Badge variant={type.prixCentimes === 0 ? "success" : "outline"}>
                    {formatCurrency(type.prixCentimes / 100, locale)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* D-24: the public legend — Libre / Indisponible / Passé, never
              Réservé/Bloqué. Static and server-rendered, never destructive
              (D-U3): "Indisponible" is a neutral state, not an error. */}
          <div className="flex flex-wrap gap-3 text-sm" aria-label={agenda.legende.titre}>
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

          <AgendaBooker
            locale={locale}
            texte={{
              titre: agenda.titre,
              moisPrecedent: agenda.moisPrecedent,
              moisSuivant: agenda.moisSuivant,
              legende: agenda.legende,
              aucunCreneau: agenda.aucunCreneau,
              matin: agenda.matin,
              apresMidi: agenda.apresMidi,
              voirPlus: agenda.voirPlus,
              confiance: agenda.confiance,
              erreurs: agenda.erreurs,
              photoSlot: common.photoSlot,
            }}
            types={typesResult.data}
          />
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

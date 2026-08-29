import agenda from "@/locales/fr/agenda.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { formatCurrency, formatNumber } from "@/lib/i18n/fr";

/* why: Lot 4 owns real availability (recurrence, locks, conflicts); this grid
   is illustrative maquette data only, replaced wholesale in that lot */
const joursMaquette = [
  { jour: 1, statut: "libre" },
  { jour: 2, statut: "libre" },
  { jour: 3, statut: "reserve" },
  { jour: 4, statut: "passe" },
  { jour: 5, statut: "bloque" },
  { jour: 6, statut: "libre" },
  { jour: 7, statut: "reserve" },
] as const;

const legendeVariant = {
  libre: "success",
  reserve: "default",
  passe: "muted",
  bloque: "destructive",
} as const;

export default function Agenda() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          {agenda.titre}
        </h1>
        <p className="text-muted-foreground">{agenda.intro}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {agenda.typesRendezVous.map((type) => (
          <Card key={type.id}>
            <CardHeader>
              {/* why: no h2 precedes the chooser (no copy key exists for a
                  section title here); a heading tag would skip a level, so
                  the type name is a styled paragraph, not CardTitle's h3 */}
              <p className="font-heading text-base font-semibold">
                {type.libelle}
              </p>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-sm">
                {formatNumber(type.dureeMinutes)}
              </span>
              <Badge variant={type.prix === 0 ? "success" : "outline"}>
                {formatCurrency(type.prix)}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card variant="outline" className="gap-3">
        <CardHeader className="flex-row items-center justify-between gap-2">
          <Button variant="ghost" size="sm">
            {agenda.moisPrecedent}
          </Button>
          <Button variant="ghost" size="sm">
            {agenda.moisSuivant}
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-7 gap-2">
          {joursMaquette.map((j) => (
            <Badge
              key={j.jour}
              variant={legendeVariant[j.statut]}
              className="justify-center"
            >
              {j.jour}
            </Badge>
          ))}
        </CardContent>
        <CardContent className="flex flex-wrap gap-3 text-sm">
          {Object.entries(agenda.legende).map(([key, label]) => (
            <span key={key} className="flex items-center gap-1.5">
              <Badge
                variant={legendeVariant[key as keyof typeof legendeVariant]}
                className="size-2 rounded-full p-0"
              />
              {label}
            </span>
          ))}
        </CardContent>
      </Card>

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
    </div>
  );
}

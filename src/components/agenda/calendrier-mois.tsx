import { ChevronLeft, ChevronRight } from "lucide-react";
import agenda from "@/locales/fr/agenda.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { grilleDuMois, estPasse } from "@/lib/agenda/creneaux";

const JOURS_SEMAINE = ["L", "M", "M", "J", "V", "S", "D"];

type CalendrierMoisProps = {
  annee: number;
  mois: number;
  joursPorteurs: Set<string>;
  jourSelectionne: string | null;
  onSelectJour: (jour: string) => void;
  onMoisPrecedent: () => void;
  onMoisSuivant: () => void;
};

/*
 * why (D-23, D-29): this component receives only the joursPorteurs set of
 * day keys that carry slots — its props type carries no reason, status or
 * per-day enum, so it is structurally incapable of leaking why a day is
 * empty. A day outside that set is inert: not clickable, not focusable as
 * a choice (the datePickerDatesActive shape). estPasse is a locally
 * computable calendar fact (today's date), not a server-supplied reason,
 * so consulting it for the "Passé" label does not reopen that leak.
 */
export function CalendrierMois({
  annee,
  mois,
  joursPorteurs,
  jourSelectionne,
  onSelectJour,
  onMoisPrecedent,
  onMoisSuivant,
}: CalendrierMoisProps) {
  const grille = grilleDuMois(annee, mois);
  const moisAffiche = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(annee, mois, 1)));

  return (
    <Card variant="outline" className="gap-3">
      <CardHeader className="flex-row items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-11 min-w-11"
          onClick={onMoisPrecedent}
          aria-label={agenda.moisPrecedent}
        >
          <ChevronLeft aria-hidden="true" className="size-4 sm:hidden" />
          <span className="sr-only sm:not-sr-only">{agenda.moisPrecedent}</span>
        </Button>
        <p className="font-heading text-sm font-semibold capitalize">
          {moisAffiche}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-11 min-w-11"
          onClick={onMoisSuivant}
          aria-label={agenda.moisSuivant}
        >
          <ChevronRight aria-hidden="true" className="size-4 sm:hidden" />
          <span className="sr-only sm:not-sr-only">{agenda.moisSuivant}</span>
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-7 gap-1 px-3 sm:gap-2 sm:px-4">
        {JOURS_SEMAINE.map((label, index) => (
          <span
            key={`entete-${index}`}
            className="text-muted-foreground text-center text-xs font-medium"
            aria-hidden="true"
          >
            {label}
          </span>
        ))}
        {grille.map((jour) => {
          const estDansMois = jour.slice(5, 7) === String(mois + 1).padStart(2, "0");
          const porteur = joursPorteurs.has(jour);
          const passe = estPasse(jour);
          const jourDuMois = Number(jour.slice(8, 10));
          const selectionne = jourSelectionne === jour;

          if (!porteur) {
            return (
              <span
                key={jour}
                aria-disabled="true"
                aria-label={passe ? agenda.legende.passe : agenda.legende.indisponible}
                className={cn(
                  "text-muted-foreground bg-muted flex h-11 w-full items-center justify-center rounded-lg text-sm",
                  !estDansMois && "opacity-40",
                )}
              >
                {jourDuMois}
              </span>
            );
          }

          return (
            <button
              key={jour}
              type="button"
              onClick={() => onSelectJour(jour)}
              aria-pressed={selectionne}
              aria-label={`${jourDuMois} — ${agenda.legende.libre}`}
              className={cn(
                "flex h-11 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                selectionne
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary hover:bg-primary/20 focus-visible:bg-primary/20",
              )}
            >
              {jourDuMois}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

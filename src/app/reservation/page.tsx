import agenda from "@/locales/fr/agenda.json";
import common from "@/locales/fr/common.json";
import reservation from "@/locales/fr/reservation.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Message } from "@/components/ui/message";
import { formatCurrency, formatDate, formatNumber, formatTime } from "@/lib/i18n/fr";

/* why: Lot 4 owns the real booking transaction; this is the one slot the
   maquette needs to show a filled-in recap, replaced wholesale in that lot */
const creneauMaquette = {
  type: agenda.typesRendezVous[1],
  date: new Date("2026-09-14T09:00:00Z"),
  heure: new Date("2026-09-14T09:00:00Z"),
} as const;

const etapesOrdre = ["typeRendezVous", "creneau", "confirmation"] as const;

export default function Reservation() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          {reservation.titre}
        </h1>
        <p className="text-muted-foreground">{reservation.intro}</p>
      </header>

      <ol className="flex flex-wrap gap-2 text-sm">
        {etapesOrdre.map((cle, index) => {
          const active = index === etapesOrdre.length - 1;
          return (
            <li key={cle}>
              <span
                className={
                  active
                    ? "rounded-lg bg-primary/10 px-2.5 py-1 font-medium text-primary"
                    : "text-muted-foreground px-2.5 py-1"
                }
                aria-current={active ? "step" : undefined}
              >
                {reservation.etapes[cle]}
              </span>
            </li>
          );
        })}
      </ol>

      <Card>
        <CardHeader>
          <p className="font-heading text-base font-semibold">
            {reservation.recapitulatif.type}
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground">{reservation.recapitulatif.type}</p>
            <p>{creneauMaquette.type.libelle}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{reservation.recapitulatif.date}</p>
            <p>{formatDate(creneauMaquette.date)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{reservation.recapitulatif.heure}</p>
            <p>{formatTime(creneauMaquette.heure)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{reservation.recapitulatif.duree}</p>
            <p>{formatNumber(creneauMaquette.type.dureeMinutes)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{reservation.recapitulatif.prix}</p>
            <p>{formatCurrency(creneauMaquette.type.prix)}</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-sm">{reservation.conditions}</p>

      <Button variant="default" className="w-fit">
        {common.actions.reserver}
      </Button>

      <section aria-label={reservation.erreurs.creneauIndisponible} className="rounded-lg border p-4">
        <Message variant="error">{reservation.erreurs.creneauIndisponible}</Message>
      </section>
    </div>
  );
}

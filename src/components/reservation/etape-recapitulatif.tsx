"use client";

import Link from "next/link";

import agenda from "@/locales/fr/agenda.json";
import reservation from "@/locales/fr/reservation.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { TypeRendezVous } from "@/lib/agenda/types-rendez-vous";
import {
  formatCurrency,
  formatDateAvecJour,
  formatHeureProse,
  formatHours,
} from "@/lib/i18n/fr";
import { CompteARebours } from "@/components/reservation/compte-a-rebours-maintien";

type EtapeRecapitulatifProps = {
  type: TypeRendezVous;
  debut: Date;
  lieu: string | null;
  estConnecte: boolean;
  expireLe: Date | null;
  onChoisirAutreHoraire: () => void;
  statutCommit: "idle" | "submitting" | "error";
  onValider: () => void;
  onDetourConnexion: () => void;
};

/*
 * why (D-10, D-14, D-15, D-28): screen 3. The recap fields read as
 * information, not as choices — one accent-coloured button that commits.
 * D-15's link is a permanent meeting room, so it renders only once
 * `estConnecte` is true; an anonymous visitor sees the neutral
 * reservation.recapitulatif.lieuVisio sentence instead (see the server page
 * guard in src/app/reservation/page.tsx). The D-11 modification rule and the
 * confirmation trust signal both reuse agenda.confiance's existing copy
 * verbatim, above the commit control in document order, and are also the
 * same strings shown at screen 2 via ListeCreneaux.
 */
export function EtapeRecapitulatif({
  type,
  debut,
  lieu,
  estConnecte,
  expireLe,
  onChoisirAutreHoraire,
  statutCommit,
  onValider,
  onDetourConnexion,
}: EtapeRecapitulatifProps) {
  const isSubmitting = statutCommit === "submitting";
  const gratuit = type.prixCentimes === 0;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <p className="font-heading text-base font-semibold">
            {reservation.recapitulatif.type}
          </p>
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
            <p>{formatHours(type.dureeMinutes / 60)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{reservation.recapitulatif.prix}</p>
            <p>{formatCurrency(type.prixCentimes / 100)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{reservation.recapitulatif.lieu}</p>
            <p>{estConnecte && lieu ? lieu : reservation.recapitulatif.lieuVisio}</p>
          </div>
        </CardContent>
      </Card>

      {expireLe ? (
        <CompteARebours expireLe={expireLe} onChoisirAutreHoraire={onChoisirAutreHoraire} />
      ) : null}

      <p className="text-muted-foreground text-sm">{agenda.confiance.modification}</p>
      <p className="text-muted-foreground text-sm">{agenda.confiance.confirmation}</p>
      <p className="text-sm">
        {gratuit ? reservation.reglement.gratuit : reservation.reglement.payant}
      </p>

      {estConnecte ? (
        <Button
          type="button"
          className="h-11 self-start"
          data-loading={isSubmitting ? "true" : undefined}
          disabled={isSubmitting}
          onClick={onValider}
        >
          {reservation.actions.validerReservation}
        </Button>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">
            {reservation.connexionRequise.message}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              render={<Link href="/connexion" onClick={onDetourConnexion} />}
              nativeButton={false}
              className="h-11"
            >
              {reservation.actions.seConnecter}
            </Button>
            <Button
              render={<Link href="/inscription" onClick={onDetourConnexion} />}
              nativeButton={false}
              variant="outline"
              className="h-11"
            >
              {reservation.actions.sInscrire}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

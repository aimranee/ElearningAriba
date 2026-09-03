"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Message } from "@/components/ui/message";
import { createClient } from "@/lib/supabase/client";
import { CalendrierMois } from "@/components/agenda/calendrier-mois";
import { ListeCreneaux } from "@/components/agenda/liste-creneaux";
import { BookerSkeleton } from "@/components/agenda/booker-skeleton";
import {
  type Creneau,
  creneauxRpcSchema,
  versCreneaux,
  jourIsoParis,
  grouperParJour,
  premierJourPorteur,
  joursPorteurs,
} from "@/lib/agenda/creneaux";
import type { ReservationAdmin } from "@/lib/agenda/admin-queries";
import admin from "@/locales/fr/admin.json";
import common from "@/locales/fr/common.json";

const HORIZON_JOURS = 56; // same D-13 horizon the public booker uses

type StatutChargement = "chargement" | "pret" | "vide" | "erreur";

/*
 * why: the shared instant chooser for both the per-row move below and
 * create-on-behalf (reservation-creation.tsx) — one fetch/state machine, not
 * two divergent copies. Calls app.creneaux_libres with no retention token,
 * per the 04-08 scope ruling: an instant a visitor is currently retaining
 * is not offered here, and that is correct — it becomes available again on
 * its own short lapse, and an administrator who needs it anyway can move
 * onto it once that happens.
 */
export function SelecteurCreneau({
  typeId,
  onChoisir,
}: {
  typeId: string;
  onChoisir: (creneau: Creneau) => void;
}) {
  const [statut, setStatut] = useState<StatutChargement>("chargement");
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [affichage, setAffichage] = useState<{ annee: number; mois: number } | null>(
    null,
  );
  const [jourSelectionne, setJourSelectionne] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;

    async function charger() {
      setStatut("chargement");
      setAffichage(null);
      setJourSelectionne(null);
      try {
        const supabase = createClient();
        const du = jourIsoParis(new Date());
        const au = jourIsoParis(
          new Date(Date.now() + HORIZON_JOURS * 24 * 60 * 60 * 1000),
        );
        const { data, error } = await supabase.rpc("creneaux_libres", {
          p_type_id: typeId,
          p_du: du,
          p_au: au,
        });
        if (annule) return;

        if (error || !data) {
          setStatut("erreur");
          return;
        }
        const parsed = creneauxRpcSchema.safeParse(data);
        if (!parsed.success) {
          setStatut("erreur");
          return;
        }
        const suivant = versCreneaux(parsed.data);
        setCreneaux(suivant);
        setStatut(suivant.length === 0 ? "vide" : "pret");

        const premier = premierJourPorteur(suivant);
        if (premier) {
          const [annee, mois] = premier.split("-").map(Number);
          setAffichage({ annee, mois: mois - 1 });
          setJourSelectionne(premier);
        }
      } catch {
        if (!annule) setStatut("erreur");
      }
    }

    void charger();
    return () => {
      annule = true;
    };
  }, [typeId]);

  if (statut === "chargement" || affichage === null) {
    return <BookerSkeleton />;
  }
  if (statut === "erreur") {
    return <Message variant="error">{admin.erreurs.erreurGenerique}</Message>;
  }

  const parJour = grouperParJour(creneaux);
  const porteurs = joursPorteurs(creneaux);
  const creneauxDuJour = jourSelectionne ? (parJour.get(jourSelectionne) ?? []) : [];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <CalendrierMois
        annee={affichage.annee}
        mois={affichage.mois}
        joursPorteurs={porteurs}
        jourSelectionne={jourSelectionne}
        onSelectJour={setJourSelectionne}
        onMoisPrecedent={() =>
          setAffichage((precedent) =>
            precedent
              ? precedent.mois === 0
                ? { annee: precedent.annee - 1, mois: 11 }
                : { annee: precedent.annee, mois: precedent.mois - 1 }
              : precedent,
          )
        }
        onMoisSuivant={() =>
          setAffichage((precedent) =>
            precedent
              ? precedent.mois === 11
                ? { annee: precedent.annee + 1, mois: 0 }
                : { annee: precedent.annee, mois: precedent.mois + 1 }
              : precedent,
          )
        }
      />
      <Card variant="outline">
        <CardContent>
          <ListeCreneaux
            jour={jourSelectionne}
            creneaux={creneauxDuJour}
            creneauChoisiDebut={null}
            onChoisirCreneau={onChoisir}
          />
        </CardContent>
      </Card>
    </div>
  );
}

type Panneau = "repos" | "deplacement" | "confirmationAnnulation";

/*
 * why (D-U2): cancel reuses the in-page two-step reveal
 * (src/components/compte/suppression-compte.tsx, mirrored in 04-06's
 * exceptions-editeur.tsx) — a Card variant="muted" trigger revealing a
 * nested Card variant="default" confirmation, rendered inline in the same
 * document flow, nothing separately mounted. Move opens the same instant
 * chooser directly (not a
 * destructive action, no two-step reveal needed) and PATCHes on pick.
 * Neither action is optimistic: only the database knows whether a target
 * instant is still free, so the row only updates after router.refresh()
 * re-reads the server component's own data.
 */
export function ReservationActions({ reservation }: { reservation: ReservationAdmin }) {
  const router = useRouter();
  const [panneau, setPanneau] = useState<Panneau>("repos");
  const [enEnvoi, setEnEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  function reinitialiser() {
    setPanneau("repos");
    setErreur(null);
  }

  async function deplacerVers(creneau: Creneau) {
    setEnEnvoi(true);
    setErreur(null);
    try {
      const reponse = await fetch(`/api/admin/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debut: creneau.debut.toISOString() }),
      });
      if (!reponse.ok) {
        const corps = (await reponse.json().catch(() => null)) as { erreur?: string } | null;
        const cle = corps?.erreur as keyof typeof admin.erreurs | undefined;
        setErreur((cle && admin.erreurs[cle]) ?? admin.erreurs.erreurGenerique);
        setEnEnvoi(false);
        return;
      }
      setEnEnvoi(false);
      setPanneau("repos");
      router.refresh();
    } catch {
      setErreur(admin.erreurs.erreurGenerique);
      setEnEnvoi(false);
    }
  }

  async function annuler() {
    setEnEnvoi(true);
    setErreur(null);
    try {
      const reponse = await fetch(`/api/admin/reservations/${reservation.id}`, {
        method: "DELETE",
      });
      if (!reponse.ok) {
        const corps = (await reponse.json().catch(() => null)) as { erreur?: string } | null;
        const cle = corps?.erreur as keyof typeof admin.erreurs | undefined;
        setErreur((cle && admin.erreurs[cle]) ?? admin.erreurs.erreurGenerique);
        setEnEnvoi(false);
        return;
      }
      setEnEnvoi(false);
      setPanneau("repos");
      router.refresh();
    } catch {
      setErreur(admin.erreurs.erreurGenerique);
      setEnEnvoi(false);
    }
  }

  const estAnnulee = reservation.statut === "annulee";

  if (panneau === "deplacement") {
    return (
      <Card variant="default" className="gap-3">
        <CardContent className="flex flex-col gap-3">
          <p className="font-medium text-foreground">
            {admin.reservations.actions.choisirNouveauCreneau}
          </p>
          {erreur ? <Message variant="error">{erreur}</Message> : null}
          <SelecteurCreneau typeId={reservation.type_id} onChoisir={deplacerVers} />
          <Button
            variant="outline"
            size="sm"
            className="h-11 self-start"
            disabled={enEnvoi}
            onClick={reinitialiser}
          >
            {common.actions.annuler}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (panneau === "confirmationAnnulation") {
    return (
      <Card variant="default" className="gap-3">
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="font-medium text-foreground">
              {admin.reservations.annulation.confirmationTitre}
            </p>
            <p className="text-sm text-muted-foreground">
              {admin.reservations.annulation.confirmationMessage}
            </p>
          </div>
          {erreur ? <Message variant="error">{erreur}</Message> : null}
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="h-11"
              data-loading={enEnvoi ? "true" : undefined}
              disabled={enEnvoi}
              onClick={annuler}
            >
              {admin.reservations.actions.confirmerAnnulation}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11"
              disabled={enEnvoi}
              onClick={reinitialiser}
            >
              {common.actions.annuler}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (estAnnulee) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-11"
        onClick={() => setPanneau("deplacement")}
      >
        {admin.reservations.actions.deplacer}
      </Button>
      <Card variant="muted" size="sm" className="flex-row items-center gap-0 p-0">
        <CardContent className="px-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-11"
            onClick={() => setPanneau("confirmationAnnulation")}
          >
            {admin.reservations.actions.annuler}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

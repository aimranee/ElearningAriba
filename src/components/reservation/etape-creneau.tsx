"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import agenda from "@/locales/fr/agenda.json";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state";
import { Message } from "@/components/ui/message";
import { createClient } from "@/lib/supabase/client";
import {
  type Creneau,
  creneauxRpcSchema,
  versCreneaux,
  jourIsoParis,
  grouperParJour,
  premierJourPorteur,
  joursPorteurs,
  lireCreneauChoisi,
  ecrireCreneauChoisi,
} from "@/lib/agenda/creneaux";
import { retenirCreneau } from "@/lib/agenda/retenir-creneau";
import { CalendrierMois } from "@/components/agenda/calendrier-mois";
import { ListeCreneaux } from "@/components/agenda/liste-creneaux";
import { BookerSkeleton } from "@/components/agenda/booker-skeleton";

const HORIZON_JOURS = 56; // D-13: 8-week booking horizon, same as /agenda

type Statut = "chargement" | "pret" | "vide" | "erreur";

type EtapeCreneauProps = {
  typeId: string;
  onCreneauRetenu: (info: { debut: string; jeton: string; expireLe: string }) => void;
};

/*
 * why (D-27, D-28, D-29): screen 2 — no session required, reuses the exact
 * plan 04-03 grid/list/skeleton components rather than a second
 * implementation, so D-29 (opens on the first slot-carrying day), the inert
 * non-carrying days and the drawn skeleton are inherited, not
 * re-implemented. Choosing or changing a slot re-retains it through
 * POST /api/creneaux/maintien with the existing token so the previous
 * retention is replaced rather than accumulated.
 */
export function EtapeCreneau({ typeId, onCreneauRetenu }: EtapeCreneauProps) {
  const [statut, setStatut] = useState<Statut>("chargement");
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [affichage, setAffichage] = useState<{ annee: number; mois: number } | null>(
    null,
  );
  const [jourSelectionne, setJourSelectionne] = useState<string | null>(null);
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const ouvertureInitialiseeRef = useRef(false);
  const jetonActifRef = useRef<string | null>(null);

  const chargerCreneaux = useCallback(
    async (jetonAGarder?: string | null) => {
      setStatut("chargement");
      setMessageErreur(null);
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
          ...(jetonAGarder ? { p_jeton: jetonAGarder } : {}),
        });

        if (error || !data) {
          setStatut("erreur");
          setMessageErreur(agenda.erreurs.erreurGenerique);
          return;
        }

        const parsed = creneauxRpcSchema.safeParse(data);
        if (!parsed.success) {
          setStatut("erreur");
          setMessageErreur(agenda.erreurs.erreurGenerique);
          return;
        }

        const suivant = versCreneaux(parsed.data);
        setCreneaux(suivant);
        setStatut(suivant.length === 0 ? "vide" : "pret");

        // D-29: opens on the first day carrying slots, never on an empty
        // month, and only on the first response that lands.
        if (!ouvertureInitialiseeRef.current && suivant.length > 0) {
          const premier = premierJourPorteur(suivant);
          if (premier) {
            const [annee, mois] = premier.split("-").map(Number);
            setAffichage({ annee, mois: mois - 1 });
            setJourSelectionne(premier);
            ouvertureInitialiseeRef.current = true;
          }
        }
      } catch {
        setStatut("erreur");
        setMessageErreur(agenda.erreurs.erreurGenerique);
      }
    },
    [typeId],
  );

  // Mount-time only: keep showing a previously retained slot for this same
  // type (the visitor may have arrived here via the D-28 sign-in return, or
  // simply changed their mind and came back), then trigger the first fetch.
  useEffect(() => {
    const stocke = lireCreneauChoisi();
    if (stocke && stocke.typeId === typeId && stocke.jeton) {
      jetonActifRef.current = stocke.jeton;
    }
    void chargerCreneaux(jetonActifRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onChoisirCreneau(creneau: Creneau) {
    setMessageErreur(null);
    const debutIso = creneau.debut.toISOString();
    const stocke = lireCreneauChoisi();
    const jetonExistant =
      stocke && stocke.typeId === typeId ? (stocke.jeton ?? undefined) : undefined;

    const resultat = await retenirCreneau({ typeId, debut: debutIso, jeton: jetonExistant });

    if (resultat.ok) {
      ecrireCreneauChoisi({
        typeId,
        debut: debutIso,
        jeton: resultat.jeton,
        expireLe: resultat.expireLe,
      });
      onCreneauRetenu({ debut: debutIso, jeton: resultat.jeton, expireLe: resultat.expireLe });
      return;
    }

    if (resultat.erreur === "creneauIndisponible") {
      setMessageErreur(agenda.erreurs.creneauIndisponible);
      await chargerCreneaux(null);
      return;
    }

    setMessageErreur(
      resultat.erreur ? agenda.erreurs[resultat.erreur] : agenda.erreurs.erreurGenerique,
    );
  }

  const parJour = grouperParJour(creneaux);
  const porteurs = joursPorteurs(creneaux);
  const creneauxDuJour = jourSelectionne ? parJour.get(jourSelectionne) ?? [] : [];
  const stockeActuel = lireCreneauChoisi();

  return (
    <div className="flex flex-col gap-4">
      {messageErreur ? <Message variant="error">{messageErreur}</Message> : null}

      {statut === "chargement" || affichage === null ? (
        <BookerSkeleton />
      ) : statut === "erreur" ? (
        <EmptyState tone="error">
          <EmptyStateTitle>{agenda.erreurs.erreurGenerique}</EmptyStateTitle>
        </EmptyState>
      ) : statut === "vide" ? (
        <EmptyState tone="waiting">
          <EmptyStateTitle>{agenda.aucunCreneau.titre}</EmptyStateTitle>
          <EmptyStateDescription>{agenda.aucunCreneau.message}</EmptyStateDescription>
        </EmptyState>
      ) : (
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
            <CardHeader />
            <CardContent>
              <ListeCreneaux
                jour={jourSelectionne}
                creneaux={creneauxDuJour}
                creneauChoisiDebut={
                  stockeActuel?.typeId === typeId ? stockeActuel.debut : null
                }
                onChoisirCreneau={onChoisirCreneau}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

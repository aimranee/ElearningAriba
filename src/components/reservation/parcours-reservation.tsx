"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import reservation from "@/locales/fr/reservation.json";
import { Message } from "@/components/ui/message";
import type { TypeRendezVous } from "@/lib/agenda/types-rendez-vous";
import {
  lireCreneauChoisi,
  effacerCreneauChoisi,
  effacerJetonCreneauChoisi,
} from "@/lib/agenda/creneaux";
import { EtapeType } from "@/components/reservation/etape-type";
import { EtapeCreneau } from "@/components/reservation/etape-creneau";
import { EtapeRecapitulatif } from "@/components/reservation/etape-recapitulatif";

type Etape = "type" | "creneau" | "recapitulatif";
type StatutCommit = "idle" | "submitting" | "error";

type CreneauEtat = { debut: string; jeton: string | null; expireLe: string | null };

const ETAPES_AFFICHAGE: Record<Etape, keyof typeof reservation.etapes> = {
  type: "typeRendezVous",
  creneau: "creneau",
  recapitulatif: "confirmation",
};
const ETAPES_ORDRE: Etape[] = ["type", "creneau", "recapitulatif"];

type ParcoursReservationProps = {
  types: TypeRendezVous[];
  estConnecte: boolean;
  lieu: string | null;
  /* why (#27): a type already chosen by the deep link — the flow starts one
     step in, on the slot step, with the type step still reachable. */
  typeInitial: string | null;
};

/*
 * why (D-28): the sign-in request lives on screen 3 and nowhere earlier —
 * screens 1 and 2 never read `estConnecte` and never redirect. This
 * component owns the commit fetch to POST /api/reservation and the mapping
 * of its outcome to a reservation.erreurs.* key; the screens themselves stay
 * presentational.
 */
export function ParcoursReservation({
  types,
  estConnecte,
  lieu,
  typeInitial,
}: ParcoursReservationProps) {
  const router = useRouter();
  const [etape, setEtape] = useState<Etape>(typeInitial ? "creneau" : "type");
  const [typeId, setTypeId] = useState<string | null>(typeInitial);
  const [creneau, setCreneau] = useState<CreneauEtat | null>(null);
  const [statutCommit, setStatutCommit] = useState<StatutCommit>("idle");
  const [erreurCommit, setErreurCommit] = useState<string | null>(null);
  // why: set immediately before a navigation that must NOT release the held
  // slot — the D-28 sign-in/sign-up detour and the post-commit redirect
  // (app.reserver_creneau already releases the token server-side on
  // success). Every other unmount is a genuine abandon and does release.
  const conserverAuDepartRef = useRef(false);

  // Mount-time only: consume a slot handoff written by /agenda's island, or
  // survive the D-28 sign-in detour — either way this does NOT clear the
  // stored key, since a screen-3 sign-in redirect still needs it on return.
  // why: sessionStorage is read only inside this effect, never during
  // render, for the same hydration-safety reason contact-form.tsx sets its
  // mount-time value in an effect (server render and first client render
  // must agree) — the react-compiler set-state-in-effect rule reads as
  // general anti-pattern guidance here, not as the textbook "derived state"
  // case it targets: there is no prop/state this value could be computed
  // from during render, only an external store React does not own.
  useEffect(() => {
    const stocke = lireCreneauChoisi();
    if (stocke) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setTypeId(stocke.typeId);
      setCreneau({ debut: stocke.debut, jeton: stocke.jeton, expireLe: stocke.expireLe });
      setEtape("recapitulatif");
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, []);

  // Release the held slot on genuine abandon — unmount (in-app navigation
  // away, e.g. the header nav) and beforeunload (tab close, best-effort —
  // keepalive required or the fetch is cancelled when the document goes
  // away). Neither releases when the ref above is set.
  useEffect(() => {
    function liberer() {
      const stocke = lireCreneauChoisi();
      if (!stocke?.jeton) return;
      void fetch("/api/creneaux/maintien", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jeton: stocke.jeton }),
        keepalive: true,
      });
    }
    window.addEventListener("beforeunload", liberer);
    return () => {
      window.removeEventListener("beforeunload", liberer);
      if (!conserverAuDepartRef.current) {
        liberer();
        effacerCreneauChoisi();
      }
    };
  }, []);

  const typeChoisi = types.find((t) => t.id === typeId) ?? null;
  const debutDate = creneau ? new Date(creneau.debut) : null;
  const expireLeDate = creneau?.expireLe ? new Date(creneau.expireLe) : null;

  function onChoisirType(id: string) {
    setErreurCommit(null);
    setTypeId(id);
    setEtape("creneau");
  }

  function onCreneauRetenu(info: { debut: string; jeton: string; expireLe: string }) {
    setErreurCommit(null);
    setCreneau(info);
    setEtape("recapitulatif");
  }

  function onDetourConnexion() {
    conserverAuDepartRef.current = true;
  }

  function onRetourCreneaux() {
    effacerJetonCreneauChoisi();
    setCreneau(null);
    setEtape("creneau");
  }

  /* why (#27): the type step must stay reachable once the deep link has
     skipped it — the step indicator's first entry becomes the way back
     while the slot step is showing. */
  function onRetourType() {
    effacerJetonCreneauChoisi();
    setErreurCommit(null);
    setCreneau(null);
    setTypeId(null);
    setEtape("type");
  }

  async function onValider() {
    if (!typeChoisi || !creneau) return;
    setStatutCommit("submitting");
    setErreurCommit(null);

    try {
      const reponse = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typeId: typeChoisi.id,
          debut: creneau.debut,
          ...(creneau.jeton ? { jeton: creneau.jeton } : {}),
        }),
      });
      const corps = (await reponse.json().catch(() => ({}))) as {
        reservationId?: string;
        erreur?: keyof typeof reservation.erreurs;
      };

      if (reponse.ok && corps.reservationId) {
        conserverAuDepartRef.current = true;
        effacerCreneauChoisi();
        router.push(`/reservation/confirmation?id=${corps.reservationId}`);
        return;
      }

      if (corps.erreur === "creneauIndisponible") {
        setErreurCommit(reservation.erreurs.creneauIndisponible);
        setStatutCommit("error");
        onRetourCreneaux();
        return;
      }

      setErreurCommit(
        corps.erreur ? reservation.erreurs[corps.erreur] : reservation.erreurs.erreurGenerique,
      );
      setStatutCommit("error");
    } catch {
      setErreurCommit(reservation.erreurs.commitEchec);
      setStatutCommit("error");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <ol className="flex flex-wrap gap-2 text-sm">
        {ETAPES_ORDRE.map((cle) => {
          const active = cle === etape;
          if (cle === "type" && etape === "creneau") {
            return (
              <li key={cle}>
                <button
                  type="button"
                  data-slot="etape-retour-type"
                  onClick={onRetourType}
                  className="text-muted-foreground rounded-lg px-2.5 py-1 underline-offset-4 outline-none hover:text-primary hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {reservation.etapes[ETAPES_AFFICHAGE[cle]]}
                </button>
              </li>
            );
          }
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
                {reservation.etapes[ETAPES_AFFICHAGE[cle]]}
              </span>
            </li>
          );
        })}
      </ol>

      {erreurCommit ? <Message variant="error">{erreurCommit}</Message> : null}

      {etape === "type" ? <EtapeType types={types} onChoisirType={onChoisirType} /> : null}

      {etape === "creneau" && typeId ? (
        <EtapeCreneau typeId={typeId} onCreneauRetenu={onCreneauRetenu} />
      ) : null}

      {etape === "recapitulatif" && typeChoisi && debutDate ? (
        <EtapeRecapitulatif
          type={typeChoisi}
          debut={debutDate}
          lieu={lieu}
          estConnecte={estConnecte}
          expireLe={expireLeDate}
          onChoisirAutreHoraire={onRetourCreneaux}
          statutCommit={statutCommit}
          onValider={onValider}
          onDetourConnexion={onDetourConnexion}
        />
      ) : null}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Message } from "@/components/ui/message";
import { createClient } from "@/lib/supabase/client";
import type { TypeRendezVous } from "@/lib/agenda/types-rendez-vous";
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
  effacerJetonCreneauChoisi,
} from "@/lib/agenda/creneaux";
import { CalendrierMois, type CalendrierMoisTexte } from "@/components/agenda/calendrier-mois";
import { ListeCreneaux, type ListeCreneauxTexte } from "@/components/agenda/liste-creneaux";
import type { Locale } from "@/lib/i18n/locale";
import type { Messages } from "@/lib/i18n/messages";
import { BookerSkeleton } from "@/components/agenda/booker-skeleton";

const HORIZON_JOURS = 56; // D-13: 8-week booking horizon

type Statut = "chargement" | "pret" | "vide" | "erreur";

/* why (#24): the booker's text, in the page's language, handed down by the
   server page (src/components/agenda/page-agenda.tsx) — this island imports
   no copy of its own. */
export type AgendaBookerTexte = CalendrierMoisTexte &
  ListeCreneauxTexte &
  Pick<Messages<"agenda">, "titre" | "erreurs">;

type AgendaBookerProps = {
  locale: Locale;
  texte: AgendaBookerTexte;
  types: TypeRendezVous[];
};

/*
 * why (D-06, D-27, D-28): the client island. /agenda stays static because
 * every read here happens after hydration, through the browser anon client
 * (src/lib/supabase/client.ts) — the cookie-free server-only anonymous
 * client used elsewhere for public reads carries `import "server-only"`
 * and cannot be used from a "use client" component, despite D-06's naming
 * of it; the intent (anonymous browser read, static route) is unchanged.
 */
export function AgendaBooker({ locale, texte, types }: AgendaBookerProps) {
  const router = useRouter();
  const [typeId, setTypeId] = useState<string>(types[0]?.id ?? "");
  const [statut, setStatut] = useState<Statut>("chargement");
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [affichage, setAffichage] = useState<{ annee: number; mois: number } | null>(
    null,
  );
  const [jourSelectionne, setJourSelectionne] = useState<string | null>(null);
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const jetonActifRef = useRef<string | null>(null);
  // why: D-29 opens on the first day carrying slots only once, on the
  // first response that lands — a ref (not state) tracks that so the
  // setAffichage/setJourSelectionne calls below stay inside the async
  // fetch callback rather than a second effect reacting to state changes,
  // which eslint-plugin-react-hooks flags as a cascading-render smell.
  const ouvertureInitialiseeRef = useRef(false);
  // why: an unmount cleanup releases an abandoned hold — but the same
  // unmount fires when this island navigates to /reservation right after
  // successfully retaining a slot, and releasing it there would defeat the
  // retention it just wrote. This ref is set immediately before that
  // deliberate navigation so the cleanup below can tell "abandoned the
  // page" apart from "proceeding with the held slot".
  const naviguantVersReservationRef = useRef(false);

  const chargerCreneaux = useCallback(
    async (typeCourant: string, jetonAGarder?: string | null) => {
      setStatut("chargement");
      setMessageErreur(null);
      try {
        const supabase = createClient();
        const du = jourIsoParis(new Date());
        const au = jourIsoParis(
          new Date(Date.now() + HORIZON_JOURS * 24 * 60 * 60 * 1000),
        );
        const { data, error } = await supabase.rpc("creneaux_libres", {
          p_type_id: typeCourant,
          p_du: du,
          p_au: au,
          ...(jetonAGarder ? { p_jeton: jetonAGarder } : {}),
        });

        if (error || !data) {
          setStatut("erreur");
          setMessageErreur(texte.erreurs.erreurGenerique);
          return;
        }

        const parsed = creneauxRpcSchema.safeParse(data);
        if (!parsed.success) {
          setStatut("erreur");
          setMessageErreur(texte.erreurs.erreurGenerique);
          return;
        }

        const suivant = versCreneaux(parsed.data);
        setCreneaux(suivant);
        setStatut(suivant.length === 0 ? "vide" : "pret");

        // D-29: the calendar opens on the first day carrying slots, never
        // on an empty/current month, and only on the first response.
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
        setMessageErreur(texte.erreurs.erreurGenerique);
      }
    },
    [texte.erreurs.erreurGenerique],
  );

  // Mount-time only: read a previously stored retention so the visitor
  // keeps seeing their own held slot, then trigger the first fetch.
  useEffect(() => {
    const stocke = lireCreneauChoisi();
    if (stocke && stocke.typeId === typeId && stocke.jeton) {
      jetonActifRef.current = stocke.jeton;
    }
    void chargerCreneaux(typeId, jetonActifRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Release the held slot on abandon: unmount (in-app navigation away from
  // /agenda, the reliable path) and beforeunload (tab close, best-effort —
  // keepalive required or the fetch is cancelled when the document goes
  // away). Neither fires a release when the island leaves because it is
  // navigating to /reservation with the slot it just retained — and since
  // #18 put /agenda and /reservation under different root layouts, that
  // navigation is a full page load, so beforeunload needs the guard too.
  useEffect(() => {
    function liberer() {
      if (naviguantVersReservationRef.current) return;
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
      liberer();
    };
  }, []);

  function onChangerType(nouveauTypeId: string) {
    if (nouveauTypeId === typeId) return;
    setTypeId(nouveauTypeId);
    setAffichage(null);
    setJourSelectionne(null);
    jetonActifRef.current = null;
    ouvertureInitialiseeRef.current = false;
    void chargerCreneaux(nouveauTypeId, null);
  }

  async function onChoisirCreneau(creneau: Creneau) {
    setMessageErreur(null);
    const debutIso = creneau.debut.toISOString();
    const stocke = lireCreneauChoisi();
    const jetonExistant = stocke?.jeton ?? undefined;

    const tenter = async (jeton?: string) => {
      const reponse = await fetch("/api/creneaux/maintien", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typeId, debut: debutIso, ...(jeton ? { jeton } : {}) }),
      });
      const corps = (await reponse.json().catch(() => ({}))) as {
        jeton?: string;
        expireLe?: string;
        erreur?: keyof AgendaBookerTexte["erreurs"];
      };
      return { ok: reponse.ok, corps };
    };

    let { ok, corps } = await tenter(jetonExistant);

    // Retry once, never in a loop: a stored token gone stale (expiry, a
    // server restart) answers 'jeton_inconnu' — drop it and re-POST once
    // as a mint. Only if that second attempt also fails does a message
    // reach the visitor.
    if (!ok && corps.erreur === "jetonInconnu") {
      effacerJetonCreneauChoisi();
      ({ ok, corps } = await tenter(undefined));
    }

    if (ok && corps.jeton && corps.expireLe) {
      ecrireCreneauChoisi({
        typeId,
        debut: debutIso,
        jeton: corps.jeton,
        expireLe: corps.expireLe,
      });
      // D-28: no sign-in prompt here — identification happens at screen 3.
      naviguantVersReservationRef.current = true;
      router.push("/reservation");
      return;
    }

    if (corps.erreur === "creneauIndisponible") {
      setMessageErreur(texte.erreurs.creneauIndisponible);
      await chargerCreneaux(typeId, null);
      return;
    }

    setMessageErreur(
      corps.erreur ? texte.erreurs[corps.erreur] : texte.erreurs.erreurGenerique,
    );
  }

  const parJour = grouperParJour(creneaux);
  const porteurs = joursPorteurs(creneaux);
  const creneauxDuJour = jourSelectionne ? parJour.get(jourSelectionne) ?? [] : [];
  const stockeActuel = lireCreneauChoisi();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={texte.titre}>
        {types.map((type) => (
          <Button
            key={type.id}
            type="button"
            variant={type.id === typeId ? "default" : "outline"}
            size="sm"
            className="h-11"
            role="tab"
            aria-selected={type.id === typeId}
            onClick={() => onChangerType(type.id)}
          >
            {type.libelle}
          </Button>
        ))}
      </div>

      {messageErreur ? <Message variant="error">{messageErreur}</Message> : null}

      {statut === "chargement" || affichage === null ? (
        <BookerSkeleton />
      ) : statut === "erreur" ? (
        <EmptyState tone="error">
          <EmptyStateTitle>{texte.erreurs.erreurGenerique}</EmptyStateTitle>
        </EmptyState>
      ) : statut === "vide" ? (
        <EmptyState tone="waiting">
          <EmptyStateTitle>{texte.aucunCreneau.titre}</EmptyStateTitle>
          <EmptyStateDescription>{texte.aucunCreneau.message}</EmptyStateDescription>
          <EmptyStateAction>
            <Button variant="secondary">{texte.aucunCreneau.action}</Button>
          </EmptyStateAction>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CalendrierMois
            locale={locale}
            texte={texte}
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
                locale={locale}
                texte={texte}
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

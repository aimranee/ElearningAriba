"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel, FieldControl, FieldError } from "@/components/ui/field";
import type { DisponibiliteHebdomadaire } from "@/lib/agenda/admin-queries";
import admin from "@/locales/fr/admin.json";

const JOURS = [1, 2, 3, 4, 5, 6, 7] as const;

type JourLabel = (typeof JOURS)[number];

/** "09:00:00" (Postgres time) -> "09:00" (the HH:MM the field/API exchange). */
function versHeureCourte(heure: string): string {
  return heure.slice(0, 5);
}

type EtatFormulaire = { heureDebut: string; heureFin: string; erreur: string | null; enEnvoi: boolean };

const FORMULAIRE_VIDE: EtatFormulaire = { heureDebut: "", heureFin: "", erreur: null, enEnvoi: false };

/*
 * why (AGD-07, D-04): seven weekday rows, each carrying zero or more
 * continuous ranges — this editor never asks for a slot length; the split
 * into bookable instants happens at read time in app.creneaux_libres from
 * the chosen appointment type's duration and buffer. useState status
 * machine idiom (contact-form.tsx), no TanStack Query — zero-dependency
 * budget this phase.
 */
export function HorairesEditeur({
  disponibilites,
}: {
  disponibilites: DisponibiliteHebdomadaire[];
}) {
  const [plages, setPlages] = useState(disponibilites);
  const [enAttente, setEnAttente] = useState<Record<string, boolean>>({});
  const [ouvertPour, setOuvertPour] = useState<JourLabel | null>(null);
  const [formulaire, setFormulaire] = useState<EtatFormulaire>(FORMULAIRE_VIDE);

  async function basculerActif(plage: DisponibiliteHebdomadaire) {
    setEnAttente((prev) => ({ ...prev, [plage.id]: true }));
    try {
      const response = await fetch("/api/admin/disponibilites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: plage.id,
          jourSemaine: plage.jour_semaine,
          heureDebut: versHeureCourte(plage.heure_debut),
          heureFin: versHeureCourte(plage.heure_fin),
          actif: !plage.actif,
        }),
      });
      if (response.ok) {
        setPlages((prev) =>
          prev.map((p) => (p.id === plage.id ? { ...p, actif: !p.actif } : p)),
        );
      }
    } finally {
      setEnAttente((prev) => ({ ...prev, [plage.id]: false }));
    }
  }

  async function ajouterPlage(jour: JourLabel) {
    if (!formulaire.heureDebut || !formulaire.heureFin) {
      setFormulaire((prev) => ({ ...prev, erreur: admin.erreurs.champsInvalides }));
      return;
    }
    setFormulaire((prev) => ({ ...prev, enEnvoi: true, erreur: null }));
    try {
      const response = await fetch("/api/admin/disponibilites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jourSemaine: jour,
          heureDebut: formulaire.heureDebut,
          heureFin: formulaire.heureFin,
          actif: true,
        }),
      });
      if (!response.ok) {
        const corps = (await response.json().catch(() => null)) as { erreur?: string } | null;
        const cle = corps?.erreur as keyof typeof admin.erreurs | undefined;
        setFormulaire((prev) => ({
          ...prev,
          enEnvoi: false,
          erreur: (cle && admin.erreurs[cle]) ?? admin.horaires.erreur,
        }));
        return;
      }
      const { id } = (await response.json()) as { id: string };
      setPlages((prev) => [
        ...prev,
        {
          id,
          jour_semaine: jour,
          heure_debut: `${formulaire.heureDebut}:00`,
          heure_fin: `${formulaire.heureFin}:00`,
          actif: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      setFormulaire(FORMULAIRE_VIDE);
      setOuvertPour(null);
    } catch {
      setFormulaire((prev) => ({ ...prev, enEnvoi: false, erreur: admin.horaires.erreur }));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{admin.horaires.titre}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">{admin.horaires.intro}</p>

        {JOURS.map((jour) => {
          const plagesDuJour = plages
            .filter((p) => p.jour_semaine === jour)
            .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
          const label = admin.horaires.jours[String(jour) as keyof typeof admin.horaires.jours];

          return (
            <div key={jour} className="flex flex-col gap-2 border-b border-border pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-heading text-base font-semibold text-foreground">{label}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11"
                  onClick={() => {
                    setOuvertPour(ouvertPour === jour ? null : jour);
                    setFormulaire(FORMULAIRE_VIDE);
                  }}
                >
                  {admin.horaires.actions.ajouterPlage}
                </Button>
              </div>

              {plagesDuJour.length === 0 ? (
                <p className="text-muted-foreground text-sm">{admin.horaires.aucunePlage}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {plagesDuJour.map((plage) => (
                    <li key={plage.id} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm text-foreground">
                        {versHeureCourte(plage.heure_debut)} – {versHeureCourte(plage.heure_fin)}
                        {!plage.actif ? (
                          <Badge variant="muted">{admin.legende.bloque}</Badge>
                        ) : null}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-11"
                        data-loading={enAttente[plage.id] ? "true" : undefined}
                        disabled={enAttente[plage.id]}
                        onClick={() => basculerActif(plage)}
                      >
                        {plage.actif
                          ? admin.horaires.actions.desactiver
                          : admin.horaires.actions.reactiver}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              {ouvertPour === jour ? (
                <div className="flex flex-col gap-3 rounded-lg bg-muted p-3">
                  <div className="flex flex-wrap gap-3">
                    <Field className="min-w-32">
                      <FieldLabel htmlFor={`horaire-debut-${jour}`}>
                        {admin.horaires.champs.heureDebut}
                      </FieldLabel>
                      <FieldControl
                        id={`horaire-debut-${jour}`}
                        type="time"
                        className="text-base"
                        value={formulaire.heureDebut}
                        onChange={(event) =>
                          setFormulaire((prev) => ({ ...prev, heureDebut: event.target.value }))
                        }
                      />
                    </Field>
                    <Field className="min-w-32">
                      <FieldLabel htmlFor={`horaire-fin-${jour}`}>
                        {admin.horaires.champs.heureFin}
                      </FieldLabel>
                      <FieldControl
                        id={`horaire-fin-${jour}`}
                        type="time"
                        className="text-base"
                        value={formulaire.heureFin}
                        onChange={(event) =>
                          setFormulaire((prev) => ({ ...prev, heureFin: event.target.value }))
                        }
                      />
                    </Field>
                  </div>
                  {formulaire.erreur ? <FieldError>{formulaire.erreur}</FieldError> : null}
                  <Button
                    className="h-11 self-start"
                    data-loading={formulaire.enEnvoi ? "true" : undefined}
                    disabled={formulaire.enEnvoi}
                    onClick={() => ajouterPlage(jour)}
                  >
                    {admin.horaires.actions.enregistrer}
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

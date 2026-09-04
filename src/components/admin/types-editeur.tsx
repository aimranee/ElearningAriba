"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel, FieldControl, FieldError } from "@/components/ui/field";
import { formatCurrency } from "@/lib/i18n/fr";
import type { TypeRendezVousRow } from "@/lib/agenda/admin-queries";
import admin from "@/locales/fr/admin.json";

type Etat = "repos" | "envoi" | "succes" | "erreur";

type Formulaire = {
  libelle: string;
  dureeMinutes: string;
  tamponMinutes: string;
  prixEuros: string;
};

function versFormulaire(type: TypeRendezVousRow): Formulaire {
  return {
    libelle: type.libelle,
    dureeMinutes: String(type.duree_minutes),
    tamponMinutes: String(type.tampon_minutes),
    prixEuros: (type.prix_centimes / 100).toFixed(2),
  };
}

/**
 * The one place the price crosses between the store's centimes and the
 * trainer's euros — a second conversion elsewhere is how a price ends up a
 * hundred times too large. A value with more than two decimals is refused
 * here, at the boundary, rather than silently rounded.
 */
function centimesDepuisEuros(valeurEuros: string): number | null {
  const valeur = valeurEuros.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(valeur)) {
    return null;
  }
  return Math.round(Number.parseFloat(valeur) * 100);
}

type ErreurCle = keyof typeof admin.erreurs;

function resoudreErreur(cle: string | undefined): string {
  if (cle && cle in admin.erreurs) {
    return admin.erreurs[cle as ErreurCle];
  }
  return admin.typesRendezVous.erreur;
}

function PanneauType({ type }: { type: TypeRendezVousRow }) {
  const [formulaire, setFormulaire] = useState<Formulaire>(() => versFormulaire(type));
  const [etat, setEtat] = useState<Etat>("repos");
  const [erreur, setErreur] = useState<string | null>(null);

  async function enregistrer() {
    const dureeMinutes = Number.parseInt(formulaire.dureeMinutes, 10);
    const tamponMinutes = Number.parseInt(formulaire.tamponMinutes, 10);
    const prixCentimes = centimesDepuisEuros(formulaire.prixEuros);

    if (
      formulaire.libelle.trim().length === 0 ||
      !Number.isInteger(dureeMinutes) ||
      dureeMinutes <= 0 ||
      !Number.isInteger(tamponMinutes) ||
      tamponMinutes < 0 ||
      prixCentimes === null
    ) {
      setEtat("erreur");
      setErreur(admin.erreurs.champsInvalides);
      return;
    }

    setEtat("envoi");
    setErreur(null);
    try {
      const response = await fetch("/api/admin/types-de-rendez-vous", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: type.id,
          libelle: formulaire.libelle.trim(),
          dureeMinutes,
          tamponMinutes,
          prixCentimes,
        }),
      });

      if (!response.ok) {
        const corps = (await response.json().catch(() => null)) as { erreur?: string } | null;
        setEtat("erreur");
        setErreur(resoudreErreur(corps?.erreur));
        return;
      }

      setEtat("succes");
    } catch {
      setEtat("erreur");
      setErreur(admin.typesRendezVous.erreur);
    }
  }

  const enEnvoi = etat === "envoi";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{type.libelle}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          {formatCurrency(type.prix_centimes / 100)}
        </p>

        <div className="flex flex-col gap-3">
          <Field>
            <FieldLabel htmlFor={`type-libelle-${type.id}`}>
              {admin.typesRendezVous.champs.libelle}
            </FieldLabel>
            <FieldControl
              id={`type-libelle-${type.id}`}
              type="text"
              className="h-11 text-base"
              value={formulaire.libelle}
              onChange={(event) =>
                setFormulaire((prev) => ({ ...prev, libelle: event.target.value }))
              }
            />
          </Field>

          <div className="flex flex-wrap gap-3">
            <Field className="min-w-32 flex-1">
              <FieldLabel htmlFor={`type-duree-${type.id}`}>
                {admin.typesRendezVous.champs.dureeMinutes}
              </FieldLabel>
              <FieldControl
                id={`type-duree-${type.id}`}
                type="number"
                min={1}
                step={1}
                className="h-11 text-base"
                value={formulaire.dureeMinutes}
                onChange={(event) =>
                  setFormulaire((prev) => ({ ...prev, dureeMinutes: event.target.value }))
                }
              />
            </Field>
            <Field className="min-w-32 flex-1">
              <FieldLabel htmlFor={`type-tampon-${type.id}`}>
                {admin.typesRendezVous.champs.tamponMinutes}
              </FieldLabel>
              <FieldControl
                id={`type-tampon-${type.id}`}
                type="number"
                min={0}
                step={1}
                className="h-11 text-base"
                value={formulaire.tamponMinutes}
                onChange={(event) =>
                  setFormulaire((prev) => ({ ...prev, tamponMinutes: event.target.value }))
                }
              />
            </Field>
            <Field className="min-w-32 flex-1">
              <FieldLabel htmlFor={`type-prix-${type.id}`}>
                {admin.typesRendezVous.champs.prix}
              </FieldLabel>
              <FieldControl
                id={`type-prix-${type.id}`}
                type="text"
                inputMode="decimal"
                className="h-11 text-base"
                value={formulaire.prixEuros}
                onChange={(event) =>
                  setFormulaire((prev) => ({ ...prev, prixEuros: event.target.value }))
                }
              />
            </Field>
          </div>

          {etat === "erreur" && erreur ? <FieldError>{erreur}</FieldError> : null}
          {etat === "succes" ? (
            <p className="text-success text-sm">{admin.typesRendezVous.succes}</p>
          ) : null}
        </div>

        <p className="text-muted-foreground text-sm">{admin.typesRendezVous.consequence}</p>

        <Button
          className="h-11 self-start"
          data-loading={enEnvoi ? "true" : undefined}
          disabled={enEnvoi}
          onClick={enregistrer}
        >
          {admin.typesRendezVous.actions.enregistrer}
        </Button>
      </CardContent>
    </Card>
  );
}

/*
 * why (AGD-03): one editable panel per seeded appointment type, four fields
 * each, and nothing else. No create control, no delete control, no
 * visibility toggle, no display-order control: the requirement names four
 * attributes, this screen edits exactly those four. useState status-machine
 * idiom (contact-form.tsx / horaires-editeur.tsx), no TanStack Query, no
 * optimistic update -- the value that matters is the one the database
 * accepted, the same reasoning that already governs a booking write.
 */
export function TypesEditeur({ types }: { types: TypeRendezVousRow[] }) {
  return (
    <div className="flex flex-col gap-4">
      {types.map((type) => (
        <PanneauType key={type.id} type={type} />
      ))}
    </div>
  );
}

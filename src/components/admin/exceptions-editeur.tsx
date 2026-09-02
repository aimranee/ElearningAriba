"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldControl, FieldError } from "@/components/ui/field";
import { Message } from "@/components/ui/message";
import type { ExceptionAgenda } from "@/lib/agenda/admin-queries";
import * as i18n from "@/lib/i18n/fr";
import admin from "@/locales/fr/admin.json";
import common from "@/locales/fr/common.json";

type Motif = "blocage" | "ouverture";

type EtatNouvelle = {
  jour: string;
  journeeEntiere: boolean;
  heureDebut: string;
  heureFin: string;
  motif: Motif;
  libelle: string;
  erreur: string | null;
  enEnvoi: boolean;
};

const NOUVELLE_VIDE: EtatNouvelle = {
  jour: "",
  journeeEntiere: true,
  heureDebut: "",
  heureFin: "",
  motif: "blocage",
  libelle: "",
  erreur: null,
  enEnvoi: false,
};

function versHeureCourte(heure: string): string {
  return heure.slice(0, 5);
}

/*
 * why (D-U2): deletion reuses the in-page two-step reveal
 * (src/components/compte/suppression-compte.tsx) — Card variant="muted"
 * trigger, nested Card variant="default" confirmation, rendered inline in
 * the same document flow, nothing separately mounted. This component owns
 * its own two-step state, keyed to the one row it belongs to.
 */
function LigneException({
  exception,
  onSupprimee,
}: {
  exception: ExceptionAgenda;
  onSupprimee: (id: string) => void;
}) {
  const [confirmation, setConfirmation] = useState(false);
  const [enEnvoi, setEnEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function supprimer() {
    setEnEnvoi(true);
    setErreur(null);
    try {
      const response = await fetch("/api/admin/exceptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: exception.id }),
      });
      if (!response.ok) {
        setErreur(admin.exceptions.erreurSuppression);
        setEnEnvoi(false);
        return;
      }
      onSupprimee(exception.id);
    } catch {
      setErreur(admin.exceptions.erreurSuppression);
      setEnEnvoi(false);
    }
  }

  const heures =
    exception.heure_debut && exception.heure_fin
      ? `${versHeureCourte(exception.heure_debut)} – ${versHeureCourte(exception.heure_fin)}`
      : admin.exceptions.champs.journeeEntiere;

  if (confirmation) {
    return (
      <Card variant="default" className="gap-3">
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="font-medium text-foreground">{admin.exceptions.suppression.titre}</p>
            <p className="text-sm text-muted-foreground">{admin.exceptions.suppression.message}</p>
          </div>
          {erreur ? <Message variant="error">{erreur}</Message> : null}
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="h-11"
              data-loading={enEnvoi ? "true" : undefined}
              disabled={enEnvoi}
              onClick={supprimer}
            >
              {admin.exceptions.actions.confirmerSuppression}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11"
              disabled={enEnvoi}
              onClick={() => setConfirmation(false)}
            >
              {common.actions.annuler}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="muted" size="sm" className="flex-row items-center justify-between">
      <CardContent className="flex flex-1 items-center justify-between gap-2 px-0">
        <span className="flex items-center gap-2 text-sm text-foreground">
          {i18n.formatDateAvecJour(new Date(`${exception.jour}T00:00:00Z`))} · {heures}
          <Badge variant={exception.motif === "ouverture" ? "success" : "muted"}>
            {exception.motif === "ouverture"
              ? admin.exceptions.actions.ouvrirPlage
              : admin.legende.bloque}
          </Badge>
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-11"
          onClick={() => setConfirmation(true)}
        >
          {admin.exceptions.actions.supprimer}
        </Button>
      </CardContent>
    </Card>
  );
}

/*
 * why (AGD-07): blocks a whole day, a partial range, or opens an extra
 * range outside the weekly rules — a `blocage` row is ouvert=false, an
 * `ouverture` row is ouvert=true, both null hours meaning the whole day
 * (the table's own convention, mirrored in src/lib/validation/agenda-admin.ts).
 */
export function ExceptionsEditeur({ exceptions }: { exceptions: ExceptionAgenda[] }) {
  const [liste, setListe] = useState(exceptions);
  const [nouvelle, setNouvelle] = useState<EtatNouvelle>(NOUVELLE_VIDE);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);

  async function enregistrer() {
    if (!nouvelle.jour || (!nouvelle.journeeEntiere && (!nouvelle.heureDebut || !nouvelle.heureFin))) {
      setNouvelle((prev) => ({ ...prev, erreur: admin.erreurs.champsInvalides }));
      return;
    }
    setNouvelle((prev) => ({ ...prev, enEnvoi: true, erreur: null }));

    const body = {
      jour: nouvelle.jour,
      ouvert: nouvelle.motif === "ouverture",
      motif: nouvelle.motif,
      libelle: nouvelle.libelle || undefined,
      heureDebut: nouvelle.journeeEntiere ? undefined : nouvelle.heureDebut,
      heureFin: nouvelle.journeeEntiere ? undefined : nouvelle.heureFin,
    };

    try {
      const response = await fetch("/api/admin/exceptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const corps = (await response.json().catch(() => null)) as { erreur?: string } | null;
        const cle = corps?.erreur as keyof typeof admin.erreurs | undefined;
        setNouvelle((prev) => ({
          ...prev,
          enEnvoi: false,
          erreur: (cle && admin.erreurs[cle]) ?? admin.exceptions.erreur,
        }));
        return;
      }
      const { id } = (await response.json()) as { id: string };
      setListe((prev) => [
        ...prev,
        {
          id,
          jour: nouvelle.jour,
          ouvert: body.ouvert,
          motif: nouvelle.motif,
          libelle: nouvelle.libelle || null,
          heure_debut: body.heureDebut ? `${body.heureDebut}:00` : null,
          heure_fin: body.heureFin ? `${body.heureFin}:00` : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      setNouvelle(NOUVELLE_VIDE);
      setFormulaireOuvert(false);
    } catch {
      setNouvelle((prev) => ({ ...prev, enEnvoi: false, erreur: admin.exceptions.erreur }));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{admin.exceptions.titre}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">{admin.exceptions.intro}</p>
        <Message variant="info">{admin.exceptions.avertissement}</Message>

        {liste.length === 0 ? (
          <p className="text-muted-foreground text-sm">{admin.exceptions.aucuneException}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {liste.map((exception) => (
              <li key={exception.id}>
                <LigneException
                  exception={exception}
                  onSupprimee={(id) => setListe((prev) => prev.filter((e) => e.id !== id))}
                />
              </li>
            ))}
          </ul>
        )}

        {formulaireOuvert ? (
          <div className="flex flex-col gap-3 rounded-lg bg-muted p-3">
            <div className="flex flex-wrap gap-3">
              <Field className="min-w-40">
                <FieldLabel htmlFor="exception-jour">{admin.exceptions.champs.jour}</FieldLabel>
                <FieldControl
                  id="exception-jour"
                  type="date"
                  className="text-base"
                  value={nouvelle.jour}
                  onChange={(event) => setNouvelle((prev) => ({ ...prev, jour: event.target.value }))}
                />
              </Field>

              <Field className="min-w-40">
                <FieldLabel htmlFor="exception-motif">Motif</FieldLabel>
                <FieldControl
                  id="exception-motif"
                  className="text-base"
                  value={nouvelle.motif}
                  onChange={(event) =>
                    setNouvelle((prev) => ({ ...prev, motif: event.target.value as Motif }))
                  }
                  render={
                    <select>
                      <option value="blocage">{admin.legende.bloque}</option>
                      <option value="ouverture">{admin.exceptions.actions.ouvrirPlage}</option>
                    </select>
                  }
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox
                checked={nouvelle.journeeEntiere}
                onCheckedChange={(value) =>
                  setNouvelle((prev) => ({ ...prev, journeeEntiere: value === true }))
                }
              />
              {admin.exceptions.champs.journeeEntiere}
            </label>

            {!nouvelle.journeeEntiere ? (
              <div className="flex flex-wrap gap-3">
                <Field className="min-w-32">
                  <FieldLabel htmlFor="exception-heure-debut">
                    {admin.exceptions.champs.heureDebut}
                  </FieldLabel>
                  <FieldControl
                    id="exception-heure-debut"
                    type="time"
                    className="text-base"
                    value={nouvelle.heureDebut}
                    onChange={(event) =>
                      setNouvelle((prev) => ({ ...prev, heureDebut: event.target.value }))
                    }
                  />
                </Field>
                <Field className="min-w-32">
                  <FieldLabel htmlFor="exception-heure-fin">
                    {admin.exceptions.champs.heureFin}
                  </FieldLabel>
                  <FieldControl
                    id="exception-heure-fin"
                    type="time"
                    className="text-base"
                    value={nouvelle.heureFin}
                    onChange={(event) =>
                      setNouvelle((prev) => ({ ...prev, heureFin: event.target.value }))
                    }
                  />
                </Field>
              </div>
            ) : null}

            <Field>
              <FieldLabel htmlFor="exception-libelle">{admin.exceptions.champs.libelle}</FieldLabel>
              <FieldControl
                id="exception-libelle"
                className="text-base"
                value={nouvelle.libelle}
                onChange={(event) => setNouvelle((prev) => ({ ...prev, libelle: event.target.value }))}
              />
            </Field>

            {nouvelle.erreur ? <FieldError>{nouvelle.erreur}</FieldError> : null}

            <Button
              className="h-11 self-start"
              data-loading={nouvelle.enEnvoi ? "true" : undefined}
              disabled={nouvelle.enEnvoi}
              onClick={enregistrer}
            >
              {admin.exceptions.actions.enregistrer}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-11"
              onClick={() => {
                setNouvelle({ ...NOUVELLE_VIDE, motif: "blocage", journeeEntiere: true });
                setFormulaireOuvert(true);
              }}
            >
              {admin.exceptions.actions.bloquerJournee}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11"
              onClick={() => {
                setNouvelle({ ...NOUVELLE_VIDE, motif: "blocage", journeeEntiere: false });
                setFormulaireOuvert(true);
              }}
            >
              {admin.exceptions.actions.bloquerPlage}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11"
              onClick={() => {
                setNouvelle({ ...NOUVELLE_VIDE, motif: "ouverture", journeeEntiere: false });
                setFormulaireOuvert(true);
              }}
            >
              {admin.exceptions.actions.ouvrirPlage}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

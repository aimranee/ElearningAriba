"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel, FieldControl, FieldError } from "@/components/ui/field";
import { jourIsoParis } from "@/lib/agenda/creneaux";
import admin from "@/locales/fr/admin.json";

const FENETRE_PASSEE_JOURS = 30;
const FENETRE_FUTURE_JOURS = 60;

function joursDecales(jours: number): string {
  return jourIsoParis(new Date(Date.now() + jours * 24 * 60 * 60 * 1000));
}

/*
 * why (D-19): the six exported columns are named in the screen's own copy,
 * before the export runs, not only in a changelog — colonnesAnnonce renders
 * unconditionally, above the button, never behind a click. The CSV itself
 * is never assembled here: this fetches the server's bytes and saves them
 * as a blob, it does not build the file client-side (T-04-53 stays a
 * server-only mitigation).
 */
export function ExportPanel() {
  const [du, setDu] = useState(() => joursDecales(-FENETRE_PASSEE_JOURS));
  const [au, setAu] = useState(() => joursDecales(FENETRE_FUTURE_JOURS));
  const [enEnvoi, setEnEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function exporter() {
    setEnEnvoi(true);
    setErreur(null);
    try {
      const url = `/api/admin/reservations/export?du=${encodeURIComponent(du)}&au=${encodeURIComponent(au)}`;
      const reponse = await fetch(url);
      if (!reponse.ok) {
        const corps = (await reponse.json().catch(() => null)) as { erreur?: string } | null;
        const cle = corps?.erreur as keyof typeof admin.erreurs | undefined;
        setErreur((cle && admin.erreurs[cle]) ?? admin.erreurs.erreurGenerique);
        setEnEnvoi(false);
        return;
      }

      const blob = await reponse.blob();
      const disposition = reponse.headers.get("Content-Disposition") ?? "";
      const correspondance = /filename\*=UTF-8''([^;]+)/.exec(disposition);
      const nomFichier = correspondance
        ? decodeURIComponent(correspondance[1])
        : `reservations-${du}-${au}.csv`;

      const objetUrl = URL.createObjectURL(blob);
      const lien = document.createElement("a");
      lien.href = objetUrl;
      lien.download = nomFichier;
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      URL.revokeObjectURL(objetUrl);
      setEnEnvoi(false);
    } catch {
      setErreur(admin.erreurs.erreurGenerique);
      setEnEnvoi(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{admin.reservations.export.titre}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-foreground">{admin.reservations.export.colonnesAnnonce}</p>

        <div className="flex flex-wrap gap-3">
          <Field className="min-w-40">
            <FieldLabel htmlFor="export-du">{admin.reservations.export.champs.du}</FieldLabel>
            <FieldControl
              id="export-du"
              type="date"
              className="text-base"
              value={du}
              onChange={(event) => setDu(event.target.value)}
            />
          </Field>
          <Field className="min-w-40">
            <FieldLabel htmlFor="export-au">{admin.reservations.export.champs.au}</FieldLabel>
            <FieldControl
              id="export-au"
              type="date"
              className="text-base"
              value={au}
              onChange={(event) => setAu(event.target.value)}
            />
          </Field>
        </div>

        {erreur ? <FieldError>{erreur}</FieldError> : null}

        <Button
          className="h-11 self-start"
          data-loading={enEnvoi ? "true" : undefined}
          disabled={enEnvoi}
          onClick={exporter}
        >
          {admin.reservations.export.bouton}
        </Button>
      </CardContent>
    </Card>
  );
}

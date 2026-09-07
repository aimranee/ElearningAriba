"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Message } from "@/components/ui/message";
import donnees from "@/locales/fr/donnees.json";

type Etat =
  | "repos"
  | "confirmation"
  | "envoi"
  | "enregistree"
  | "dejaDemandee"
  | "erreur";

type SuppressionCompteProps = {
  demandeDejaEnCours: boolean;
  dateDemandeExistante: string | null;
};

/*
 * why (D-A4): the confirmation step reveals in place, on the same page —
 * no overlay, no focus trap, no portal. This survives without JavaScript
 * in a way a hand-rolled overlay would not.
 */
export function SuppressionCompte({
  demandeDejaEnCours,
  dateDemandeExistante,
}: SuppressionCompteProps) {
  const [etat, setEtat] = useState<Etat>(
    demandeDejaEnCours ? "dejaDemandee" : "repos",
  );
  const [date, setDate] = useState<string | null>(dateDemandeExistante);
  const [confirme, setConfirme] = useState(false);

  async function handleConfirmer() {
    setEtat("envoi");

    try {
      const response = await fetch("/api/rgpd/suppression", { method: "POST" });

      if (response.status === 200) {
        setEtat("enregistree");
        return;
      }

      if (response.status === 409) {
        const body = (await response.json()) as { date?: string };
        setDate(body.date ?? null);
        setEtat("dejaDemandee");
        return;
      }

      setEtat("erreur");
    } catch {
      setEtat("erreur");
    }
  }

  if (etat === "enregistree") {
    return (
      <div className="flex flex-col gap-1">
        <p className="font-medium text-foreground">
          {donnees.suppression.accuseReception.titre}
        </p>
        <p className="text-sm text-muted-foreground">
          {donnees.suppression.accuseReception.message}
        </p>
      </div>
    );
  }

  if (etat === "dejaDemandee") {
    return (
      <div className="flex flex-col gap-1">
        <p className="font-medium text-foreground">
          {donnees.suppression.dejaDemandee.titre}
        </p>
        <p className="text-sm text-muted-foreground">
          {donnees.suppression.dejaDemandee.message.replace(
            "{date}",
            date ?? "",
          )}
        </p>
      </div>
    );
  }

  if (etat === "repos") {
    return (
      <Button variant="outline" onClick={() => setEtat("confirmation")}>
        {donnees.suppression.action}
      </Button>
    );
  }

  const enEnvoi = etat === "envoi";

  return (
    <Card variant="default" className="gap-4">
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">
            {donnees.suppression.confirmation.titre}
          </p>
          <p className="text-sm text-muted-foreground">
            {donnees.suppression.confirmation.message}
          </p>
        </div>

        <label className="flex items-start gap-3">
          <Checkbox
            checked={confirme}
            onCheckedChange={(value) => setConfirme(value === true)}
          />
          <span className="text-sm text-foreground">
            {donnees.suppression.confirmation.caseACocher}
          </span>
        </label>

        {etat === "erreur" ? (
          <Message variant="error">{donnees.suppression.erreur}</Message>
        ) : null}

        <Button
          variant="destructive"
          className="h-11"
          disabled={!confirme || enEnvoi}
          data-loading={enEnvoi ? "true" : undefined}
          onClick={handleConfirmer}
        >
          {donnees.suppression.confirmation.confirmer}
        </Button>
      </CardContent>
    </Card>
  );
}

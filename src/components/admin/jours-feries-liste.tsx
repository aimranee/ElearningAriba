"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Message } from "@/components/ui/message";
import type { ExceptionAgenda } from "@/lib/agenda/admin-queries";
import * as i18n from "@/lib/i18n/fr";
import admin from "@/locales/fr/admin.json";

function versHeureCourte(heure: string): string {
  return heure.slice(0, 5);
}

/*
 * why (D-17): the eleven French public holidays, closed by default; the
 * checkbox's `ouvert` flip is the whole reopening mechanism — nothing here
 * deletes or recreates a holiday row, only PATCHes the existing one.
 */
export function JoursFeriesListe({ joursFeries }: { joursFeries: ExceptionAgenda[] }) {
  const [liste, setListe] = useState(joursFeries);
  const [enAttente, setEnAttente] = useState<Record<string, boolean>>({});
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  async function basculerOuvert(jour: ExceptionAgenda) {
    setEnAttente((prev) => ({ ...prev, [jour.id]: true }));
    setErreurs((prev) => ({ ...prev, [jour.id]: "" }));
    try {
      const response = await fetch("/api/admin/exceptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: jour.id,
          jour: jour.jour,
          motif: jour.motif,
          libelle: jour.libelle ?? undefined,
          ouvert: !jour.ouvert,
          heureDebut: jour.heure_debut ? versHeureCourte(jour.heure_debut) : undefined,
          heureFin: jour.heure_fin ? versHeureCourte(jour.heure_fin) : undefined,
        }),
      });
      if (!response.ok) {
        setErreurs((prev) => ({ ...prev, [jour.id]: admin.joursFeries.erreur }));
        return;
      }
      setListe((prev) =>
        prev.map((j) => (j.id === jour.id ? { ...j, ouvert: !j.ouvert } : j)),
      );
    } catch {
      setErreurs((prev) => ({ ...prev, [jour.id]: admin.joursFeries.erreur }));
    } finally {
      setEnAttente((prev) => ({ ...prev, [jour.id]: false }));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{admin.joursFeries.titre}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">{admin.joursFeries.intro}</p>

        <ul className="flex flex-col gap-2">
          {liste.map((jour) => (
            <li key={jour.id} className="flex flex-col gap-1">
              <label className="flex min-h-11 items-center gap-3">
                <Checkbox
                  checked={jour.ouvert}
                  data-loading={enAttente[jour.id] ? "true" : undefined}
                  disabled={enAttente[jour.id]}
                  onCheckedChange={() => basculerOuvert(jour)}
                />
                <span className="flex flex-1 items-center justify-between gap-2 text-sm text-foreground">
                  <span>{jour.libelle}</span>
                  <span className="text-muted-foreground">
                    {i18n.formatDateAvecJour(new Date(`${jour.jour}T00:00:00Z`))}
                  </span>
                </span>
              </label>
              {erreurs[jour.id] ? <Message variant="error">{erreurs[jour.id]}</Message> : null}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel, FieldControl, FieldError } from "@/components/ui/field";
import { Message } from "@/components/ui/message";
import type { TypeRendezVous } from "@/lib/agenda/types-rendez-vous";
import { type Creneau } from "@/lib/agenda/creneaux";
import * as i18n from "@/lib/i18n/fr";
import admin from "@/locales/fr/admin.json";
import common from "@/locales/fr/common.json";
import { SelecteurCreneau } from "@/components/admin/reservation-actions";

/*
 * why (D-18): books an existing learner's account onto a slot on the
 * administrator's own initiative. No invitation, no account-creation link
 * is offered here — the intro copy (admin.json's own sentence key) states
 * the constraint, and app.reserver_pour_apprenant (plan 04-07) refuses an
 * unknown email rather than creating one. The type chooser is fed from
 * app.type_rendez_vous, read server-side and passed down as the types prop
 * — never src/locales/fr/agenda.json, which is bootstrap seed input the
 * administrator does not own.
 */
export function ReservationCreation({ types }: { types: TypeRendezVous[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [typeId, setTypeId] = useState<string>(types[0]?.id ?? "");
  const [creneauChoisi, setCreneauChoisi] = useState<Creneau | null>(null);
  const [enEnvoi, setEnEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);

  function onChangerType(nouveauTypeId: string) {
    setTypeId(nouveauTypeId);
    setCreneauChoisi(null);
    setSucces(false);
  }

  async function soumettre() {
    if (!email || !typeId || !creneauChoisi) {
      setErreur(admin.erreurs.champsInvalides);
      return;
    }
    setEnEnvoi(true);
    setErreur(null);
    setSucces(false);
    try {
      const reponse = await fetch("/api/admin/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          typeId,
          debut: creneauChoisi.debut.toISOString(),
        }),
      });
      if (!reponse.ok) {
        const corps = (await reponse.json().catch(() => null)) as { erreur?: string } | null;
        const cle = corps?.erreur as keyof typeof admin.erreurs | undefined;
        setErreur((cle && admin.erreurs[cle]) ?? admin.erreurs.erreurGenerique);
        setEnEnvoi(false);
        return;
      }
      setEnEnvoi(false);
      setSucces(true);
      setEmail("");
      setCreneauChoisi(null);
      router.refresh();
    } catch {
      setErreur(admin.erreurs.erreurGenerique);
      setEnEnvoi(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{admin.reservations.creation.titre}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">{admin.reservations.creation.intro}</p>

        <Field>
          <FieldLabel htmlFor="creation-email">
            {admin.reservations.creation.champs.email}
          </FieldLabel>
          <FieldControl
            id="creation-email"
            type="email"
            className="text-base"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setSucces(false);
            }}
          />
        </Field>

        {types.length > 0 ? (
          <Field>
            <FieldLabel htmlFor="creation-type">
              {admin.reservations.creation.champs.type}
            </FieldLabel>
            <FieldControl
              id="creation-type"
              className="text-base"
              value={typeId}
              onChange={(event) => onChangerType(event.target.value)}
              render={
                <select>
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.libelle}
                    </option>
                  ))}
                </select>
              }
            />
          </Field>
        ) : null}

        {typeId ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">
              {admin.reservations.creation.champs.creneau}
            </p>
            <SelecteurCreneau
              typeId={typeId}
              onChoisir={(creneau) => {
                setCreneauChoisi(creneau);
                setSucces(false);
              }}
            />
            {creneauChoisi ? (
              <p className="text-muted-foreground text-sm">
                {i18n.formatDateAvecJour(creneauChoisi.debut)} —{" "}
                {i18n.formatHeureProse(creneauChoisi.debut)}
              </p>
            ) : null}
          </div>
        ) : null}

        {erreur ? <FieldError>{erreur}</FieldError> : null}
        {succes ? (
          <Message variant="success">{admin.reservations.creation.succes}</Message>
        ) : null}

        <Button
          className="h-11 self-start"
          data-loading={enEnvoi ? "true" : undefined}
          disabled={enEnvoi || !creneauChoisi || !email}
          onClick={soumettre}
        >
          {common.actions.reserver}
        </Button>
      </CardContent>
    </Card>
  );
}

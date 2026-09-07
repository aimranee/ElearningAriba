"use client";

import { useState, type FormEvent } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Message } from "@/components/ui/message";
import {
  Field,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { SubmitButton } from "@/components/compte/submit-button";
import inscription from "@/locales/fr/inscription.json";
import profil from "@/locales/fr/profil.json";
import type { Profil } from "@/lib/profil/queries";
import type { ProfilInput, ProfilErreurKey } from "@/lib/validation/profil";

const PROFIL_OPTIONS = Object.entries(inscription.champs.profil.options);

type Status = "idle" | "submitting" | "success" | "error";

type FieldErrors = Partial<Record<keyof ProfilInput, ProfilErreurKey>>;

type ProfilFormProps = {
  profil: Profil;
};

/*
 * why: reuses inscription's prénom/nom/select field family verbatim
 * (inscription/page.tsx:23-133) — only the submission wiring, the four
 * D-A7 UI-SPEC states and the two preference checkboxes are new here.
 */
export function ProfilForm({ profil: initialProfil }: ProfilFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [rappels, setRappels] = useState(initialProfil.preference_rappels);
  const [actualites, setActualites] = useState(initialProfil.preference_actualites);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);

    const payload = {
      prenom: String(formData.get("prenom") ?? ""),
      nom: String(formData.get("nom") ?? ""),
      telephone: String(formData.get("telephone") ?? ""),
      profil_professionnel: String(formData.get("profil_professionnel") ?? ""),
      preference_rappels: rappels,
      preference_actualites: actualites,
    };

    try {
      const response = await fetch("/api/profil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 422) {
        const body = (await response.json()) as { errors?: FieldErrors };
        setFieldErrors(body.errors ?? {});
        setStatus("error");
        return;
      }

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const isSubmitting = status === "submitting";
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const isTransportError = status === "error" && !hasFieldErrors;

  return (
    <Card>
      <CardContent>
        <form method="post" onSubmit={handleSubmit} className="flex flex-col gap-8">
          {status === "success" ? (
            <Message variant="success">{profil.succes}</Message>
          ) : null}

          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {profil.sections.identite}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="profil-prenom">
                  {inscription.champs.prenom}
                </FieldLabel>
                <FieldControl
                  id="profil-prenom"
                  name="prenom"
                  autoComplete="given-name"
                  defaultValue={initialProfil.prenom}
                  data-loading={isSubmitting ? "true" : undefined}
                  aria-invalid={fieldErrors.prenom ? "true" : undefined}
                />
                <FieldDescription>{inscription.aideParChamp.prenom}</FieldDescription>
                {fieldErrors.prenom ? (
                  <FieldError>{inscription.erreurs.requis}</FieldError>
                ) : null}
              </Field>

              <Field>
                <FieldLabel htmlFor="profil-nom">{inscription.champs.nom}</FieldLabel>
                <FieldControl
                  id="profil-nom"
                  name="nom"
                  autoComplete="family-name"
                  defaultValue={initialProfil.nom}
                  data-loading={isSubmitting ? "true" : undefined}
                  aria-invalid={fieldErrors.nom ? "true" : undefined}
                />
                <FieldDescription>{inscription.aideParChamp.nom}</FieldDescription>
                {fieldErrors.nom ? (
                  <FieldError>{inscription.erreurs.requis}</FieldError>
                ) : null}
              </Field>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {profil.sections.contact}
            </h2>
            <Field>
              <FieldLabel htmlFor="profil-email">
                {inscription.champs.email}
              </FieldLabel>
              <FieldControl
                id="profil-email"
                type="email"
                defaultValue={initialProfil.email}
                disabled
              />
              <FieldDescription>{profil.emailNonModifiable}</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="profil-telephone">
                {profil.champs.telephone}
              </FieldLabel>
              <FieldControl
                id="profil-telephone"
                name="telephone"
                type="tel"
                autoComplete="tel"
                defaultValue={initialProfil.telephone ?? ""}
                data-loading={isSubmitting ? "true" : undefined}
                aria-invalid={fieldErrors.telephone ? "true" : undefined}
              />
              <FieldDescription>{profil.aideParChamp.telephone}</FieldDescription>
              {fieldErrors.telephone ? (
                <FieldError>{profil.erreurs[fieldErrors.telephone as keyof typeof profil.erreurs] ?? profil.erreurs.telephoneInvalide}</FieldError>
              ) : null}
            </Field>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {profil.sections.professionnel}
            </h2>
            <Field>
              <FieldLabel htmlFor="profil-profil-professionnel">
                {inscription.champs.profil.libelle}
              </FieldLabel>
              <FieldControl
                id="profil-profil-professionnel"
                name="profil_professionnel"
                aria-invalid={fieldErrors.profil_professionnel ? "true" : undefined}
                render={
                  <select defaultValue={initialProfil.profil_professionnel}>
                    {PROFIL_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                }
              />
              <FieldDescription>{inscription.aideParChamp.profil}</FieldDescription>
              {fieldErrors.profil_professionnel ? (
                <FieldError>{inscription.erreurs.requis}</FieldError>
              ) : null}
            </Field>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {profil.sections.preferences}
            </h2>

            <label className="flex items-start gap-3">
              <Checkbox
                checked={rappels}
                onCheckedChange={(value) => setRappels(value === true)}
              />
              <span className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  {profil.preferences.rappels.libelle}
                </span>
                <span className="text-sm text-muted-foreground">
                  {profil.preferences.rappels.aide}
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3">
              <Checkbox
                checked={actualites}
                onCheckedChange={(value) => setActualites(value === true)}
              />
              <span className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  {profil.preferences.actualites.libelle}
                </span>
                <span className="text-sm text-muted-foreground">
                  {profil.preferences.actualites.aide}
                </span>
              </span>
            </label>
          </div>

          {isTransportError ? (
            <Field rejected="server">
              <FieldError>{profil.erreurs.rejetServeur}</FieldError>
            </Field>
          ) : null}

          <SubmitButton pending={isSubmitting} className="self-start">
            {profil.action}
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import inscription from "@/locales/fr/inscription.json";
import common from "@/locales/fr/common.json";
import { GoogleMark } from "@/components/icons/google-mark";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { SubmitButton } from "@/components/compte/submit-button";
import { lireCreneauChoisi } from "@/lib/agenda/creneaux";

const PROFIL_OPTIONS = Object.entries(inscription.champs.profil.options) as [
  keyof typeof inscription.champs.profil.options,
  string,
][];

type Status = "idle" | "submitting" | "success" | "error";

type FieldErrors = Partial<
  Record<
    "prenom" | "nom" | "email" | "motDePasse" | "confirmation" | "profil",
    keyof typeof inscription.erreurs
  >
>;

/*
 * why: field markup lifted verbatim from src/app/inscription/page.tsx:36-137
 * (the founder-validated demo) — field names, ids, autoComplete values and
 * help text unchanged. This client island only adds submission wiring and
 * the five UI-SPEC states, modelled on src/components/forms/contact-form.tsx.
 */
export function InscriptionForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const payload = {
      prenom: String(formData.get("prenom") ?? ""),
      nom: String(formData.get("nom") ?? ""),
      email: String(formData.get("email") ?? ""),
      motDePasse: String(formData.get("motDePasse") ?? ""),
      confirmation: String(formData.get("confirmation") ?? ""),
      profil: String(formData.get("profil") ?? ""),
    };

    try {
      const response = await fetch("/api/auth/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 422 || response.status === 429) {
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

  if (status === "success") {
    /* why (D-28): sign-up requires email confirmation (enable_confirmations,
       supabase/config.toml) — no session exists yet at this point, so there
       is nothing to redirect into and the required "check your email" copy
       above must stay on screen. A pending slot in sessionStorage still
       survives untouched; this only offers a link back to /reservation for
       once the visitor has confirmed and signed in, never an automatic
       navigation away from the confirmation instructions. */
    const creneauEnAttente = lireCreneauChoisi();
    return (
      <Card>
        <CardHeader>
          <CardTitle>{inscription.succes.titre}</CardTitle>
          <CardDescription>{inscription.succes.message}</CardDescription>
        </CardHeader>
        {creneauEnAttente ? (
          <CardContent>
            <Button
              render={<Link href="/reservation" />}
              nativeButton={false}
              variant="outline"
              className="h-11"
            >
              {common.actions.continuer}
            </Button>
          </CardContent>
        ) : null}
      </Card>
    );
  }

  const isSubmitting = status === "submitting";
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const isTransportError = status === "error" && !hasFieldErrors;

  return (
    <form
      method="post"
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
      aria-label={inscription.titre}
    >
      <Button
        render={<Link href="/api/auth/google" prefetch={false} />}
        nativeButton={false}
        variant="outline"
        className="h-11 w-full"
      >
        <GoogleMark className="size-[18px]" />
        {inscription.google}
      </Button>

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-sm text-muted-foreground">{common.formulaires.ou}</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="inscription-prenom">
            {inscription.champs.prenom}
          </FieldLabel>
          <FieldControl
            id="inscription-prenom"
            name="prenom"
            autoComplete="given-name"
            className="h-11"
            data-loading={isSubmitting ? "true" : undefined}
            aria-invalid={fieldErrors.prenom ? "true" : undefined}
          />
          <FieldDescription>
            {inscription.aideParChamp.prenom}
          </FieldDescription>
          {fieldErrors.prenom ? (
            <FieldError>{inscription.erreurs[fieldErrors.prenom]}</FieldError>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="inscription-nom">
            {inscription.champs.nom}
          </FieldLabel>
          <FieldControl
            id="inscription-nom"
            name="nom"
            autoComplete="family-name"
            className="h-11"
            data-loading={isSubmitting ? "true" : undefined}
            aria-invalid={fieldErrors.nom ? "true" : undefined}
          />
          <FieldDescription>
            {inscription.aideParChamp.nom}
          </FieldDescription>
          {fieldErrors.nom ? (
            <FieldError>{inscription.erreurs[fieldErrors.nom]}</FieldError>
          ) : null}
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="inscription-email">
          {inscription.champs.email}
        </FieldLabel>
        <FieldControl
          id="inscription-email"
          name="email"
          type="email"
          autoComplete="email"
          className="h-11"
          data-loading={isSubmitting ? "true" : undefined}
          aria-invalid={fieldErrors.email ? "true" : undefined}
        />
        <FieldDescription>
          {inscription.aideParChamp.email}
        </FieldDescription>
        {fieldErrors.email ? (
          <FieldError>{inscription.erreurs[fieldErrors.email]}</FieldError>
        ) : null}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="inscription-mot-de-passe">
            {inscription.champs.motDePasse}
          </FieldLabel>
          <FieldControl
            id="inscription-mot-de-passe"
            name="motDePasse"
            type="password"
            autoComplete="new-password"
            className="h-11"
            data-loading={isSubmitting ? "true" : undefined}
            aria-invalid={fieldErrors.motDePasse ? "true" : undefined}
          />
          <FieldDescription>
            {inscription.aideParChamp.motDePasse}
          </FieldDescription>
          {fieldErrors.motDePasse ? (
            <FieldError>{inscription.erreurs[fieldErrors.motDePasse]}</FieldError>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="inscription-confirmation">
            {inscription.champs.confirmation}
          </FieldLabel>
          <FieldControl
            id="inscription-confirmation"
            name="confirmation"
            type="password"
            autoComplete="new-password"
            className="h-11"
            data-loading={isSubmitting ? "true" : undefined}
            aria-invalid={fieldErrors.confirmation ? "true" : undefined}
          />
          <FieldDescription>
            {inscription.aideParChamp.confirmation}
          </FieldDescription>
          {fieldErrors.confirmation ? (
            <FieldError>{inscription.erreurs[fieldErrors.confirmation]}</FieldError>
          ) : null}
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="inscription-profil">
          {inscription.champs.profil.libelle}
        </FieldLabel>
        <FieldControl
          id="inscription-profil"
          name="profil"
          className="h-11"
          data-loading={isSubmitting ? "true" : undefined}
          aria-invalid={fieldErrors.profil ? "true" : undefined}
          render={
            <select>
              {PROFIL_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          }
        />
        <FieldDescription>
          {inscription.aideParChamp.profil}
        </FieldDescription>
        {fieldErrors.profil ? (
          <FieldError>{inscription.erreurs[fieldErrors.profil]}</FieldError>
        ) : null}
      </Field>

      <p className="text-muted-foreground text-sm">
        {inscription.conditions}
      </p>

      {isTransportError ? (
        <Field rejected="server">
          <FieldError>{inscription.erreurs.rejetServeur}</FieldError>
        </Field>
      ) : null}

      <SubmitButton pending={isSubmitting}>
        {common.actions.sInscrire}
      </SubmitButton>
    </form>
  );
}

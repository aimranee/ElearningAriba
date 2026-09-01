"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import motDePasse from "@/locales/fr/mot-de-passe.json";
import connexion from "@/locales/fr/connexion.json";
import inscription from "@/locales/fr/inscription.json";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldControl,
  FieldError,
} from "@/components/ui/field";
import { SubmitButton } from "@/components/compte/submit-button";

type Status = "idle" | "submitting" | "success" | "error";

type FieldErrors = { email?: keyof typeof inscription.erreurs };

/*
 * why: mirrors src/components/forms/contact-form.tsx's island idiom — fetch
 * to the route handler, five UI-SPEC states, no server action.
 */
export function MotDePasseOublieForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [tropDeTentatives, setTropDeTentatives] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setFieldErrors({});
    setTropDeTentatives(false);

    const formData = new FormData(event.currentTarget);
    const payload = { email: String(formData.get("email") ?? "") };

    try {
      const response = await fetch("/api/auth/mot-de-passe/demande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        setTropDeTentatives(true);
        setStatus("error");
        return;
      }

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

  if (status === "success") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{motDePasse.demande.succes.titre}</CardTitle>
          <CardDescription>{motDePasse.demande.succes.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isSubmitting = status === "submitting";
  const isTransportError = status === "error" && !tropDeTentatives && !fieldErrors.email;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field>
        <FieldLabel htmlFor="mot-de-passe-email">{connexion.champs.email}</FieldLabel>
        <FieldControl
          id="mot-de-passe-email"
          name="email"
          type="email"
          autoComplete="email"
          data-loading={isSubmitting ? "true" : undefined}
          aria-invalid={fieldErrors.email ? "true" : undefined}
        />
        {fieldErrors.email ? (
          <FieldError>{inscription.erreurs[fieldErrors.email]}</FieldError>
        ) : null}
      </Field>

      {tropDeTentatives ? (
        <Field rejected="server">
          <FieldError>{connexion.erreurs.tropDeTentatives}</FieldError>
        </Field>
      ) : null}

      {isTransportError ? (
        <Field rejected="server">
          <FieldError>{motDePasse.erreurs.rejetServeur}</FieldError>
        </Field>
      ) : null}

      <SubmitButton pending={isSubmitting}>{motDePasse.demande.action}</SubmitButton>

      <Link
        href="/connexion"
        className="self-start text-sm text-primary hover:underline"
      >
        {motDePasse.demande.retourConnexion}
      </Link>
    </form>
  );
}

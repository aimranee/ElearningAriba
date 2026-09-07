"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import motDePasse from "@/locales/fr/mot-de-passe.json";
import inscription from "@/locales/fr/inscription.json";
import { Message } from "@/components/ui/message";
import {
  Field,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { SubmitButton } from "@/components/compte/submit-button";

type Status = "idle" | "submitting" | "success" | "error";

type FieldErrors = Partial<
  Record<"motDePasse" | "confirmation", keyof typeof inscription.erreurs>
>;

/*
 * why: mirrors src/components/forms/contact-form.tsx's island idiom — fetch
 * to the route handler, five UI-SPEC states, no server action. The recovery
 * session lives in the cookie jar; nothing about it is read here.
 */
export function NouveauMotDePasseForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [lienExpire, setLienExpire] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setFieldErrors({});
    setLienExpire(false);

    const formData = new FormData(event.currentTarget);
    const payload = {
      motDePasse: String(formData.get("motDePasse") ?? ""),
      confirmation: String(formData.get("confirmation") ?? ""),
    };

    try {
      const response = await fetch("/api/auth/mot-de-passe/nouveau", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        setLienExpire(true);
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
      <div className="flex flex-col gap-4">
        <Message variant="success">{motDePasse.nouveau.succes.titre}</Message>
        <p className="text-muted-foreground text-sm">
          {motDePasse.nouveau.succes.message}
        </p>
        <Link href="/connexion" className="self-start text-sm text-primary hover:underline">
          {motDePasse.demande.retourConnexion}
        </Link>
      </div>
    );
  }

  const isSubmitting = status === "submitting";
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const isTransportError = status === "error" && !lienExpire && !hasFieldErrors;

  return (
    <form method="post" onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field>
        <FieldLabel htmlFor="nouveau-mot-de-passe">
          {motDePasse.nouveau.champs.motDePasse}
        </FieldLabel>
        <FieldControl
          id="nouveau-mot-de-passe"
          name="motDePasse"
          type="password"
          autoComplete="new-password"
          data-loading={isSubmitting ? "true" : undefined}
          aria-invalid={fieldErrors.motDePasse ? "true" : undefined}
        />
        <FieldDescription>{inscription.aideParChamp.motDePasse}</FieldDescription>
        {fieldErrors.motDePasse ? (
          <FieldError>{inscription.erreurs[fieldErrors.motDePasse]}</FieldError>
        ) : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="nouveau-mot-de-passe-confirmation">
          {motDePasse.nouveau.champs.confirmation}
        </FieldLabel>
        <FieldControl
          id="nouveau-mot-de-passe-confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          data-loading={isSubmitting ? "true" : undefined}
          aria-invalid={fieldErrors.confirmation ? "true" : undefined}
        />
        {fieldErrors.confirmation ? (
          <FieldError>{inscription.erreurs[fieldErrors.confirmation]}</FieldError>
        ) : null}
      </Field>

      {lienExpire ? (
        <Field rejected="server">
          <FieldError>{motDePasse.erreurs.lienExpire}</FieldError>
        </Field>
      ) : null}

      {isTransportError ? (
        <Field rejected="server">
          <FieldError>{motDePasse.erreurs.rejetServeur}</FieldError>
        </Field>
      ) : null}

      <SubmitButton pending={isSubmitting}>{motDePasse.nouveau.action}</SubmitButton>
    </form>
  );
}

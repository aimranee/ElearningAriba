"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import contact from "@/locales/fr/contact.json";
import common from "@/locales/fr/common.json";
import { Button } from "@/components/ui/button";
import { Message } from "@/components/ui/message";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import {
  Field,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";

const PROFIL_OPTIONS = Object.entries(contact.profil) as [
  keyof typeof contact.profil,
  string,
][];

type Status = "idle" | "submitting" | "success" | "error";

type FieldErrors = Partial<Record<"nom" | "email" | "profil" | "message", keyof typeof contact.erreurs>>;

/*
 * why: lifted verbatim from src/app/contact/page.tsx:60-122 (the
 * founder-validated demo) rather than redesigned — field names, the
 * FieldControl `render` polymorphism for the select and the textarea, and
 * the help text are unchanged. This client island only adds submission
 * wiring, the honeypot, the submit-time guard and the four D-36 states.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const renduRef = useRef<number | null>(null);

  /* why (FUITE-02): see src/components/compte/submit-button.tsx — this
     form's submit button is rendered inline, so the same hydration gate is
     repeated here rather than through a shared component. */
  const hydrated = useHydrated();

  /* why: set on mount, not during render — "use client" components still
     render once on the server, so Date.now() during render would differ
     between server and client. Kept in a ref, never in the DOM (#31): a
     hidden input written from an effect was wiped by the next commit —
     React re-applies defaultValue="" on every update, and on a hidden input
     defaultValue and value are the same attribute — so the form posted
     rendu 0 and the server's minimum-time check never fired. */
  useEffect(() => {
    renduRef.current = Date.now();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    /* why: the submit button stays disabled until hydrated, after the
       effect has run; if the ref were ever still empty, "now" fails closed
       (the server reads it as too fast) rather than open. */
    const rendu = renduRef.current ?? Date.now();

    const payload = {
      nom: String(formData.get("nom") ?? ""),
      email: String(formData.get("email") ?? ""),
      telephone: String(formData.get("telephone") ?? ""),
      profil: String(formData.get("profil") ?? ""),
      message: String(formData.get("message") ?? ""),
      societe: String(formData.get("societe") ?? ""),
      rendu,
    };

    try {
      const response = await fetch("/api/contact", {
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

  if (status === "success") {
    return <Message variant="success">{contact.succes.message}</Message>;
  }

  const isSubmitting = status === "submitting";
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const isTransportError = status === "error" && !hasFieldErrors;

  return (
    <form
      method="post"
      onSubmit={handleSubmit}
      className="reveal-rise flex flex-col gap-5"
      aria-label={contact.titre}
    >
      <Field>
        <FieldLabel htmlFor="contact-nom">{contact.champs.nom}</FieldLabel>
        <FieldControl
          id="contact-nom"
          name="nom"
          autoComplete="name"
          data-loading={isSubmitting ? "true" : undefined}
          aria-invalid={fieldErrors.nom ? "true" : undefined}
        />
        <FieldDescription>{contact.aideParChamp.nom}</FieldDescription>
        {fieldErrors.nom ? <FieldError>{contact.erreurs[fieldErrors.nom]}</FieldError> : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="contact-email">{contact.champs.email}</FieldLabel>
        <FieldControl
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          data-loading={isSubmitting ? "true" : undefined}
          aria-invalid={fieldErrors.email ? "true" : undefined}
        />
        <FieldDescription>{contact.aideParChamp.email}</FieldDescription>
        {fieldErrors.email ? <FieldError>{contact.erreurs[fieldErrors.email]}</FieldError> : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="contact-telephone">{contact.champs.telephone}</FieldLabel>
        <FieldControl id="contact-telephone" name="telephone" type="tel" autoComplete="tel" />
        <FieldDescription>{contact.aideParChamp.telephone}</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="contact-profil">{contact.champs.profil}</FieldLabel>
        <FieldControl
          id="contact-profil"
          name="profil"
          aria-invalid={fieldErrors.profil ? "true" : undefined}
          render={
            <select>
              {PROFIL_OPTIONS.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          }
        />
        <FieldDescription>{contact.aideParChamp.profil}</FieldDescription>
        {fieldErrors.profil ? <FieldError>{contact.erreurs[fieldErrors.profil]}</FieldError> : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="contact-message">{contact.champs.message}</FieldLabel>
        <FieldControl
          id="contact-message"
          name="message"
          aria-invalid={fieldErrors.message ? "true" : undefined}
          render={<textarea rows={4} />}
        />
        <FieldDescription>{contact.aideParChamp.message}</FieldDescription>
        {fieldErrors.message ? (
          <FieldError>{contact.erreurs[fieldErrors.message]}</FieldError>
        ) : null}
      </Field>

      {/* honeypot (D-35, AC-9): visually hidden, never focusable, never
          announced — a bot filling every field fills this one too */}
      <input
        type="text"
        name="societe"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
        defaultValue=""
      />

      {isTransportError ? (
        <Field rejected="server">
          <FieldError>{contact.erreurs.rejetServeur}</FieldError>
        </Field>
      ) : null}

      <Button
        type="submit"
        className="self-start"
        data-loading={isSubmitting ? "true" : undefined}
        disabled={!hydrated || isSubmitting}
      >
        {common.actions.envoyer}
      </Button>
      {!hydrated ? (
        <p className="text-muted-foreground text-xs">
          {common.etats.preparationFormulaire}
        </p>
      ) : null}
    </form>
  );
}

"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import type { Locale } from "@/lib/i18n/locale";
import type { Messages } from "@/lib/i18n/messages";
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

type ContactMessages = Messages<"contact">;

/* why (#23): the form's text, in the page's language — handed down by the
   server parent (src/components/contact/page-contact.tsx) so this island
   imports no copy of its own. */
export interface ContactFormText {
  titre: string;
  champs: ContactMessages["champs"];
  profil: ContactMessages["profil"];
  aideParChamp: ContactMessages["aideParChamp"];
  erreurs: ContactMessages["erreurs"];
  succes: string;
  envoyer: string;
  preparationFormulaire: string;
}

interface ContactFormProps {
  /** The page's language, sent with the message: it picks the acknowledgement's language. */
  langue: Locale;
  texte: ContactFormText;
}

type Status = "idle" | "submitting" | "success" | "error";

type FieldErrors = Partial<Record<"nom" | "email" | "profil" | "message", keyof ContactMessages["erreurs"]>>;

/*
 * why: lifted verbatim from src/app/contact/page.tsx:60-122 (the
 * founder-validated demo) rather than redesigned — field names, the
 * FieldControl `render` polymorphism for the select and the textarea, and
 * the help text are unchanged. This client island only adds submission
 * wiring, the honeypot, the submit-time guard and the four D-36 states.
 */
export function ContactForm({ langue, texte }: ContactFormProps) {
  const profilOptions = Object.entries(texte.profil) as [keyof ContactMessages["profil"], string][];
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const renduInputRef = useRef<HTMLInputElement>(null);

  /* why (FUITE-02): see src/components/compte/submit-button.tsx — this
     form's submit button is rendered inline, so the same hydration gate is
     repeated here rather than through a shared component. */
  const hydrated = useHydrated();

  /* why: set on mount, not during render — "use client" components still
     render once on the server, so writing Date.now() to the hidden input's
     DOM node inside an effect (not as a React-controlled value) avoids a
     hydration mismatch */
  useEffect(() => {
    if (renduInputRef.current) {
      renduInputRef.current.value = String(Date.now());
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const rendu = Number(formData.get("rendu") ?? Date.now());

    const payload = {
      nom: String(formData.get("nom") ?? ""),
      email: String(formData.get("email") ?? ""),
      telephone: String(formData.get("telephone") ?? ""),
      profil: String(formData.get("profil") ?? ""),
      message: String(formData.get("message") ?? ""),
      societe: String(formData.get("societe") ?? ""),
      rendu,
      langue,
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
    return <Message variant="success">{texte.succes}</Message>;
  }

  const isSubmitting = status === "submitting";
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const isTransportError = status === "error" && !hasFieldErrors;

  return (
    <form
      method="post"
      onSubmit={handleSubmit}
      className="reveal-rise flex flex-col gap-5"
      aria-label={texte.titre}
    >
      <Field>
        <FieldLabel htmlFor="contact-nom">{texte.champs.nom}</FieldLabel>
        <FieldControl
          id="contact-nom"
          name="nom"
          autoComplete="name"
          data-loading={isSubmitting ? "true" : undefined}
          aria-invalid={fieldErrors.nom ? "true" : undefined}
        />
        <FieldDescription>{texte.aideParChamp.nom}</FieldDescription>
        {fieldErrors.nom ? <FieldError>{texte.erreurs[fieldErrors.nom]}</FieldError> : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="contact-email">{texte.champs.email}</FieldLabel>
        <FieldControl
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          data-loading={isSubmitting ? "true" : undefined}
          aria-invalid={fieldErrors.email ? "true" : undefined}
        />
        <FieldDescription>{texte.aideParChamp.email}</FieldDescription>
        {fieldErrors.email ? <FieldError>{texte.erreurs[fieldErrors.email]}</FieldError> : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="contact-telephone">{texte.champs.telephone}</FieldLabel>
        <FieldControl id="contact-telephone" name="telephone" type="tel" autoComplete="tel" />
        <FieldDescription>{texte.aideParChamp.telephone}</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="contact-profil">{texte.champs.profil}</FieldLabel>
        <FieldControl
          id="contact-profil"
          name="profil"
          aria-invalid={fieldErrors.profil ? "true" : undefined}
          render={
            <select>
              {profilOptions.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          }
        />
        <FieldDescription>{texte.aideParChamp.profil}</FieldDescription>
        {fieldErrors.profil ? <FieldError>{texte.erreurs[fieldErrors.profil]}</FieldError> : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="contact-message">{texte.champs.message}</FieldLabel>
        <FieldControl
          id="contact-message"
          name="message"
          aria-invalid={fieldErrors.message ? "true" : undefined}
          render={<textarea rows={4} />}
        />
        <FieldDescription>{texte.aideParChamp.message}</FieldDescription>
        {fieldErrors.message ? (
          <FieldError>{texte.erreurs[fieldErrors.message]}</FieldError>
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

      {/* set on mount via the effect above; empty on first render (SSR-safe) */}
      <input ref={renduInputRef} type="hidden" name="rendu" defaultValue="" readOnly />

      {isTransportError ? (
        <Field rejected="server">
          <FieldError>{texte.erreurs.rejetServeur}</FieldError>
        </Field>
      ) : null}

      <Button
        type="submit"
        className="self-start"
        data-loading={isSubmitting ? "true" : undefined}
        disabled={!hydrated || isSubmitting}
      >
        {texte.envoyer}
      </Button>
      {!hydrated ? (
        <p className="text-muted-foreground text-xs">
          {texte.preparationFormulaire}
        </p>
      ) : null}
    </form>
  );
}

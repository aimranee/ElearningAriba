"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldControl, FieldError } from "@/components/ui/field";
import common from "@/locales/fr/common.json";
import connexion from "@/locales/fr/connexion.json";

type Status = "idle" | "submitting" | "error";

type FieldErrors = Partial<Record<"email" | "motDePasse", keyof typeof connexion.erreurs>>;

/* why: the single form-level rejection treatment, shared by both a
   submission failure and the callback failure flag below — the server-
   rejection Field prop appears once in this file, called from two sites. */
function RejectionField({
  messageKey,
}: {
  messageKey: keyof typeof connexion.erreurs | null;
}) {
  if (!messageKey) return null;
  return (
    <Field rejected="server">
      <FieldError>{connexion.erreurs[messageKey]}</FieldError>
    </Field>
  );
}

/* why (T-03-04, T-03-28): api/auth/callback redirects here with ?erreur=session
   on an open-redirect refusal or a failed exchange — read via useSearchParams,
   which Next.js requires to sit behind its own Suspense boundary so the rest
   of this statically rendered page never bails into client-only rendering
   (see the boundary in ConnexionForm below). Never renders the provider's
   own error text, only the existing connexion.erreurs.rejetServeur key. */
function CallbackFailureNotice() {
  const searchParams = useSearchParams();
  const failed = searchParams.get("erreur") === "session";
  return <RejectionField messageKey={failed ? "rejetServeur" : null} />;
}

/*
 * why: mirrors src/components/forms/contact-form.tsx's island pattern —
 * fetch to a route handler, no server action, no useFormStatus (03-03's
 * documented deviation). The two fields, ids and autoComplete values are
 * lifted verbatim from the Lot 1 shell this replaces.
 */
export function ConnexionForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<keyof typeof connexion.erreurs | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setFieldErrors({});
    setSubmitError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      motDePasse: String(formData.get("motDePasse") ?? ""),
    };

    try {
      const response = await fetch("/api/auth/connexion", {
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

      if (response.status === 401) {
        setSubmitError("identifiantsInvalides");
        setStatus("error");
        return;
      }

      if (response.status === 429) {
        setSubmitError("tropDeTentatives");
        setStatus("error");
        return;
      }

      if (!response.ok) {
        setSubmitError("rejetServeur");
        setStatus("error");
        return;
      }

      router.push("/espace");
    } catch {
      setSubmitError("rejetServeur");
      setStatus("error");
    }
  }

  const isSubmitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" aria-label={connexion.titre}>
      <Field>
        <FieldLabel htmlFor="connexion-email">{connexion.champs.email}</FieldLabel>
        <FieldControl
          id="connexion-email"
          name="email"
          type="email"
          autoComplete="email"
          data-loading={isSubmitting ? "true" : undefined}
          aria-invalid={fieldErrors.email ? "true" : undefined}
        />
        {fieldErrors.email ? (
          <FieldError>{connexion.erreurs[fieldErrors.email]}</FieldError>
        ) : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="connexion-mot-de-passe">{connexion.champs.motDePasse}</FieldLabel>
        <FieldControl
          id="connexion-mot-de-passe"
          name="motDePasse"
          type="password"
          autoComplete="current-password"
          data-loading={isSubmitting ? "true" : undefined}
          aria-invalid={fieldErrors.motDePasse ? "true" : undefined}
        />
        {fieldErrors.motDePasse ? (
          <FieldError>{connexion.erreurs[fieldErrors.motDePasse]}</FieldError>
        ) : null}
      </Field>

      <Link
        href="/mot-de-passe-oublie"
        className="self-end text-sm text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring rounded-md"
      >
        {connexion.motDePasseOublie}
      </Link>

      <Button
        type="submit"
        data-loading={isSubmitting ? "true" : undefined}
        disabled={isSubmitting}
      >
        {common.actions.seConnecter}
      </Button>

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        render={<Link href="/api/auth/google" />}
        nativeButton={false}
        variant="outline"
      >
        <LogIn aria-hidden="true" />
        {connexion.google}
      </Button>

      {submitError ? (
        <RejectionField messageKey={submitError} />
      ) : (
        <Suspense fallback={null}>
          <CallbackFailureNotice />
        </Suspense>
      )}
    </form>
  );
}

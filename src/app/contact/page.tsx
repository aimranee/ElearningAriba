import { Mail } from "lucide-react";

import contact from "@/locales/fr/contact.json";
import common from "@/locales/fr/common.json";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

/*
 * why: see src/app/programme/page.tsx — Section/SectionHeader (plan 01-09)
 * had not landed in this worktree; the rhythm is reproduced inline instead of
 * importing a component this plan does not own.
 */
export default function Contact() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12 sm:py-16 lg:py-20">
      <header className="reveal-rise flex flex-col gap-3">
        <h1 className="font-heading text-[length:var(--text-title)] leading-[var(--text-title--line-height)] font-semibold">
          {contact.titre}
        </h1>
        <p className="text-[length:var(--text-lead)] leading-[var(--text-lead--line-height)] text-muted-foreground">
          {contact.intro}
        </p>
      </header>

      <Card className="reveal-rise">
        <CardHeader className="flex flex-row items-center gap-2">
          <Mail aria-hidden="true" className="size-5 text-primary" />
          <CardTitle>{contact.coordonnees.titre}</CardTitle>
        </CardHeader>
        <CardContent>
          <a
            href={`mailto:${contact.coordonnees.email}`}
            className="text-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring rounded-md"
          >
            {contact.coordonnees.email}
          </a>
        </CardContent>
      </Card>

      {/* why: PUB-11 (submission, spam protection) is Lot 2 (D-41) — this is a
          maquette of a form; no action, no onSubmit, no fetch, no validation
          function, no zod schema, no honeypot, no captcha */}
      <form className="reveal-rise flex flex-col gap-5" aria-label={contact.titre}>
        <Field>
          <FieldLabel htmlFor="contact-nom">{contact.champs.nom}</FieldLabel>
          <FieldControl id="contact-nom" name="nom" autoComplete="name" />
          <FieldDescription>{contact.aideParChamp.nom}</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="contact-email">{contact.champs.email}</FieldLabel>
          <FieldControl
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
          />
          <FieldDescription>{contact.aideParChamp.email}</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="contact-telephone">
            {contact.champs.telephone}
          </FieldLabel>
          <FieldControl
            id="contact-telephone"
            name="telephone"
            type="tel"
            autoComplete="tel"
          />
          <FieldDescription>{contact.aideParChamp.telephone}</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="contact-profil">{contact.champs.profil}</FieldLabel>
          <FieldControl
            id="contact-profil"
            name="profil"
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
        </Field>

        <Field>
          <FieldLabel htmlFor="contact-message">{contact.champs.message}</FieldLabel>
          <FieldControl
            id="contact-message"
            name="message"
            render={<textarea rows={4} />}
          />
          <FieldDescription>{contact.aideParChamp.message}</FieldDescription>
        </Field>

        <Button type="button" className="self-start">
          {common.actions.envoyer}
        </Button>
      </form>

      {/* D-23: states are a named deliverable. The client validates the error
          and rejection states here, before Lot 2 wires real submission. */}
      <section
        id="etats-du-formulaire"
        aria-labelledby="etats-du-formulaire-titre"
        className="reveal-rise flex flex-col gap-4 border-t border-border pt-8"
      >
        <h2
          id="etats-du-formulaire-titre"
          className="font-heading text-[length:var(--text-section)] leading-[var(--text-section--line-height)] font-semibold"
        >
          {contact.demonstration.titre}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="etat-defaut">{contact.champs.nom}</FieldLabel>
            <FieldControl id="etat-defaut" name="etat-defaut" />
          </Field>

          <Field>
            <FieldLabel htmlFor="etat-disabled">{contact.champs.nom}</FieldLabel>
            <FieldControl id="etat-disabled" name="etat-disabled" disabled />
          </Field>

          <Field>
            <FieldLabel htmlFor="etat-loading">{contact.champs.email}</FieldLabel>
            <FieldControl
              id="etat-loading"
              name="etat-loading"
              data-loading="true"
              readOnly
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="etat-invalide">{contact.champs.email}</FieldLabel>
            <FieldControl
              id="etat-invalide"
              name="etat-invalide"
              aria-invalid="true"
              defaultValue="pas-un-email"
            />
            <FieldError>{contact.erreurs.emailInvalide}</FieldError>
          </Field>

          {/* Field's `rejected="server"` prop sets `data-rejected="server"` on
              the root — the named, ancestor-driven state distinct from the
              client-side `aria-invalid` state demonstrated above */}
          <Field rejected="server" className="sm:col-span-2">
            <FieldLabel htmlFor="etat-rejete">{contact.champs.email}</FieldLabel>
            <FieldControl
              id="etat-rejete"
              name="etat-rejete"
              defaultValue="deja.inscrit@exemple.fr"
            />
            <FieldError>{contact.erreurs.rejetServeur}</FieldError>
          </Field>
        </div>
      </section>
    </div>
  );
}

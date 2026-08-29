import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldControl,
  FieldError,
} from "@/components/ui/field";
import common from "@/locales/fr/common.json";
import connexion from "@/locales/fr/connexion.json";

export default function Connexion() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-12 px-4 py-16">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          {connexion.titre}
        </h1>
        <p className="text-muted-foreground">{connexion.intro}</p>
      </div>

      <Card>
        <CardContent>
          <form className="flex flex-col gap-5">
            <Field>
              <FieldLabel htmlFor="connexion-email">
                {connexion.champs.email}
              </FieldLabel>
              <FieldControl
                id="connexion-email"
                name="email"
                type="email"
                autoComplete="email"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="connexion-mot-de-passe">
                {connexion.champs.motDePasse}
              </FieldLabel>
              <FieldControl
                id="connexion-mot-de-passe"
                name="motDePasse"
                type="password"
                autoComplete="current-password"
              />
            </Field>

            {/* why: the reset flow is not one of the eleven signed screens —
                the label is an inert control, not a dead route (D-41). */}
            <button
              type="button"
              className="self-end text-sm text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring rounded-md"
            >
              {connexion.motDePasseOublie}
            </button>

            <Button type="submit">{common.actions.seConnecter}</Button>

            <div className="flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-border" />
              <span className="h-px flex-1 bg-border" />
            </div>

            {/* why: the Google control is inert in Lot 1 — no provider
                client, no consent-flow URL, no redirect (D-11, D-41, T-01-40). */}
            <Button type="button" variant="outline">
              <LogIn aria-hidden="true" />
              {connexion.google}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Link
            href="/inscription"
            className="text-sm text-primary hover:underline"
          >
            {connexion.pasDeCompte}
          </Link>
        </CardFooter>
      </Card>

      {/* why: D-23 names the states as a named deliverable — the three
          connexion error kinds must be visible before Lot 3 wires the
          behaviour behind them. */}
      <section
        id="connexion-etats"
        aria-labelledby="connexion-etats-titre"
        className="flex flex-col gap-6 border-t border-border pt-10"
      >
        <h2
          id="connexion-etats-titre"
          className="font-heading text-xl font-semibold text-foreground"
        >
          {common.nav.connexion}
        </h2>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="connexion-etat-identifiants">
              {connexion.champs.email}
            </FieldLabel>
            <FieldControl
              id="connexion-etat-identifiants"
              name="etat-identifiants"
              type="email"
              aria-invalid="true"
            />
            <FieldError>
              {connexion.erreurs.identifiantsInvalides}
            </FieldError>
          </Field>

          <Field data-rejected="server">
            <FieldLabel htmlFor="connexion-etat-rejet-serveur">
              {connexion.champs.email}
            </FieldLabel>
            <FieldControl
              id="connexion-etat-rejet-serveur"
              name="etat-rejet-serveur"
              type="email"
            />
            <FieldError>{connexion.erreurs.rejetServeur}</FieldError>
          </Field>

          <Field data-rejected="server">
            <FieldLabel htmlFor="connexion-etat-trop-tentatives">
              {connexion.champs.email}
            </FieldLabel>
            <FieldControl
              id="connexion-etat-trop-tentatives"
              name="etat-trop-tentatives"
              type="email"
              disabled
            />
            <FieldError>{connexion.erreurs.tropDeTentatives}</FieldError>
          </Field>
        </div>
      </section>
    </div>
  );
}

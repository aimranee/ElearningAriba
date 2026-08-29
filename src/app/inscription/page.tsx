import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import common from "@/locales/fr/common.json";
import inscription from "@/locales/fr/inscription.json";

const PROFIL_OPTIONS = Object.entries(inscription.champs.profil.options);

export default function Inscription() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-12 px-4 py-16">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          {inscription.titre}
        </h1>
        <p className="text-muted-foreground">{inscription.intro}</p>
      </div>

      <Card>
        <CardContent>
          <form className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="inscription-prenom">
                  {inscription.champs.prenom}
                </FieldLabel>
                <FieldControl
                  id="inscription-prenom"
                  name="prenom"
                  autoComplete="given-name"
                />
                <FieldDescription>
                  {inscription.aideParChamp.prenom}
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="inscription-nom">
                  {inscription.champs.nom}
                </FieldLabel>
                <FieldControl
                  id="inscription-nom"
                  name="nom"
                  autoComplete="family-name"
                />
                <FieldDescription>
                  {inscription.aideParChamp.nom}
                </FieldDescription>
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
              />
              <FieldDescription>
                {inscription.aideParChamp.email}
              </FieldDescription>
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
                />
                <FieldDescription>
                  {inscription.aideParChamp.motDePasse}
                </FieldDescription>
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
                />
                <FieldDescription>
                  {inscription.aideParChamp.confirmation}
                </FieldDescription>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="inscription-profil">
                {inscription.champs.profil.libelle}
              </FieldLabel>
              <FieldControl
                id="inscription-profil"
                name="profil"
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
            </Field>

            <p className="text-muted-foreground text-sm">
              {inscription.conditions}
            </p>

            <Button type="submit">{common.actions.sInscrire}</Button>
          </form>
        </CardContent>
        <CardFooter>
          <Link
            href="/connexion"
            className="text-sm text-primary hover:underline"
          >
            {inscription.dejaInscrit}
          </Link>
        </CardFooter>
      </Card>

      {/* why: D-23 names the states as a named deliverable — the client
          validates the field family's error kinds here, not just the happy
          path, so Lot 3 inherits an already-validated visual contract. */}
      <section
        id="inscription-etats"
        aria-labelledby="inscription-etats-titre"
        className="flex flex-col gap-6 border-t border-border pt-10"
      >
        <h2
          id="inscription-etats-titre"
          className="font-heading text-xl font-semibold text-foreground"
        >
          {common.nav.inscription}
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="inscription-etat-defaut">
              {inscription.champs.email}
            </FieldLabel>
            <FieldControl
              id="inscription-etat-defaut"
              name="etat-defaut"
              type="email"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="inscription-etat-disabled">
              {inscription.champs.email}
            </FieldLabel>
            <FieldControl
              id="inscription-etat-disabled"
              name="etat-disabled"
              type="email"
              disabled
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="inscription-etat-loading">
              {inscription.champs.email}
            </FieldLabel>
            <FieldControl
              id="inscription-etat-loading"
              name="etat-loading"
              type="email"
              data-loading="true"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="inscription-etat-invalide">
              {inscription.champs.email}
            </FieldLabel>
            <FieldControl
              id="inscription-etat-invalide"
              name="etat-invalide"
              type="email"
              aria-invalid="true"
              defaultValue="pas-un-email"
            />
            <FieldError>{inscription.erreurs.emailInvalide}</FieldError>
          </Field>

          <Field data-rejected="server">
            <FieldLabel htmlFor="inscription-etat-rejet-serveur">
              {inscription.champs.email}
            </FieldLabel>
            <FieldControl
              id="inscription-etat-rejet-serveur"
              name="etat-rejet-serveur"
              type="email"
              defaultValue="deja@utilise.fr"
            />
            <FieldError>{inscription.erreurs.rejetServeur}</FieldError>
          </Field>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{inscription.succes.titre}</CardTitle>
            <CardDescription>{inscription.succes.message}</CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
}

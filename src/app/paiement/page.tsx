import paiement from "@/locales/fr/paiement.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/i18n/fr";

/* why: Lot 7 owns the real order and payment provider; the chosen formule
   below is a maquette-only constant, replaced wholesale in that lot */
const formuleChoisieMaquette = paiement.formules[1];

export default function Paiement() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          {paiement.titre}
        </h1>
        <p className="text-muted-foreground">{paiement.intro}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {paiement.formules.map((formule) => (
          <Card key={formule.id}>
            <CardHeader>
              <p className="font-heading text-base font-semibold">
                {formule.libelle}
              </p>
              <p className="text-muted-foreground text-sm">
                {formule.description}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <ul className="text-sm">
                {formule.inclus.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="font-heading text-lg font-semibold">
                {formatCurrency(formule.prix)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card variant="outline">
        <CardHeader>
          <p className="font-heading text-base font-semibold">
            {paiement.recapitulatif.formule}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">{paiement.recapitulatif.formule}</p>
            <p>{formuleChoisieMaquette.libelle}</p>
          </div>
          <div>
            <p className="text-muted-foreground">
              {paiement.recapitulatif.contenuInclus}
            </p>
            <ul>
              {formuleChoisieMaquette.inclus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-muted-foreground">{paiement.recapitulatif.montant}</p>
            <p className="font-heading text-lg font-semibold">
              {formatCurrency(formuleChoisieMaquette.prix)}
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-sm">{paiement.consentement}</p>

      {/* why: no provider SDK, redirect URL or publishable key exists (D-04,
          D-32) — this button describes a handoff to an external secure page
          and navigates nowhere; Lot 7 is the only lot that names a provider */}
      <Button variant="default" className="w-fit">
        {paiement.action.payer}
      </Button>

      <p className="text-muted-foreground text-sm">{paiement.securite}</p>

      <section aria-label={paiement.echecHandoff.titre}>
        <EmptyState tone="error">
          <EmptyStateTitle>{paiement.echecHandoff.titre}</EmptyStateTitle>
          <EmptyStateDescription>
            {paiement.echecHandoff.message}
          </EmptyStateDescription>
          <EmptyStateAction>
            <Button variant="secondary">{paiement.echecHandoff.reessayer}</Button>
          </EmptyStateAction>
        </EmptyState>
      </section>
    </div>
  );
}

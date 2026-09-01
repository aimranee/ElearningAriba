import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SuppressionCompte } from "@/components/compte/suppression-compte";
import { requireLearner } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/i18n/fr";
import donnees from "@/locales/fr/donnees.json";

export default async function DonneesPersonnelles() {
  await requireLearner();

  const supabase = await createClient();
  const { data: demande } = await supabase
    .from("demande_suppression")
    .select("demandee_le")
    .eq("statut", "enregistree")
    .maybeSingle();

  return (
    <div className="flex flex-col gap-8 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          {donnees.titre}
        </h1>
        <p className="text-muted-foreground">{donnees.intro}</p>
      </div>

      {/* why (D-A12): the export card is first in DOM order and carries the
          page's only accent button — routine, reversible, safe to click. */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>{donnees.export.titre}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{donnees.export.message}</p>
          <Button
            render={<Link href="/api/rgpd/export" />}
            nativeButton={false}
            className="h-11 self-start"
          >
            {donnees.export.action}
          </Button>
        </CardContent>
      </Card>

      {/* why (D-A12): the deletion card is second and deliberately quieter —
          giving the irreversible action the same prominence as the routine
          one is how accidental deletions happen. */}
      <Card variant="muted">
        <CardHeader>
          <CardTitle>{donnees.suppression.titre}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{donnees.suppression.message}</p>
          <SuppressionCompte
            demandeDejaEnCours={Boolean(demande)}
            dateDemandeExistante={
              demande ? formatDate(new Date(demande.demandee_le)) : null
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

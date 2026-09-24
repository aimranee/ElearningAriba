import Link from "next/link";
import { PhoneCall } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatMinutes } from "@/lib/i18n/fr";
import agenda from "@/locales/fr/agenda.json";
import common from "@/locales/fr/common.json";
import formation from "@/locales/fr/formation.json";

export const RDV_DECOUVERTE_HREF = "/reservation?type=decouverte";

/* why: the discovery call's length is read from agenda.json's bootstrap
   row, the same way barre-reservation.tsx does — the copy template carries
   a {duree} slot rather than a hand-written "30 min". */
export function texteAideRdv(): string {
  const decouverte = agenda.typesRendezVous[0];
  return formation.aide.texte.replace(
    "{duree}",
    decouverte ? formatMinutes(decouverte.dureeMinutes) : "",
  );
}

/**
 * The helper tile beside the programme (#27 § 8): stays in view while the
 * cards scroll at lg and above. Below that width the call moves to the
 * fixed bottom bar (barre-rdv.tsx); the page decides which one renders.
 */
function AideRdv({ className }: { className?: string }) {
  return (
    <Card
      variant="raised"
      data-slot="aide-rdv"
      className={cn("gap-3 px-5 py-5", className)}
    >
      <span
        aria-hidden="true"
        className="flex size-[42px] items-center justify-center rounded-[13px] text-white"
        style={{ background: "linear-gradient(135deg, var(--violet), var(--indigo))" }}
      >
        <PhoneCall aria-hidden="true" className="size-5" />
      </span>
      <p className="font-heading text-[length:var(--text-lead)] leading-[var(--text-lead--line-height)] font-bold text-[var(--ink)]">
        {formation.aide.titre}
      </p>
      <p className="text-[length:var(--text-small)] leading-[var(--text-small--line-height)] text-[var(--muted-ink)]">
        {texteAideRdv()}
      </p>
      <Button
        render={<Link href={RDV_DECOUVERTE_HREF} />}
        nativeButton={false}
        size="lg"
        className="mt-1 min-h-11 w-full"
      >
        {common.actions.prendreRdv}
      </Button>
    </Card>
  );
}

export { AideRdv };

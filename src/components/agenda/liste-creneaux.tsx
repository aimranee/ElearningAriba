"use client";

import { useState } from "react";
import { Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { type Creneau, grouperMatinApresMidi } from "@/lib/agenda/creneaux";
import { formatDateAvecJour, formatTime } from "@/lib/i18n/fr";
import type { Locale } from "@/lib/i18n/locale";
import type { Messages } from "@/lib/i18n/messages";

const VISIBLE_PAR_DEFAUT = 6;

/* why (#24): the list's text, in the page's language, handed down by the
   server page through the booker — this island imports no copy of its own. */
export type ListeCreneauxTexte = Pick<
  Messages<"agenda">,
  "aucunCreneau" | "matin" | "apresMidi" | "voirPlus" | "confiance"
> & { photoSlot: Messages<"common">["photoSlot"] };

type ListeCreneauxProps = {
  locale: Locale;
  texte: ListeCreneauxTexte;
  jour: string | null;
  creneaux: Creneau[];
  creneauChoisiDebut: string | null;
  onChoisirCreneau: (creneau: Creneau) => void;
};

/*
 * why (CONTEXT § trust signals): the trust signals sit adjacent to the slot
 * choice, never louder than it — the trainer's photo, the "confirmation
 * immédiate" promise and the D-11 no-self-service-cancellation rule. All
 * three come from agenda.json/common.json (through `texte`), never a
 * hardcoded string.
 */
export function ListeCreneaux({
  locale,
  texte,
  jour,
  creneaux,
  creneauChoisiDebut,
  onChoisirCreneau,
}: ListeCreneauxProps) {
  const [toutAfficher, setToutAfficher] = useState(false);

  if (!jour || creneaux.length === 0) {
    return (
      <EmptyState tone="waiting">
        <EmptyStateTitle>{texte.aucunCreneau.titre}</EmptyStateTitle>
        <EmptyStateDescription>{texte.aucunCreneau.message}</EmptyStateDescription>
        <EmptyStateAction>
          <Button variant="secondary">{texte.aucunCreneau.action}</Button>
        </EmptyStateAction>
      </EmptyState>
    );
  }

  const { matin, apresMidi } = grouperMatinApresMidi(creneaux);
  const total = matin.length + apresMidi.length;
  const visibleTotal = toutAfficher ? total : Math.min(VISIBLE_PAR_DEFAUT, total);
  const matinVisible = matin.slice(0, visibleTotal);
  const apresMidiVisible = apresMidi.slice(
    0,
    Math.max(0, visibleTotal - matin.length),
  );
  const masques = total - (matinVisible.length + apresMidiVisible.length);

  return (
    <div className="flex flex-col gap-4">
      <p className="font-heading text-base font-semibold capitalize">
        {formatDateAvecJour(new Date(`${jour}T12:00:00Z`), locale)}
      </p>

      {matinVisible.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm font-medium">{texte.matin}</p>
          <div className="flex flex-wrap gap-2">
            {matinVisible.map((creneau) => (
              <ChipCreneau
                key={creneau.debut.toISOString()}
                creneau={creneau}
                locale={locale}
                selectionne={creneauChoisiDebut === creneau.debut.toISOString()}
                onClick={() => onChoisirCreneau(creneau)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {apresMidiVisible.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm font-medium">
            {texte.apresMidi}
          </p>
          <div className="flex flex-wrap gap-2">
            {apresMidiVisible.map((creneau) => (
              <ChipCreneau
                key={creneau.debut.toISOString()}
                creneau={creneau}
                locale={locale}
                selectionne={creneauChoisiDebut === creneau.debut.toISOString()}
                onClick={() => onChoisirCreneau(creneau)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {masques > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-11 self-start"
          onClick={() => setToutAfficher(true)}
        >
          {texte.voirPlus}
        </Button>
      ) : null}

      <div className="mt-2 flex flex-col gap-3 border-t border-[var(--hairline)] pt-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--hairline-2)] bg-[var(--tint)] text-[var(--violet)]"
          >
            <Camera className="size-5" />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold tracking-wide text-[var(--violet)] uppercase">
              {texte.photoSlot.label}
            </span>
            <p className="text-muted-foreground text-sm">
              {texte.photoSlot.description}
            </p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">{texte.confiance.confirmation}</p>
        <p className="text-muted-foreground text-sm">{texte.confiance.modification}</p>
      </div>
    </div>
  );
}

function ChipCreneau({
  creneau,
  locale,
  selectionne,
  onClick,
}: {
  creneau: Creneau;
  locale: Locale;
  selectionne: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selectionne}
      className={cn(
        "flex h-11 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        selectionne
          ? "bg-primary text-primary-foreground"
          : "bg-primary/10 text-primary hover:bg-primary/20 focus-visible:bg-primary/20",
      )}
    >
      {formatTime(creneau.debut, locale)}
    </button>
  );
}

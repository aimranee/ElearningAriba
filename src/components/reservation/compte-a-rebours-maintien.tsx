"use client";

import { useEffect, useState } from "react";

import reservation from "@/locales/fr/reservation.json";
import { Button } from "@/components/ui/button";
import { Message } from "@/components/ui/message";
import { maintienRestant } from "@/lib/agenda/creneaux";

type CompteAReboursProps = {
  expireLe: Date;
  onChoisirAutreHoraire: () => void;
};

/*
 * why (D-27, D-03): a lapsed countdown must never block the commit button —
 * only the database knows whether the slot is gone, and if nobody took it
 * the commit still succeeds. This component only ever informs; it never
 * disables anything. --muted/info semantics, never destructive: an expired
 * hold is not a system failure.
 */
export function CompteARebours({
  expireLe,
  onChoisirAutreHoraire,
}: CompteAReboursProps) {
  const [restant, setRestant] = useState<number | null>(null);

  // why (contact-form.tsx idiom): the mount-time value is set inside an
  // effect, not during render, so the server render and the first client
  // render both start from "unknown" rather than disagreeing on the clock.
  useEffect(() => {
    function tick() {
      setRestant(maintienRestant(expireLe, new Date()));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expireLe]);

  if (restant === null) return null;

  if (restant <= 0) {
    return (
      <div className="flex flex-col gap-2">
        <Message variant="info">
          {reservation.maintien.expireTitre} {reservation.maintien.expireMessage}
        </Message>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-11 w-fit"
          onClick={onChoisirAutreHoraire}
        >
          {reservation.actions.choisirAutreHoraire}
        </Button>
      </div>
    );
  }

  const minutes = Math.floor(restant / 60);
  const secondes = restant % 60;

  return (
    <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
      {reservation.maintien.restant
        .replace("{minutes}", String(minutes))
        .replace("{secondes}", String(secondes).padStart(2, "0"))}
    </p>
  );
}

"use client";
/* why (brief §C): mobile sticky booking bar (<1024px). Visible once the hero
   has fully left the viewport, hidden again while the reservation section
   (cta-final) or the footer is in view — three IntersectionObservers, zero
   `window` scroll listeners (D-39's budget belongs to ScrollProgress alone).
   State lives in plain module-scope booleans + direct DOM writes (matching
   the rest of the motion kit, e.g. assembly-card.tsx) rather than
   useState-driven re-renders. When hidden, `visibility` flips only after the
   hide transition completes (transitionend), so the bar cannot receive
   keyboard focus while off-screen — a bare opacity/transform toggle would
   leave it focusable underneath. */

import { useEffect, useRef } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import common from "@/locales/fr/common.json";
import agenda from "@/locales/fr/agenda.json";

function BarreReservation() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = rootRef.current;
    const hero = document.querySelector('[data-slot="hero"]');
    const reservation = document.querySelector('[data-section="reservation"]');
    const footer = document.querySelector("footer");
    if (!node || !hero) {
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let heroOut = false;
    let blocked = false;

    function render() {
      const show = heroOut && !blocked;
      node!.classList.toggle("translate-y-0", show);
      node!.classList.toggle("translate-y-[110%]", !show);
      if (show) {
        node!.classList.remove("invisible");
      } else if (reduce) {
        node!.classList.add("invisible");
      }
      // else: the transitionend handler below removes visibility once the
      // hide transition finishes.
    }

    function onTransitionEnd(event: TransitionEvent) {
      if (event.propertyName === "transform" && !(heroOut && !blocked)) {
        node!.classList.add("invisible");
      }
    }

    const heroObserver = new IntersectionObserver(
      (entries) => {
        heroOut = !entries[0]?.isIntersecting;
        render();
      },
      { threshold: 0 }
    );
    heroObserver.observe(hero);

    const blockers = [reservation, footer].filter((el): el is Element => el !== null);
    const blockState = new Map<Element, boolean>();
    const blockObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => blockState.set(entry.target, entry.isIntersecting));
        blocked = Array.from(blockState.values()).some(Boolean);
        render();
      },
      { threshold: 0.05 }
    );
    blockers.forEach((el) => blockObserver.observe(el));

    node.addEventListener("transitionend", onTransitionEnd);

    return () => {
      heroObserver.disconnect();
      blockObserver.disconnect();
      node.removeEventListener("transitionend", onTransitionEnd);
    };
  }, []);

  const decouverte = agenda.typesRendezVous[0];

  return (
    <div
      ref={rootRef}
      className="invisible fixed inset-x-0 bottom-0 z-[45] translate-y-[110%] border-t border-[var(--hairline)] bg-white/[.88] px-4 pt-[0.7rem] pb-[calc(0.7rem+env(safe-area-inset-bottom))] shadow-[0_-12px_30px_-20px_rgba(10,37,64,.4)] backdrop-blur-[18px] transition-transform duration-[450ms] ease-[var(--ease-brand)] lg:hidden"
    >
      <Button render={<Link href="/reservation" />} nativeButton={false} size="lg" className="w-full">
        {common.actions.prendreRdv}
      </Button>
      {decouverte ? (
        <p className="mt-[0.35rem] text-center text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] text-[var(--muted-ink)]">
          {decouverte.libelle} · {decouverte.dureeMinutes} min
        </p>
      ) : null}
    </div>
  );
}

export { BarreReservation };

"use client";
/* why (#27 § 8): below md the helper tile becomes a fixed bottom bar. It
   mirrors barre-reservation.tsx's mechanism — IntersectionObserver on the
   page header block, direct DOM writes, `visibility` flipped only once the
   hide transition ends so the link is never focusable off-screen. Two
   differences: no slide-in under reduced motion (the transition is removed,
   visibility toggles directly), and the bar reserves its own height as body
   padding through a ResizeObserver so the page's last element scrolls
   clear of it — a fixed bar over the footer would otherwise cover it. */

import { useEffect, useRef } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import common from "@/locales/fr/common.json";
import formation from "@/locales/fr/formation.json";

type BarreRdvProps = {
  href: string;
  texte: string;
};

function BarreRdv({ href, texte }: BarreRdvProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }
    const entete = document.querySelector('[data-section="formation-entete"]');
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let enteteOut = entete === null;

    function render() {
      const show = enteteOut;
      node!.classList.toggle("translate-y-0", show);
      node!.classList.toggle("translate-y-[110%]", !show);
      if (show) {
        node!.classList.remove("invisible");
      } else if (reduce) {
        node!.classList.add("invisible");
      }
    }

    function onTransitionEnd(event: TransitionEvent) {
      if (event.target !== node) {
        return;
      }
      if (
        (event.propertyName === "translate" || event.propertyName === "transform") &&
        !enteteOut
      ) {
        node!.classList.add("invisible");
      }
    }

    const enteteObserver = entete
      ? new IntersectionObserver(
          (entries) => {
            enteteOut = !entries[0]?.isIntersecting;
            render();
          },
          { threshold: 0 },
        )
      : null;
    enteteObserver?.observe(entete!);
    if (!enteteObserver) {
      render();
    }

    // why: `md:hidden` collapses the bar to display:none above 767px, where
    // the observed height is 0 — the padding follows the bar's real height
    // and vanishes with it, no width media query duplicated in JS.
    const sizeObserver = new ResizeObserver(() => {
      document.body.style.paddingBottom = `${Math.ceil(node!.getBoundingClientRect().height)}px`;
    });
    sizeObserver.observe(node);

    node.addEventListener("transitionend", onTransitionEnd);

    return () => {
      enteteObserver?.disconnect();
      sizeObserver.disconnect();
      node.removeEventListener("transitionend", onTransitionEnd);
      document.body.style.paddingBottom = "";
    };
  }, []);

  return (
    <div
      ref={rootRef}
      data-slot="barre-rdv"
      className="invisible fixed inset-x-0 bottom-0 z-[45] translate-y-[110%] border-t border-[var(--hairline)] bg-white/[.92] px-4 pt-[0.7rem] pb-[calc(0.7rem+env(safe-area-inset-bottom))] shadow-[0_-12px_30px_-20px_rgba(10,37,64,.4)] backdrop-blur-[18px] transition-transform duration-[450ms] ease-[var(--ease-brand)] motion-reduce:transition-none md:hidden"
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[length:var(--text-small)] leading-[var(--text-small--line-height)] font-semibold text-[var(--ink)]">
            {formation.aide.titre}
          </p>
          <p className="text-[length:var(--text-micro)] leading-[var(--text-micro--line-height)] text-[var(--muted-ink)]">
            {texte}
          </p>
        </div>
        <Button
          render={<Link href={href} />}
          nativeButton={false}
          size="lg"
          className="min-h-11 shrink-0"
        >
          {common.actions.prendreRdv}
        </Button>
      </div>
    </div>
  );
}

export { BarreRdv };

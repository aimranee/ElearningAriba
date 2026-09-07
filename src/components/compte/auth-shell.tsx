import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import common from "@/locales/fr/common.json";
import landing from "@/locales/fr/landing.json";

/* why: the centred title-block-then-card chrome (connexion/page.tsx:16-22)
   is repeated on all five Lot 3 auth surfaces (inscription, connexion,
   mot-de-passe-oublie, nouveau-mot-de-passe, espace/profil is its own
   dynamic shell) — extracted alongside the read-only design system, never
   by modifying it (D-04). Composition only: no new token, no new variant.
   Auth v2 (brief §C-01/C-02/C-03): recomposed as a two-column layout, a
   sticky night panel beside the form column, `entete`/`illustration` added
   as optional props so all four pages still compile before they are wired. */
type AuthShellProps = {
  titre: string;
  intro: string;
  entete?: string;
  illustration?: ReactNode;
  largeur?: "md" | "2xl";
  children: ReactNode;
};

function renderTitre(titre: string) {
  const splitAt = titre.indexOf(". ");
  if (splitAt === -1) return titre;
  const premiere = titre.slice(0, splitAt + 1);
  const reste = titre.slice(splitAt + 2);
  return (
    <>
      {premiere}
      <span className="bg-clip-text text-transparent bg-[linear-gradient(100deg,var(--violet-l)_0%,var(--azur-soft)_100%)]">
        {" "}
        {reste}
      </span>
    </>
  );
}

export function AuthShell({
  titre,
  intro,
  entete,
  illustration,
  largeur = "md",
  children,
}: AuthShellProps) {
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,44fr)_minmax(0,56fr)] lg:min-h-[calc(100svh-76px)]">
      <aside
        data-slot="auth-panel"
        className="relative overflow-hidden text-white bg-[linear-gradient(180deg,var(--night-2),var(--night)_70%)] before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:[background-image:radial-gradient(circle,var(--grid-dot-night)_1px,transparent_1.6px)] before:[background-size:26px_26px] before:[mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000_30%,transparent_80%)] before:[-webkit-mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000_30%,transparent_80%)] after:pointer-events-none after:absolute after:inset-0 after:content-[''] after:[background:radial-gradient(40%_45%_at_8%_0%,rgba(99,91,255,.38),transparent_70%),radial-gradient(35%_40%_at_100%_100%,rgba(15,126,166,.35),transparent_70%)]"
      >
        <div
          data-slot="auth-panel-inner"
          className="relative z-[1] flex flex-col justify-center-safe gap-4 pt-9 px-5 pb-10 lg:sticky lg:top-[76px] lg:min-h-[calc(100svh-76px)] lg:gap-[1.4rem] lg:px-[clamp(1.5rem,4.5vw,4.25rem)] lg:py-[clamp(2.5rem,5vw,4.5rem)]"
        >
          <Reveal className="flex flex-col gap-4">
            <p className="inline-flex items-center gap-[0.55rem] text-[length:var(--text-micro)] leading-none font-bold uppercase tracking-[.18em] text-[var(--azur-soft)]">
              <span
                aria-hidden="true"
                className="h-0.5 w-[22px] bg-[linear-gradient(90deg,var(--violet-l),var(--azur-soft))]"
              />
              {common.metadata.title}
            </p>
            <h1 className="text-[clamp(1.5rem,1.2rem+1.6vw,1.9rem)] lg:text-[length:var(--text-title)] font-bold leading-[1.12] tracking-[-.025em] text-white">
              {renderTitre(titre)}
            </h1>
          </Reveal>

          {illustration ? (
            <Reveal dataD={1} className="hidden lg:block">
              {illustration}
              <p className="mt-[0.7rem] text-[length:var(--text-micro)] text-white/62">
                {landing.formatModalites.apercu.nonContractuel}
              </p>
            </Reveal>
          ) : null}
        </div>
      </aside>

      <div className="flex items-center justify-center px-5 pt-9 pb-14 lg:px-5 lg:py-[clamp(2.5rem,6vw,5rem)]">
        <div
          className={cn(
            "w-full flex flex-col gap-5",
            largeur === "2xl" ? "max-w-[32rem]" : "max-w-[26rem]"
          )}
        >
          {entete ? (
            <h2 className="text-[length:var(--text-section)] font-bold tracking-[-.02em] leading-[1.3] text-foreground">
              {entete}
            </h2>
          ) : null}
          <p className="text-muted-foreground">{intro}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

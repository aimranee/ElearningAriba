import { User, TrendingUp, FileText } from "lucide-react";

import common from "@/locales/fr/common.json";

/**
 * Auth v2 panel illustration (brief §C-02, maquette `.window`): a decorative
 * "learner space" window preview beside the connexion form — mirrors
 * mini-calendrier.tsx's shape, aria-hidden, no fetch, no real account data.
 */
function EspaceFenetre() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative overflow-hidden rounded-[22px] bg-[var(--night)] text-white shadow-[var(--shadow-2),0_0_0_1px_var(--glass-line)]"
    >
      <div className="flex items-center gap-[0.4rem] border-b border-white/10 px-[0.9rem] py-[0.75rem]">
        <span className="size-2.5 rounded-full" style={{ background: "#FF5F57" }} />
        <span className="size-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
        <span className="size-2.5 rounded-full" style={{ background: "#28C840" }} />
        <span className="ml-2 min-w-0 flex-1 truncate whitespace-nowrap text-[length:var(--text-micro)] font-semibold text-white/60">
          {`${common.nav.espace} · ${common.metadata.title}`}
        </span>
        <span className="ml-auto inline-flex flex-none items-center gap-[0.4rem] whitespace-nowrap rounded-full bg-[color-mix(in_srgb,var(--live)_18%,transparent)] px-[0.6rem] py-[0.25rem] text-[length:var(--text-micro)] font-extrabold uppercase tracking-[0.06em] text-white/90">
          <span
            aria-hidden="true"
            className="size-[7px] rounded-full bg-[var(--live)]"
            style={{ animation: "pulse-live 1.8s var(--ease-brand) infinite" }}
          />
          En direct
        </span>
      </div>

      <div className="bg-[linear-gradient(180deg,var(--night-2),var(--night))] p-[1.15rem]">
        <div className="rounded-2xl bg-white p-[1.1rem] text-[var(--ink)] shadow-[var(--shadow-1)]">
          <span className="inline-flex items-center gap-[0.4rem] rounded-full bg-[var(--lav)] px-[0.6rem] py-[0.25rem] text-[length:var(--text-micro)] font-extrabold uppercase tracking-[0.08em] text-[var(--deep)]">
            Prochaine session
          </span>
          <h3 className="mt-[0.6rem] text-[length:var(--text-card)] font-bold tracking-[-.02em] leading-[1.3]">
            Votre créneau réservé
          </h3>
          <div className="mt-[0.55rem] flex flex-wrap gap-[0.4rem_0.9rem] text-[length:var(--text-small)] text-[var(--muted-ink)]">
            <b className="text-[var(--ink)]">Session individuelle</b>
            <span>Découverte de l&apos;écosystème Ariba</span>
          </div>
          <span className="mt-[0.6rem] inline-flex items-center gap-[0.3rem] rounded-full bg-success-muted px-[0.55rem] py-[0.25rem] text-[length:var(--text-micro)] font-extrabold text-[var(--mint-ink)]">
            <svg
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-[11px]"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
            Confirmé
          </span>
          <span className="mt-[0.9rem] inline-flex h-9 items-center justify-center gap-[0.6rem] rounded-full bg-primary px-4 text-[length:var(--text-micro)] font-bold text-primary-foreground shadow-[var(--shadow-brand)] pointer-events-none select-none whitespace-nowrap">
            Rejoindre la session
          </span>
        </div>

        <div data-slot="fenetre-puces" className="mt-[0.8rem] flex flex-wrap gap-[0.5rem]">
          <span className="inline-flex items-center gap-[0.4rem] rounded-[12px] border border-white/10 bg-white/[0.07] px-[0.7rem] py-[0.4rem] text-[length:var(--text-micro)] font-semibold text-white/80">
            <User aria-hidden="true" className="size-[13px]" />
            Formateur
          </span>
          <span className="inline-flex items-center gap-[0.4rem] rounded-[12px] border border-white/10 bg-white/[0.07] px-[0.7rem] py-[0.4rem] text-[length:var(--text-micro)] font-semibold text-white/80">
            <TrendingUp aria-hidden="true" className="size-[13px]" />
            Progression
          </span>
          <span className="inline-flex items-center gap-[0.4rem] rounded-[12px] border border-white/10 bg-white/[0.07] px-[0.7rem] py-[0.4rem] text-[length:var(--text-micro)] font-semibold text-white/80">
            <FileText aria-hidden="true" className="size-[13px]" />
            Support PDF du module
          </span>
        </div>
      </div>
    </div>
  );
}

export { EspaceFenetre };

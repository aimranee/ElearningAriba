import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { FOCUS_RING } from "@/lib/utils";
import common from "@/locales/fr/common.json";

// why (PUB-12): every visible label reads from common.nav — never a literal
// string (CLAUDE.md) — so the header can reach five public routes in one
// click, with the footer covering the rest (D-41).
const NAV_LINK_CLASS = `text-sm text-foreground/80 hover:text-foreground ${FOCUS_RING}`;

const MOBILE_LINKS = [
  { href: "/programme", label: common.nav.programme },
  { href: "/formation", label: common.nav.formation },
  { href: "/a-propos", label: common.nav.aPropos },
  { href: "/contact", label: common.nav.contact },
  { href: "/connexion", label: common.nav.connexion },
] as const;

/**
 * Presentational only — no active-route computation, no client state.
 * Lot 1 route shells only; Lot 3 owns auth (D-38).
 */
export function Header() {
  return (
    <header
      data-slot="site-header"
      className={
        // why: fully transparent at rest — no background, blur, or shadow —
        // so the header reads as part of the hero atmosphere until the page
        // actually scrolls (D-18/AC-6). before: is a readability safety net,
        // not decoration: it darkens the top ~76px just enough for navy ink
        // to hold over whatever scrolls beneath, and fades out once the
        // opaque veil below takes over.
        "before:absolute before:inset-0 before:content-[''] before:pointer-events-none " +
        "before:bg-[linear-gradient(180deg,rgba(252,252,255,.55),rgba(252,252,255,0))] " +
        "before:opacity-100 before:transition-opacity before:duration-[450ms] before:ease-[var(--ease-brand)] " +
        "data-[scrolled=true]:before:opacity-0 " +
        "fixed inset-x-0 top-0 z-50 h-[76px] bg-transparent backdrop-blur-none shadow-none " +
        "transition-[background-color,box-shadow,backdrop-filter] duration-[450ms] ease-[var(--ease-brand)] " +
        /* why (D-18/AC-6): the header deepens past 12px of scroll — the
           three properties below are the applied delta, not a bare class
           toggle with no visual change (scroll-progress.tsx owns the
           data-scrolled write). */
        "data-[scrolled=true]:bg-[rgba(252,252,255,.72)] " +
        "data-[scrolled=true]:backdrop-blur-[28px] data-[scrolled=true]:backdrop-saturate-[1.7] " +
        "data-[scrolled=true]:shadow-[0_1px_0_var(--hairline),0_18px_40px_-30px_rgba(10,37,64,.34)]"
      }
    >
      <div className="relative z-[1] mx-auto flex h-full max-w-[1200px] items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className={`inline-flex min-w-0 items-center gap-[0.6rem] ${FOCUS_RING}`}
        >
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-[9px] text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg,var(--violet),var(--indigo))" }}
          >
            A
          </span>
          {/* why: min-w-0 + truncate on the wordmark, not the pastille — the
              anchor sits between two fixed-width neighbors (burger, CTA) in a
              nowrap flex row, so at 375px the text yields space rather than
              pushing the burger past the viewport edge (checks 10/11). */}
          <span className="truncate font-heading text-lg font-semibold text-foreground">
            {common.metadata.title}
          </span>
        </Link>

        <nav
          aria-label={common.metadata.title}
          className="hidden items-center gap-6 min-[1000px]:flex"
        >
          <Link href="/programme" className={NAV_LINK_CLASS}>
            {common.nav.programme}
          </Link>
          <Link href="/formation" className={NAV_LINK_CLASS}>
            {common.nav.formation}
          </Link>
          <Link href="/a-propos" className={NAV_LINK_CLASS}>
            {common.nav.aPropos}
          </Link>
          <Link href="/contact" className={NAV_LINK_CLASS}>
            {common.nav.contact}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* why: Connexion returns to being a plain link on a transparent
              header — a pill floating on nothing reads poorly without a
              background under it. */}
          <Link
            href="/connexion"
            className={`hidden text-sm font-semibold text-[var(--ink-soft)] transition-colors duration-300 ease-[var(--ease-brand)] hover:text-[var(--violet)] min-[1000px]:inline-flex ${FOCUS_RING}`}
          >
            {common.nav.connexion}
          </Link>
          {/* why: "Prendre RDV" is the only colored anchor left on a
              transparent bar, so it stays visible at every width — only its
              arrow chip (which doubles the button's footprint) hides below
              1000px, otherwise the burger is pushed past the viewport edge
              at 375px. */}
          <Button
            render={<Link href="/reservation" />}
            nativeButton={false}
            data-magnetic="true"
            className="h-11 gap-[0.7rem] rounded-full pr-1.5 pl-5 text-sm font-bold"
          >
            {common.actions.prendreRdv}
            <span
              aria-hidden="true"
              className="hidden size-[30px] shrink-0 items-center justify-center rounded-full bg-white/[.22] transition-[background-color,transform] duration-300 ease-[var(--ease-brand)] group-hover/button:translate-x-0.5 group-hover/button:bg-white/[.34] min-[1000px]:flex"
            >
              <ArrowRight className="size-[15px]" />
            </span>
          </Button>
        </div>

        <MobileNav links={MOBILE_LINKS} />
      </div>
    </header>
  );
}

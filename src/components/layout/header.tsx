import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { FOCUS_RING } from "@/lib/utils";
import common from "@/locales/fr/common.json";

// why (PUB-12): every visible label reads from common.nav — never a literal
// string (CLAUDE.md) — so the header can reach five public routes in one
// click, with the footer covering the rest (D-41).
const NAV_LINK_CLASS = `text-sm text-foreground/80 hover:text-foreground ${FOCUS_RING}`;

const MOBILE_LINKS = [
  { href: "/", label: common.nav.accueil },
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
        "fixed inset-x-0 top-0 z-50 h-[76px] bg-[rgba(252,252,255,.55)] backdrop-blur-[10px] backdrop-saturate-[1.25] " +
        "transition-[background-color,box-shadow,backdrop-filter] duration-[400ms] ease-[var(--ease-brand)] " +
        /* why (D-18/AC-6): the header deepens past 12px of scroll — the
           three properties below are the applied delta, not a bare class
           toggle with no visual change (scroll-progress.tsx owns the
           data-scrolled write). */
        "data-[scrolled=true]:bg-[rgba(252,252,255,.82)] " +
        "data-[scrolled=true]:backdrop-blur-[20px] data-[scrolled=true]:backdrop-saturate-[1.45] " +
        "data-[scrolled=true]:shadow-[0_1px_0_rgba(10,37,64,.06),0_12px_30px_-24px_rgba(10,37,64,.3)]"
      }
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className={`font-heading text-lg font-semibold text-foreground ${FOCUS_RING}`}
        >
          {common.metadata.title}
        </Link>

        <nav
          aria-label={common.metadata.title}
          className="hidden items-center gap-6 min-[1000px]:flex"
        >
          <Link href="/" className={NAV_LINK_CLASS}>
            {common.nav.accueil}
          </Link>
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

        <div className="hidden items-center gap-3 min-[1000px]:flex">
          <Button
            render={<Link href="/connexion" />}
            nativeButton={false}
            variant="ghost"
            size="sm"
          >
            {common.nav.connexion}
          </Button>
          <Button
            render={<Link href="/inscription" />}
            nativeButton={false}
            size="sm"
            data-magnetic="true"
          >
            {common.actions.demarrer}
          </Button>
        </div>

        <MobileNav links={MOBILE_LINKS} />
      </div>
    </header>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FOCUS_RING } from "@/lib/utils";
import common from "@/locales/fr/common.json";

const NAV_LINKS = [
  { href: "/programme", label: common.nav.programme },
  { href: "/formation", label: common.nav.formation },
  { href: "/a-propos", label: common.nav.aPropos },
  { href: "/contact", label: common.nav.contact },
] as const;

/**
 * Presentational only — no active-route computation, no client state.
 * PUB-12's navigation behaviour lands in Lot 2 (D-41).
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

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm text-foreground/80 hover:text-foreground ${FOCUS_RING}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/connexion"
            className={`text-sm text-foreground/80 hover:text-foreground ${FOCUS_RING}`}
          >
            {common.nav.connexion}
          </Link>
          <Button render={<Link href="/inscription" />}>
            {common.actions.demarrer}
          </Button>
        </div>

        <details className="group md:hidden">
          <summary
            className={`cursor-pointer list-none text-sm text-foreground/80 ${FOCUS_RING}`}
          >
            <span className="group-open:hidden">{common.nav.menu.ouvrir}</span>
            <span className="hidden group-open:inline">
              {common.nav.menu.fermer}
            </span>
          </summary>
          <nav className="flex flex-col gap-3 pt-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm text-foreground/80 hover:text-foreground ${FOCUS_RING}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/connexion"
              className={`text-sm text-foreground/80 hover:text-foreground ${FOCUS_RING}`}
            >
              {common.nav.connexion}
            </Link>
            <Button render={<Link href="/inscription" />}>
              {common.actions.demarrer}
            </Button>
          </nav>
        </details>
      </div>
    </header>
  );
}

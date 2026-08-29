import Link from "next/link";
import { Button } from "@/components/ui/button";
import common from "@/locales/fr/common.json";

const FOCUS_RING =
  "outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring rounded-md";

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
    <header className="border-b border-border bg-background shadow-[var(--shadow-1)] in-data-[density=compact]:py-1">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
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

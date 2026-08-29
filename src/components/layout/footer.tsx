import Link from "next/link";
import common from "@/locales/fr/common.json";

const FOCUS_RING =
  "outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring rounded-md";

const FORMATION_LINKS = [
  { href: "/programme", label: common.nav.programme },
  { href: "/formation", label: common.nav.formation },
  { href: "/agenda", label: common.nav.agenda },
] as const;

const COMPTE_LINKS = [
  { href: "/inscription", label: common.nav.inscription },
  { href: "/connexion", label: common.nav.connexion },
  { href: "/espace", label: common.nav.espace },
] as const;

/** camelCase JSON key -> kebab-case future slug, e.g. "mentionsLegales" -> "/mentions-legales". */
function keyToSlug(key: string) {
  return `/${key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`;
}

/**
 * The Lot 5 legal pages, derived from every string entry in `common.footer`
 * other than the baseline and the copyright line — labels pointing at their
 * future slugs, no legal text (D-41).
 */
const EXCLUDED_FOOTER_KEYS = new Set(["baseline", "colonnes", "copyright"]);
const INFORMATIONS_LINKS = [
  { href: "/a-propos", label: common.nav.aPropos },
  { href: "/contact", label: common.nav.contact },
  ...Object.entries(common.footer)
    .filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === "string" && !EXCLUDED_FOOTER_KEYS.has(entry[0])
    )
    .map(([key, label]) => ({ href: keyToSlug(key), label })),
];

/** Presentational only — link labels and layout, no legal prose (D-41). */
export function Footer() {
  const annee = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background in-data-[density=compact]:py-2">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="max-w-md text-sm text-foreground/80">
          {common.footer.baseline}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3">
          <nav aria-label={common.footer.colonnes.formation}>
            <h2 className="text-sm font-semibold text-foreground">
              {common.footer.colonnes.formation}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {FORMATION_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm text-foreground/70 hover:text-foreground ${FOCUS_RING}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={common.footer.colonnes.compte}>
            <h2 className="text-sm font-semibold text-foreground">
              {common.footer.colonnes.compte}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {COMPTE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm text-foreground/70 hover:text-foreground ${FOCUS_RING}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={common.footer.colonnes.informations}>
            <h2 className="text-sm font-semibold text-foreground">
              {common.footer.colonnes.informations}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {INFORMATIONS_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm text-foreground/70 hover:text-foreground ${FOCUS_RING}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-xs text-foreground/60">
          {common.footer.copyright.replace("{annee}", String(annee))}
        </p>
      </div>
    </footer>
  );
}

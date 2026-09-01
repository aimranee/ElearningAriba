import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FOCUS_RING } from "@/lib/utils";
import espace from "@/locales/fr/espace.json";

const LIENS = [
  { href: "/espace", label: espace.nav.apercu },
  { href: "/espace/profil", label: espace.nav.profil },
  { href: "/espace/donnees", label: espace.nav.donnees },
] as const;

/*
 * why (D-A1): src/components/layout/header.tsx is read-only and has no
 * session awareness, so the /espace nav band lives here, local to the
 * gated space. bg-muted, no --primary accent, per UI-SPEC § Color.
 */
export function EspaceNav() {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-muted px-4 py-3">
      <ul className="flex flex-wrap items-center gap-4">
        {LIENS.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={`text-sm font-medium text-foreground transition-colors hover:text-foreground/80 ${FOCUS_RING}`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      {/* why: a real POST form, not a click handler — it survives without
          JavaScript, per UI-SPEC. */}
      <form action="/api/auth/deconnexion" method="post">
        <Button type="submit" variant="ghost">
          {espace.deconnexion}
        </Button>
      </form>
    </nav>
  );
}

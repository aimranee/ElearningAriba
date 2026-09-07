"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import admin from "@/locales/fr/admin.json";

/*
 * why: a single array so plan 04-09 adds a fourth entry (types de
 * rendez-vous, already declared in admin.nav, awaiting its route) rather
 * than rewriting this component. Modelled on
 * src/components/espace/espace-nav.tsx — Button variant="ghost" at rest,
 * the active item taking the accent (UI-SPEC's admin sidenav contract),
 * which needs the current path — the one reason this is a client component
 * where the espace nav is not.
 */
const LIENS = [
  { href: "/admin/horaires", label: admin.nav.horaires },
  { href: "/admin/jours-feries", label: admin.nav.joursFeries },
  { href: "/admin/types-de-rendez-vous", label: admin.nav.typesDeRendezVous },
  { href: "/admin/reservations", label: admin.nav.reservations },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label={admin.titre}
      className="flex shrink-0 flex-col gap-1 rounded-xl bg-muted p-2 md:w-52 in-data-[density=compact]:gap-0.5 in-data-[density=compact]:p-1.5"
    >
      {LIENS.map(({ href, label }) => {
        const actif = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Button
            key={href}
            render={<Link href={href} />}
            nativeButton={false}
            variant={actif ? "default" : "ghost"}
            className="h-11 w-full justify-start"
          >
            {label}
          </Button>
        );
      })}
    </nav>
  );
}

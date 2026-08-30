"use client";
/* why: the burger toggle needs client state (open/closed, aria-expanded) —
   only this leaf is a client component, header.tsx itself stays server. */

import { useRef, useState } from "react";
import Link from "next/link";
import { FOCUS_RING } from "@/lib/utils";
import common from "@/locales/fr/common.json";

type NavLink = { href: string; label: string };

export function MobileNav({ links }: { links: readonly NavLink[] }) {
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    // why: closing on link click must restore focus to the trigger, not
    // strand it on a now-hidden panel.
    burgerRef.current?.focus();
  }

  return (
    <div className="min-[1000px]:hidden">
      <button
        ref={burgerRef}
        type="button"
        aria-expanded={open}
        aria-label={open ? common.nav.menu.fermer : common.nav.menu.ouvrir}
        onClick={() => setOpen((value) => !value)}
        className={`flex size-11 items-center justify-center rounded-xl border border-border bg-background text-foreground ${FOCUS_RING}`}
      >
        <span aria-hidden="true" className="text-sm">
          {open ? common.nav.menu.fermer : common.nav.menu.ouvrir}
        </span>
      </button>

      {open && (
        <nav
          aria-label={common.nav.menu.ouvrir}
          className="absolute inset-x-0 top-[76px] flex flex-col gap-1 border-b border-border bg-[rgba(252,252,255,.97)] px-6 pt-2 pb-5 backdrop-blur-[20px]"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className={`border-b border-border/70 py-3 text-sm font-medium text-foreground/80 ${FOCUS_RING}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

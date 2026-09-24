"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { FOCUS_RING } from "@/lib/utils";
import { writeLangueCookie } from "@/lib/i18n/langue-cookie";
import type { Locale } from "@/lib/i18n/locale";
import type { Messages } from "@/lib/i18n/messages";
import { languagePair } from "@/lib/i18n/routes";

const LOCALES: readonly Locale[] = ["fr", "en"];

const OPTION_CLASS = `inline-flex h-11 min-w-11 items-center justify-center text-sm transition-colors duration-300 ease-[var(--ease-brand)] ${FOCUS_RING}`;

/*
 * why (#17, I18N-05): client only for usePathname — known at prerender, so
 * the page stays static — and for the click that records the choice. A plain
 * <a>, not next/link: FR and EN have different root layouts, so the switch is
 * a full page load, and the cookie is written synchronously before it starts.
 * Renders nothing on a page with no counterpart in the route map, which keeps
 * it off every app page. The caller omits it while English is off.
 */
export function LanguageSwitcher({
  locale,
  labels,
  className,
}: {
  locale: Locale;
  labels: Messages<"common">["langue"];
  className: string;
}) {
  const pair = languagePair(usePathname());
  if (!pair) return null;

  return (
    <div role="group" aria-label={labels.choisir} className={`items-center ${className}`}>
      {LOCALES.map((option, index) => {
        const current = option === locale;
        return (
          <Fragment key={option}>
            {index > 0 && <span aria-hidden="true" className="h-4 w-0.5 rounded-full bg-border" />}
            <a
              href={pair[option]}
              lang={option}
              hrefLang={option}
              aria-label={labels.options[option].nom}
              aria-current={current ? "true" : undefined}
              onClick={() => writeLangueCookie(option)}
              className={`${OPTION_CLASS} ${current ? "font-bold text-foreground" : "font-semibold text-[var(--ink-soft)] hover:text-[var(--violet)]"}`}
            >
              {labels.options[option].court}
            </a>
          </Fragment>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { writeLangueCookie } from "@/lib/i18n/langue-cookie";
import type { Locale } from "@/lib/i18n/locale";

/*
 * why (#17, I18N-06): opening a page of this language counts as choosing it.
 * Written on mount by the client, so the page stays static/ISR — nothing on
 * the server reads or sets the cookie. pageshow covers a back/forward-cache
 * restore, which mounts nothing.
 */
export function RememberLanguage({ locale }: { locale: Locale }) {
  useEffect(() => {
    writeLangueCookie(locale);
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) writeLangueCookie(locale);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [locale]);
  return null;
}

import type { Metadata } from "next";

import { clientEnv } from "@/lib/env/client";
import { EN_ENABLED } from "@/lib/i18n/flag";
import { EN_ROUTES, type TranslatedRoute } from "@/lib/i18n/routes";

/**
 * The language alternates of a translated page, for both its French and its
 * English copy — each points at the other. None while English is off.
 *
 * why: absolute on the site URL, because the root layouts set no
 * metadataBase. hreflang values and x-default wait on the SEO spec (#26).
 */
export function languageAlternates(frenchPath: TranslatedRoute): Metadata["alternates"] {
  if (!EN_ENABLED) return undefined;
  const site = clientEnv.NEXT_PUBLIC_SITE_URL;
  return {
    languages: {
      fr: new URL(frenchPath, site).href,
      en: new URL(EN_ROUTES[frenchPath], site).href,
    },
  };
}

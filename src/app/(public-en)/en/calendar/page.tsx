import type { Metadata } from "next";

import { PageAgenda } from "@/components/agenda/page-agenda";
import { languageAlternates } from "@/lib/i18n/alternates";

// why (D-06, #24): rendered exactly like its French twin — static/ISR. The
// slug is provisional until the SEO spec (#26).
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: languageAlternates("/agenda"),
};

export default function Calendar() {
  return <PageAgenda locale="en" />;
}

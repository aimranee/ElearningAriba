import type { Metadata } from "next";

import { PageAccueil } from "@/components/accueil/page-accueil";
import { languageAlternates } from "@/lib/i18n/alternates";

// why (D-38, #22): rendered exactly like its French twin — static/ISR.
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: languageAlternates("/"),
};

export default function HomeEn() {
  return <PageAccueil locale="en" />;
}

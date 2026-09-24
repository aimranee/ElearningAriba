import type { Metadata } from "next";

import { PageAccueil } from "@/components/accueil/page-accueil";
import { languageAlternates } from "@/lib/i18n/alternates";

// why (D-38): the landing page must stay static/ISR, not dynamic, even
// though every section now reads Supabase through the cookieless client —
// an explicit revalidate window keeps the route on the ISR path.
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: languageAlternates("/"),
};

export default function Home() {
  return <PageAccueil locale="fr" />;
}

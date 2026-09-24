import type { Metadata } from "next";

import { PageFormation } from "@/components/formation/page-formation";
import { languageAlternates } from "@/lib/i18n/alternates";

// why (D-38, #21): rendered exactly like its French twin — static/ISR. The
// slug is provisional until the SEO spec (#26).
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: languageAlternates("/formation"),
};

export default function Training() {
  return <PageFormation locale="en" />;
}

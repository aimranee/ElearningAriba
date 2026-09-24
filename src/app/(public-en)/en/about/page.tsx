import type { Metadata } from "next";

import { PageAPropos } from "@/components/a-propos/page-a-propos";
import { languageAlternates } from "@/lib/i18n/alternates";

// why (D-38, #19): rendered exactly like its French twin — static/ISR.
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: languageAlternates("/a-propos"),
};

export default function About() {
  return <PageAPropos locale="en" />;
}

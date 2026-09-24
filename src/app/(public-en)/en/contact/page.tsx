import type { Metadata } from "next";

import { PageContact } from "@/components/contact/page-contact";
import { languageAlternates } from "@/lib/i18n/alternates";

// why (#23): rendered exactly like its French twin — static, no data read.
// The slug is provisional until the SEO spec (#26).
export const metadata: Metadata = {
  alternates: languageAlternates("/contact"),
};

export default function ContactEn() {
  return <PageContact locale="en" />;
}

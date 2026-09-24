import NotFound from "next/dist/client/components/builtin/not-found";

import { SiteShell, siteMetadata } from "@/components/layout/site-shell";

/*
 * why (#18): with two root layouts there is no app/layout.tsx left to wrap
 * the 404 of an unmatched URL. This renders the same page the single root
 * used to: the site shell around Next's built-in "not found" UI.
 */
export const metadata = siteMetadata;

export default function GlobalNotFound() {
  return (
    <SiteShell>
      <NotFound />
    </SiteShell>
  );
}

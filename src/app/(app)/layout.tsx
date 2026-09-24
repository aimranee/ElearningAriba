import { SiteShell, siteMetadata } from "@/components/layout/site-shell";

// why (#18): root layout of the app (booking tunnel, accounts, espace,
// admin) — separate from the public root so it can later read the user's
// language (Phase B) and carry its own top bar.
export const metadata = siteMetadata("fr");

export default function AppRootLayout({ children }: LayoutProps<"/">) {
  return <SiteShell locale="fr">{children}</SiteShell>;
}

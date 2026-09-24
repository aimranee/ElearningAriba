import { SiteShell, siteMetadata } from "@/components/layout/site-shell";

// why (#18): root layout of the public site — the English root
// ((public-en), lang="en", #19) sits beside it rather than under it.
export const metadata = siteMetadata("fr");

export default function PublicRootLayout({ children }: LayoutProps<"/">) {
  return <SiteShell locale="fr">{children}</SiteShell>;
}

import { SiteShell, siteMetadata } from "@/components/layout/site-shell";

// why (#19): root layout of the English public pages — beside (public), not
// under it, so <html lang="en"> is declared by the document itself. While
// English is off, next.config.ts answers 404 before any route here renders.
export const metadata = siteMetadata("en");

export default function PublicEnRootLayout({ children }: LayoutProps<"/">) {
  return <SiteShell locale="en">{children}</SiteShell>;
}

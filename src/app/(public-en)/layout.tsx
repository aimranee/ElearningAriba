import { SiteShell, siteMetadata } from "@/components/layout/site-shell";
import { RememberLanguage } from "@/components/layout/remember-language";

// why (#19): root layout of the English public pages — beside (public), not
// under it, so <html lang="en"> is declared by the document itself. While
// English is off, next.config.ts answers 404 before any route here renders.
// (#20) Every English page records `langue=en` on the client.
export const metadata = siteMetadata("en");

export default function PublicEnRootLayout({ children }: LayoutProps<"/">) {
  return (
    <SiteShell locale="en">
      <RememberLanguage locale="en" />
      {children}
    </SiteShell>
  );
}

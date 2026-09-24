import { SiteShell, siteMetadata } from "@/components/layout/site-shell";

// why (#18): root layout of the public site — the future English root
// (lang="en", #17) sits beside it rather than under it.
export const metadata = siteMetadata;

export default function PublicRootLayout({ children }: LayoutProps<"/">) {
  return <SiteShell>{children}</SiteShell>;
}

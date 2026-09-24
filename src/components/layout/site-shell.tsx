import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "@/app/globals.css";
import common from "@/locales/fr/common.json";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RevealScope } from "@/components/motion/reveal";
import { ScrollProgress } from "@/components/motion/scroll-progress";

/*
 * why (#18): the document shell shared by every root layout — (public),
 * (app) and global-not-found — so fonts, global CSS, metadata and chrome
 * are declared once and cannot drift between roots.
 */

const bodyFont = Inter({ variable: "--font-body", subsets: ["latin"] });
const headingFont = Plus_Jakarta_Sans({
  variable: "--font-heading-face",
  subsets: ["latin"],
});

export const siteMetadata: Metadata = {
  title: common.metadata.title,
  description: common.metadata.description,
};

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <RevealScope />
        <ScrollProgress />
        <a
          href="#contenu-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {common.nav.allerAuContenu}
        </a>
        <Header />
        {/* why: children need flex-1 on a wrapper, not on <body> itself, now
            that the header and footer are siblings sharing the body's flex
            column — otherwise every page's own flex-1 would compete with
            them for the remaining space. pt-[76px] offsets the now-fixed
            header (D-18) so no route's content renders underneath it. */}
        <main id="contenu-principal" className="relative z-[1] flex-1 pt-[76px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

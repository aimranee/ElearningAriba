import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import common from "@/locales/fr/common.json";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AtmosphereLayer } from "@/components/atmosphere/atmosphere-layer";
import { MeshDrift } from "@/components/atmosphere/mesh-drift";

const bodyFont = Inter({ variable: "--font-body", subsets: ["latin"] });
const headingFont = Plus_Jakarta_Sans({
  variable: "--font-heading-face",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: common.metadata.title,
  description: common.metadata.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AtmosphereLayer />
        <MeshDrift />
        <a
          href="#contenu-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {common.nav.allerAuContenu}
        </a>
        <Header />
        {/* why: children need flex-1 on a wrapper, not on <body> itself, now
            that the header and footer are siblings sharing the body's flex
            column — otherwise every page's own flex-1 would compete with
            them for the remaining space. */}
        <main id="contenu-principal" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import common from "@/locales/fr/common.json";

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

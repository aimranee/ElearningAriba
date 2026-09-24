import { Mail } from "lucide-react";

import contact from "@/locales/fr/contact.json";
import common from "@/locales/fr/common.json";
import { SectionHeader } from "@/components/sections/section";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/components/forms/contact-form";

export default function Contact() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12 sm:py-16 lg:py-20">
      {/* why: SectionHeader renders an h2 (no h1 exists on the landing page
          either — a pre-existing repo-wide gap, out of scope here); eyebrow
          reuses the nav label so the page is still named for a screen
          reader without inventing new copy */}
      <SectionHeader eyebrow={common.nav.contact} title={contact.titre} lead={contact.intro} />

      <Card variant="raised" className="reveal-rise">
        <CardHeader className="flex flex-row items-center gap-2">
          <Mail aria-hidden="true" className="size-5 text-primary" />
          <CardTitle>{contact.coordonnees.titre}</CardTitle>
        </CardHeader>
        <CardContent>
          <a
            href={`mailto:${contact.coordonnees.email}`}
            className="text-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring rounded-md"
          >
            {contact.coordonnees.email}
          </a>
        </CardContent>
      </Card>

      <ContactForm />
    </div>
  );
}

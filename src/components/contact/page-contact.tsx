import { Mail } from "lucide-react";

import { getMessages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import { SectionHeader } from "@/components/sections/section";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/components/forms/contact-form";

/*
 * why (#23): the Contact page body, rendered by both route files —
 * (public)/contact in French and (public-en)/en/contact in English — so the
 * two copies cannot drift. The form is a client island: its text arrives
 * from here, already in the page's language, and it sends that language
 * with the message so the acknowledgement email matches the page.
 */
export function PageContact({ locale }: { locale: Locale }) {
  const contact = getMessages(locale, "contact");
  const common = getMessages(locale, "common");

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

      <ContactForm
        langue={locale}
        texte={{
          titre: contact.titre,
          champs: contact.champs,
          profil: contact.profil,
          aideParChamp: contact.aideParChamp,
          erreurs: contact.erreurs,
          succes: contact.succes.message,
          envoyer: common.actions.envoyer,
          preparationFormulaire: common.etats.preparationFormulaire,
        }}
      />
    </div>
  );
}

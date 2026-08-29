import Link from "next/link";

import { Hero } from "@/components/sections/hero";
import { Section, SectionHeader } from "@/components/sections/section";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pictograms, type PictogramName } from "@/components/icons/pictograms";
import { formatNumber } from "@/lib/i18n/fr";
import common from "@/locales/fr/common.json";
import landing from "@/locales/fr/landing.json";

// why: `competences.items` (landing.json) is a plain string array — the copy
// layer has no per-item picto key. The registry's six PUB-03 competency
// pictograms already exist in the same order as the signed competency list,
// so the mapping is positional rather than a locale-bundle key this plan is
// not allowed to invent.
const COMPETENCE_PICTOS: readonly PictogramName[] = [
  "ecosysteme-ariba",
  "procure-to-pay",
  "source-to-pay",
  "rfq-rfp",
  "gestion-catalogues",
  "contrats-workflows",
];

export default function Home() {
  return (
    <>
      <Hero />

      <Section id="pourQui" tone="default">
        <SectionHeader
          title={landing.pourQui.titre}
          lead={landing.pourQui.reassurance}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {landing.pourQui.profils.map((profil) => {
            const Picto = pictograms[profil.picto as PictogramName];
            return (
              <Card key={profil.titre}>
                <CardHeader>
                  <Picto className="text-primary size-8" />
                  <CardTitle>{profil.titre}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{profil.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section id="competences" tone="muted">
        <SectionHeader title={landing.competences.titre} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {landing.competences.items.map((item, index) => {
            const Picto = pictograms[COMPETENCE_PICTOS[index]];
            return (
              <Card key={item} variant="outline">
                <CardHeader>
                  <Picto className="text-primary size-8" />
                  <CardTitle>{item}</CardTitle>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section id="programme" tone="default">
        <SectionHeader title={landing.programme.titre} />
        <Accordion className="mt-10">
          {landing.programme.modules.map((module) => (
            <AccordionItem key={module.titre}>
              <AccordionHeader>
                <AccordionTrigger>
                  <span>{module.titre}</span>
                  <Badge variant="outline">{formatNumber(module.duree)}</Badge>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>{module.resume}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-6 flex justify-center">
          {/* why: the programme PDF is a Lot 2 deliverable (D-41) — this stays
              a non-navigating disabled control, never a route that does not
              exist yet. */}
          <Button variant="outline" disabled>
            {landing.programme.telechargerPdf}
          </Button>
        </div>
      </Section>

      <Section id="formatModalites" tone="muted">
        <SectionHeader title={landing.formatModalites.titre} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {landing.formatModalites.items.map((item) => (
            <Card key={item.titre}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>{item.titre}</CardTitle>
                  {"statut" in item && item.statut ? (
                    <Badge variant="muted">{item.statut}</Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="confiance" tone="default">
        <SectionHeader title={landing.confiance.titre} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {landing.confiance.items.map((item) => (
            <Card key={item.titre}>
              <CardHeader>
                <CardTitle>{item.titre}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
          <Card variant="muted">
            <CardContent>
              <CardDescription>
                {landing.confiance.temoignages.placeholder}
              </CardDescription>
            </CardContent>
          </Card>
          <Card variant="muted">
            <CardContent>
              <CardDescription>
                {landing.confiance.logos.placeholder}
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section id="faq" tone="muted">
        <SectionHeader title={landing.faq.titre} />
        <Accordion className="mt-10 mx-auto max-w-3xl">
          {landing.faq.items.map((item) => (
            <AccordionItem key={item.question}>
              <AccordionHeader>
                <AccordionTrigger>{item.question}</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>{item.reponse}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <Section id="ctaFinal" tone="atmosphere">
        <SectionHeader
          title={landing.ctaFinal.titre}
          lead={landing.ctaFinal.supportLine}
        />
        <div className="mt-8 flex justify-center">
          <Button render={<Link href="/inscription" />} variant="success" size="lg">
            {common.actions.demarrer}
          </Button>
        </div>
      </Section>
    </>
  );
}

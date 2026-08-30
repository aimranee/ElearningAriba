import Link from "next/link";

import { Hero } from "@/components/sections/hero";
import { StatsBand } from "@/components/sections/stats-band";
import { PourQui } from "@/components/sections/pour-qui";
import { Competences } from "@/components/sections/competences";
import { ProgrammeAccordion } from "@/components/sections/programme-accordion";
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
import common from "@/locales/fr/common.json";
import landing from "@/locales/fr/landing.json";

// why (D-38): the landing page must stay static/ISR, not dynamic, even
// though Hero/StatsBand now read Supabase through the cookieless client —
// an explicit revalidate window keeps the route on the ISR path.
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBand />
      <PourQui />
      <Competences />
      <ProgrammeAccordion />

      <Section id="formatModalites" tone="band">
        <SectionHeader title={landing.formatModalites.titre} />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

      <Section id="faq" tone="band">
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

      <Section id="ctaFinal" tone="band">
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

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import admin from "@/locales/fr/admin.json";

const SECTIONS = [
  { href: "/admin/horaires", key: "horaires" as const },
  { href: "/admin/jours-feries", key: "joursFeries" as const },
] as const;

// why: the shell's landing surface is a short orientation panel, not a
// dashboard — overview metrics belong to Lot 10 (see plan scope rulings).
export default function AdminAccueil() {
  return (
    <div className="flex flex-col gap-6 py-6 md:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          {admin.accueil.titre}
        </h1>
        <p className="text-muted-foreground">{admin.accueil.intro}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map(({ href, key }) => (
          <Card key={href}>
            <CardHeader>
              <CardTitle>{admin.nav[key]}</CardTitle>
              <CardDescription>{admin.accueil.sections[key]}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button render={<Link href={href} />} nativeButton={false} variant="outline">
                {admin.nav[key]}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

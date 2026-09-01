import Link from "next/link";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AuthShell } from "@/components/compte/auth-shell";
import { InscriptionForm } from "@/components/compte/inscription-form";
import inscription from "@/locales/fr/inscription.json";

export default function Inscription() {
  return (
    <AuthShell
      titre={inscription.titre}
      intro={inscription.intro}
      largeur="2xl"
    >
      <Card>
        <CardContent>
          <InscriptionForm />
        </CardContent>
        <CardFooter>
          <Link
            href="/connexion"
            className="text-sm text-primary hover:underline"
          >
            {inscription.dejaInscrit}
          </Link>
        </CardFooter>
      </Card>
    </AuthShell>
  );
}

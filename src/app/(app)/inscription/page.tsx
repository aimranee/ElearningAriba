import Link from "next/link";

import { AuthShell } from "@/components/compte/auth-shell";
import { InscriptionForm } from "@/components/compte/inscription-form";
import { ParcoursEtapes } from "@/components/illustrations/parcours-etapes";
import common from "@/locales/fr/common.json";
import inscription from "@/locales/fr/inscription.json";

export default function Inscription() {
  return (
    <AuthShell
      titre={inscription.titre}
      intro={inscription.intro}
      entete={common.nav.inscription}
      illustration={<ParcoursEtapes />}
      largeur="2xl"
    >
      <InscriptionForm />
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/connexion" className="text-primary font-semibold hover:underline">
          {inscription.dejaInscrit}
        </Link>
      </p>
    </AuthShell>
  );
}

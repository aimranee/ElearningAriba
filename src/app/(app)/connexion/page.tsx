import Link from "next/link";

import { AuthShell } from "@/components/compte/auth-shell";
import { ConnexionForm } from "@/components/compte/connexion-form";
import { EspaceFenetre } from "@/components/illustrations/espace-fenetre";
import common from "@/locales/fr/common.json";
import connexion from "@/locales/fr/connexion.json";

/*
 * why: statically rendered (D-16, T-03-29) — this page reads no cookie,
 * calls no session helper, imports nothing from src/lib/auth/session.ts or
 * src/lib/supabase/server.ts. The client island below owns every dynamic
 * behaviour.
 */
export default function Connexion() {
  return (
    <AuthShell
      titre={connexion.titre}
      intro={connexion.intro}
      entete={common.nav.connexion}
      illustration={<EspaceFenetre />}
    >
      <ConnexionForm />
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/inscription" className="text-primary font-semibold hover:underline">
          {connexion.pasDeCompte}
        </Link>
      </p>
    </AuthShell>
  );
}

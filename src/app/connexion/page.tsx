import Link from "next/link";

import { AuthShell } from "@/components/compte/auth-shell";
import { ConnexionForm } from "@/components/compte/connexion-form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import connexion from "@/locales/fr/connexion.json";

/*
 * why: statically rendered (D-16, T-03-29) — this page reads no cookie,
 * calls no session helper, imports nothing from src/lib/auth/session.ts or
 * src/lib/supabase/server.ts. The client island below owns every dynamic
 * behaviour.
 */
export default function Connexion() {
  return (
    <AuthShell titre={connexion.titre} intro={connexion.intro}>
      <Card>
        <CardContent>
          <ConnexionForm />
        </CardContent>
        <CardFooter>
          <Link
            href="/inscription"
            className="text-sm text-primary hover:underline"
          >
            {connexion.pasDeCompte}
          </Link>
        </CardFooter>
      </Card>
    </AuthShell>
  );
}

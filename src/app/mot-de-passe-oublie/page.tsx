import { AuthShell } from "@/components/compte/auth-shell";
import { MotDePasseOublieForm } from "@/components/compte/mot-de-passe-oublie-form";
import { Card, CardContent } from "@/components/ui/card";
import motDePasse from "@/locales/fr/mot-de-passe.json";

/*
 * why (D-16): no session helper is imported here — the island reads and
 * writes nothing until the learner submits, so this route stays static.
 */
export default function MotDePasseOublie() {
  return (
    <AuthShell titre={motDePasse.demande.titre} intro={motDePasse.demande.intro}>
      <Card>
        <CardContent>
          <MotDePasseOublieForm />
        </CardContent>
      </Card>
    </AuthShell>
  );
}

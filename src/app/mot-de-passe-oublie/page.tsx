import { AuthShell } from "@/components/compte/auth-shell";
import { MotDePasseOublieForm } from "@/components/compte/mot-de-passe-oublie-form";
import connexion from "@/locales/fr/connexion.json";
import motDePasse from "@/locales/fr/mot-de-passe.json";

/*
 * why (D-16): no session helper is imported here — the island reads and
 * writes nothing until the learner submits, so this route stays static.
 */
export default function MotDePasseOublie() {
  return (
    <AuthShell
      titre={motDePasse.demande.titre}
      intro={motDePasse.demande.intro}
      entete={connexion.motDePasseOublie}
    >
      <MotDePasseOublieForm />
    </AuthShell>
  );
}

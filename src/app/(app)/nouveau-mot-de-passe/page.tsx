import { AuthShell } from "@/components/compte/auth-shell";
import { NouveauMotDePasseForm } from "@/components/compte/nouveau-mot-de-passe-form";
import motDePasse from "@/locales/fr/mot-de-passe.json";

/*
 * why (D-16, D-A3): the recovery session lives in the cookie jar and is read
 * by the route handler, not by this page — no session helper is imported
 * here, which is what lets this route stay static. The instinct on a
 * session-bearing surface is to gate the page; that gate belongs to the
 * POST handler instead, because the page itself reads and writes nothing.
 */
export default function NouveauMotDePasse() {
  return (
    <AuthShell titre={motDePasse.nouveau.titre} intro={motDePasse.nouveau.intro}>
      <NouveauMotDePasseForm />
    </AuthShell>
  );
}

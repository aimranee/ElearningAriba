import { redirect } from "next/navigation";

import { lireProfil } from "@/lib/profil/queries";
import { ProfilForm } from "@/components/compte/profil-form";
import profil from "@/locales/fr/profil.json";

// why (D-27): a broken session redirects before any markup is produced —
// never a half-populated form.
export default async function EspaceProfil() {
  const result = await lireProfil();

  if (!result.ok) {
    redirect("/connexion");
  }

  return (
    <div className="flex flex-col gap-8 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          {profil.titre}
        </h1>
        <p className="text-muted-foreground">{profil.intro}</p>
      </div>

      <ProfilForm profil={result.data} />
    </div>
  );
}

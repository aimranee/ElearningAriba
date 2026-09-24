import { TypesEditeur } from "@/components/admin/types-editeur";
import { listerTypesRendezVousAdmin } from "@/lib/agenda/admin-queries";
import admin from "@/locales/fr/admin.json";

/* why: the /admin shell layout already redirects an absent or non-admin
   session before this Server Component renders — no second gate here. */
export default async function AdminTypesDeRendezVousPage() {
  const typesResult = await listerTypesRendezVousAdmin();

  return (
    <div className="flex flex-col gap-6 py-6 md:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          {admin.typesRendezVous.titre}
        </h1>
        <p className="text-muted-foreground text-sm">{admin.typesRendezVous.intro}</p>
      </div>

      <TypesEditeur types={typesResult.ok ? typesResult.data : []} />
    </div>
  );
}

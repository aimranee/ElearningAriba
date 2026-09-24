import { JoursFeriesListe } from "@/components/admin/jours-feries-liste";
import { listerJoursFeries } from "@/lib/agenda/admin-queries";
import admin from "@/locales/fr/admin.json";

/* why: role gate already ran in src/app/admin/layout.tsx (requireAdministrator())
   before this Server Component renders — no second check here. */
export default async function AdminJoursFeriesPage() {
  const anneeCourante = new Date().getUTCFullYear();
  const [anneeA, anneeB] = await Promise.all([
    listerJoursFeries(anneeCourante),
    listerJoursFeries(anneeCourante + 1),
  ]);
  const joursFeries = [
    ...(anneeA.ok ? anneeA.data : []),
    ...(anneeB.ok ? anneeB.data : []),
  ];

  return (
    <div className="flex flex-col gap-6 py-6 md:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          {admin.joursFeries.titre}
        </h1>
      </div>

      <JoursFeriesListe joursFeries={joursFeries} />
    </div>
  );
}

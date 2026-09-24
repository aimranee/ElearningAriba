import { HorairesEditeur } from "@/components/admin/horaires-editeur";
import { ExceptionsEditeur } from "@/components/admin/exceptions-editeur";
import { listerDisponibilites, listerExceptions } from "@/lib/agenda/admin-queries";
import admin from "@/locales/fr/admin.json";

/* why: role gate already ran in src/app/admin/layout.tsx (requireAdministrator())
   before this Server Component renders — no second check here. */
export default async function AdminHorairesPage() {
  const disponibilitesResult = await listerDisponibilites();

  const aujourdHui = new Date();
  const dans90Jours = new Date(aujourdHui);
  dans90Jours.setDate(dans90Jours.getDate() + 90);
  const exceptionsResult = await listerExceptions(
    aujourdHui.toISOString().slice(0, 10),
    dans90Jours.toISOString().slice(0, 10),
  );
  const exceptionsNonFeries = exceptionsResult.ok
    ? exceptionsResult.data.filter((exception) => exception.motif !== "ferie")
    : [];

  return (
    <div className="flex flex-col gap-6 py-6 md:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          {admin.horaires.titre}
        </h1>
      </div>

      <HorairesEditeur disponibilites={disponibilitesResult.ok ? disponibilitesResult.data : []} />
      <ExceptionsEditeur exceptions={exceptionsNonFeries} />
    </div>
  );
}

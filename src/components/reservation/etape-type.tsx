import type { TypeRendezVous } from "@/lib/agenda/types-rendez-vous";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatHours } from "@/lib/i18n/fr";

type EtapeTypeProps = {
  types: TypeRendezVous[];
  onChoisirType: (typeId: string) => void;
};

/*
 * why (D-04, traceability): every card reads app.type_rendez_vous through
 * the `types` prop passed down from the server page, never
 * src/locales/fr/agenda.json — the same store app.reserver_creneau reads
 * from, so the price the learner agrees to here is the price the RPC
 * records on the booking.
 */
export function EtapeType({ types, onChoisirType }: EtapeTypeProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {types.map((type) => (
        <Card key={type.id} data-interactive="true" className="p-0">
          <button
            type="button"
            onClick={() => onChoisirType(type.id)}
            className="flex min-h-11 w-full flex-col gap-2 rounded-xl px-4 py-4 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <span className="font-heading text-base font-semibold">
              {type.libelle}
            </span>
            <span className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>{formatHours(type.dureeMinutes / 60)}</span>
              <span aria-hidden="true">·</span>
              <span>{formatCurrency(type.prixCentimes / 100)}</span>
            </span>
          </button>
        </Card>
      ))}
    </div>
  );
}

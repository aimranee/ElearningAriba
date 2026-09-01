import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state";
import type { AccesSupport } from "@/lib/documents/queries";
import common from "@/locales/fr/common.json";
import espace from "@/locales/fr/espace.json";

/**
 * The Mes documents card body — CPT-07's only non-empty surface (D-A9).
 * Zero rows renders the existing byte-identical empty state; one or more
 * rows renders a list, each row's download going through the signed-URL
 * route handler, never a direct storage link.
 */
export function DocumentsList({ supports }: { supports: AccesSupport[] }) {
  if (supports.length === 0) {
    return (
      <EmptyState tone="neutral" size="sm">
        <EmptyStateTitle>{espace.documents.vide.titre}</EmptyStateTitle>
        <EmptyStateDescription>{espace.documents.vide.message}</EmptyStateDescription>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {supports.map((support) => (
          <li
            key={support.id}
            className="flex items-center justify-between gap-2 in-data-[density=compact]:gap-1"
          >
            {/* why: the badge marks the support's own file format, derived
                from its stored path — not an invented sentence, so no new
                locale key is needed in a plan that must not touch
                espace.json (plan 03-03 already wrote its keys). */}
            <span className="flex items-center gap-2 text-sm text-foreground">
              {support.titre}
              <Badge variant="default">
                {support.chemin_fichier.split(".").pop()?.toUpperCase()}
              </Badge>
            </span>
            <Button
              render={<Link href={`/api/documents/${support.id}`} />}
              nativeButton={false}
              variant="outline"
              size="sm"
            >
              {common.actions.telecharger}
            </Button>
          </li>
        ))}
      </ul>
      {/* why: FieldDescription itself requires a <Field.Root> ancestor
          (Base UI throws otherwise) — this list has no field, so the same
          visual weight (src/components/ui/field.tsx's FieldDescription
          className) is reproduced directly on a plain <p>. */}
      <p className="text-muted-foreground text-sm in-data-[density=compact]:text-xs">
        {espace.documents.expiration}
      </p>
    </div>
  );
}

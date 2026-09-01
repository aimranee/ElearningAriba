import "server-only";

import { createClient } from "@/lib/supabase/server";
import { lireProfil } from "@/lib/profil/queries";
import { listerSupports } from "@/lib/documents/queries";
import { formatDate } from "@/lib/i18n/fr";
import type { QueryResult } from "@/lib/content/queries";

export type ExportPersonnel = {
  profil: {
    prenom: string;
    nom: string;
    email: string;
    telephone: string | null;
    profilProfessionnel: string;
    createdAt: string;
  };
  preferences: {
    rappels: boolean;
    actualites: boolean;
  };
  documents: { titre: string; obtenuLe: string }[];
  suppression: { demandeeLe: string } | null;
};

/*
 * why: every read below goes through the session-scoped client — the
 * export's authorisation IS row-level security, not an id parameter passed
 * in from the caller. There is no such parameter to get wrong, and the
 * elevated-privilege client from src/lib/supabase/service.ts is never
 * imported here.
 */
export async function construireExportPersonnel(): Promise<QueryResult<ExportPersonnel>> {
  const profilResult = await lireProfil();
  if (!profilResult.ok) {
    return { ok: false };
  }

  const supportsResult = await listerSupports();
  if (!supportsResult.ok) {
    return { ok: false };
  }

  const supabase = await createClient();
  const { data: demande, error } = await supabase
    .from("demande_suppression")
    .select("demandee_le")
    .eq("statut", "enregistree")
    .maybeSingle();

  if (error) {
    return { ok: false };
  }

  const { data: profil } = profilResult;

  return {
    ok: true,
    data: {
      profil: {
        prenom: profil.prenom,
        nom: profil.nom,
        email: profil.email,
        telephone: profil.telephone,
        profilProfessionnel: profil.profil_professionnel,
        createdAt: formatDate(new Date(profil.created_at)),
      },
      preferences: {
        rappels: profil.preference_rappels,
        actualites: profil.preference_actualites,
      },
      documents: supportsResult.data.map((support) => ({
        titre: support.titre,
        obtenuLe: formatDate(new Date(support.created_at)),
      })),
      suppression: demande ? { demandeeLe: formatDate(new Date(demande.demandee_le)) } : null,
    },
  };
}

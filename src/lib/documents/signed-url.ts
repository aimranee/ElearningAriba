import "server-only";

import { trouverSupport } from "@/lib/documents/queries";
import { createServiceClient } from "@/lib/supabase/service";
import { serverEnv } from "@/lib/env/server";
import type { QueryResult } from "@/lib/content/queries";

/* why: the TTL is short because the URL itself is the credential once
   minted — a long TTL turns a personal link into a shareable one, the
   exact thing CPT-07 forbids. 60 seconds is long enough to redirect and
   start a download, short enough that a captured link is stale within a
   minute. */
const SIGNED_URL_TTL_SECONDS = 60;

export type SupportSigne = { url: string; titre: string };

export async function creerUrlSigneeSupport(id: string): Promise<QueryResult<SupportSigne>> {
  /* why (ordering is the security property, not an implementation detail):
     trouverSupport runs on the session-scoped client under RLS. A `{ ok:
     false }` here means the learner is not entitled — RLS returned nothing
     — and this function returns immediately, without ever touching
     storage or the service-role client. Any code path that reaches the
     service-role client before this check has already leaked, because
     that client bypasses RLS entirely. */
  const support = await trouverSupport(id);
  if (!support.ok) {
    return { ok: false };
  }

  const service = createServiceClient();
  const { data, error } = await service.storage
    .from(serverEnv.SUPABASE_SUPPORTS_BUCKET)
    .createSignedUrl(support.data.chemin_fichier, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    return { ok: false };
  }

  return { ok: true, data: { url: data.signedUrl, titre: support.data.titre } };
}

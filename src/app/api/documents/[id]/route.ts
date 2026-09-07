import { NextResponse } from "next/server";
import { z } from "zod";

import { creerUrlSigneeSupport } from "@/lib/documents/signed-url";
import espace from "@/locales/fr/espace.json";

/*
 * why: a signed support download is personal data behind a session (D-37) —
 * this file exports GET only. No POST/PUT/PATCH/DELETE.
 *
 * why: programme.pdf/route.ts:9 declares a one-hour cache lifetime, because
 * that PDF is the same for every visitor. This route is the opposite —
 * copying that declaration here would cache one learner's signed URL and
 * serve it to the next caller, which is precisely the shareable link
 * CPT-07 forbids. No such declaration is made in this file.
 */

const idSchema = z.uuid();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return NextResponse.json(
      { erreur: espace.documents.erreur },
      { status: 404 },
    );
  }

  const result = await creerUrlSigneeSupport(parsedId.data);

  /* why: the same 404, same body shape, whether the id does not exist or
     the learner is not entitled — this endpoint must never become an
     existence oracle (T-03-38). Never return the storage path, the bucket
     name, the service key or a raw Supabase error. */
  if (!result.ok) {
    return NextResponse.json(
      { erreur: espace.documents.erreur },
      { status: 404 },
    );
  }

  return NextResponse.redirect(result.data.url, {
    status: 302,
    headers: {
      "Cache-Control": "no-store, no-cache, private",
      /* why: filename* (RFC 5987) instead of a bare quoted filename — the
         titre carries French accents, which are not valid in a raw HTTP
         header value (ByteString), while encodeURIComponent's output is
         always ASCII-safe. */
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(result.data.titre)}`,
    },
  });
}

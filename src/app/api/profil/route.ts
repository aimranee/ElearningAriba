import { NextResponse } from "next/server";

import { profilSchema, profilIssuesToFieldErrors } from "@/lib/validation/profil";
import { mettreAJourProfil } from "@/lib/profil/queries";

/*
 * why: a profile row is personal data — this file exports POST only. No GET
 * (the page reads through lireProfil()), no list route, no DELETE.
 *
 * The handler takes no subject identifier and no privileged field from the
 * body — the subject is the session, and the six parsed values are the only
 * ones ever passed on. Even a crafted body naming the administrator flag or
 * the auth identifier would find the schema drops it, mettreAJourProfil's
 * Pick would not carry it, and the database would refuse the column anyway
 * (plan 03-01, isolation assertion 3) — three independent layers, the
 * database one is the proven one.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = profilSchema.safeParse(body);

  if (!parsed.success) {
    const errors = profilIssuesToFieldErrors(parsed.error.issues);
    return NextResponse.json({ errors }, { status: 422 });
  }

  const result = await mettreAJourProfil(parsed.data);

  if (!result.ok) {
    return NextResponse.json({ errors: {} }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

import { NextResponse } from "next/server";

import { nouveauMotDePasseSchema } from "@/lib/validation/auth";
import { createClient } from "@/lib/supabase/server";

/*
 * why: sets the password for the account behind the recovery session — this
 * file exports POST only.
 *
 * why (T-03-34): the request body carries only the new password and its
 * confirmation, nothing identifying which account to target. The subject is
 * derived from the cookie-borne recovery session and from nothing else, so
 * a request cannot be aimed at another learner's account.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = nouveauMotDePasseSchema.safeParse(body);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "motDePasse") {
        errors.motDePasse = "motDePasseFaible";
      } else if (field === "confirmation") {
        errors.confirmation = "confirmationDifferente";
      }
    }
    return NextResponse.json({ errors }, { status: 422 });
  }

  const { motDePasse } = parsed.data;

  const supabase = await createClient();

  // why (T-03-35): getUser() validates against the auth server rather than
  // trusting the cookie — the middleware's own reason. An absent/expired
  // recovery session means the link was never followed, already used, or
  // expired; a cookie is not proof.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "lienExpire" }, { status: 401 });
  }

  const { error } = await supabase.auth.updateUser({ password: motDePasse });

  if (error) {
    if (error.code === "weak_password") {
      return NextResponse.json(
        { errors: { motDePasse: "motDePasseFaible" } },
        { status: 422 },
      );
    }
    return NextResponse.json({ error: "rejetServeur" }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

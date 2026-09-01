import type { ReactNode } from "react";

/* why: the centred title-block-then-card chrome (connexion/page.tsx:16-22)
   is repeated on all five Lot 3 auth surfaces (inscription, connexion,
   mot-de-passe-oublie, nouveau-mot-de-passe, espace/profil is its own
   dynamic shell) — extracted alongside the read-only design system, never
   by modifying it (D-04). Composition only: no new token, no new variant. */
type AuthShellProps = {
  titre: string;
  intro: string;
  largeur?: "md" | "2xl";
  children: ReactNode;
};

export function AuthShell({
  titre,
  intro,
  largeur = "md",
  children,
}: AuthShellProps) {
  return (
    <div
      className={`mx-auto flex flex-col gap-12 px-4 py-16 ${
        largeur === "2xl" ? "max-w-2xl" : "max-w-md"
      }`}
    >
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          {titre}
        </h1>
        <p className="text-muted-foreground">{intro}</p>
      </div>
      {children}
    </div>
  );
}

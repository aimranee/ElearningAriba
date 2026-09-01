import { requireLearner } from "@/lib/auth/session";
import { EspaceNav } from "@/components/espace/espace-nav";

// why (D-27): requireLearner() runs before anything is rendered, so an
// absent or broken session redirects to /connexion rather than producing
// partial markup.
export default async function EspaceLayout({ children }: LayoutProps<"/espace">) {
  await requireLearner();

  return (
    // why: py-16 is the page's own responsibility (see espace/page.tsx),
    // not this layout's — do not add a second one here.
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4">
      <EspaceNav />
      {children}
    </div>
  );
}

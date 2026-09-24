import { requireAdministrator } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/admin-nav";

// why: requireAdministrator() runs before anything is rendered, so an
// absent session, a broken session, or a signed-in non-administrator
// redirects (to /connexion or /espace respectively) before any admin markup
// is produced — mirroring src/app/espace/layout.tsx's requireLearner()
// discipline. data-density="compact" is set once, here, at the shell root —
// this is the attribute's first real consumer (D-16).
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdministrator();

  return (
    // why: the page owns its own vertical padding (py-6/py-8, not the
    // public py-16 rhythm), not this layout — same split as espace/layout.tsx.
    <div
      data-density="compact"
      className="mx-auto flex max-w-5xl flex-col gap-6 px-4 md:flex-row md:items-start"
    >
      <AdminNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

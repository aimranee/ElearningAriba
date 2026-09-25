import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * why (#24): the appointment types gained an English name the admin does not
 * edit (the admin stays French until Phase C). The handler is exercised whole,
 * with doubles only at its boundaries: the administrator guard, the database
 * client (the update is recorded, not run) and Next's cache.
 */
const { requireAdministrator, revalidatePath, update, eq, from } = vi.hoisted(() => {
  const maybeSingle = vi.fn(async () => ({ data: { id: "individuelle" }, error: null }));
  const select = vi.fn(() => ({ maybeSingle }));
  const eq = vi.fn<(column: string, value: string) => { select: typeof select }>(() => ({ select }));
  const update = vi.fn<(row: Record<string, unknown>) => { eq: typeof eq }>(() => ({ eq }));
  return {
    requireAdministrator: vi.fn(async () => ({ role: "administrator" })),
    revalidatePath: vi.fn<(path: string) => void>(),
    update,
    eq,
    from: vi.fn<(table: string) => { update: typeof update }>(() => ({ update })),
  };
});

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/auth/session", () => ({ requireAdministrator }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from }) }));

import { PATCH } from "./route";

function patch(body: unknown): Promise<Response> {
  return PATCH(
    new Request("http://localhost/api/admin/types-de-rendez-vous", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

const edit = {
  id: "individuelle",
  libelle: "Session individuelle",
  dureeMinutes: 90,
  tamponMinutes: 15,
  prixCentimes: 30000,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PATCH /api/admin/types-de-rendez-vous", () => {
  it("saves the four French fields of the type, as before", async () => {
    const response = await patch(edit);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("type_rendez_vous");
    expect(update).toHaveBeenCalledWith({
      libelle: "Session individuelle",
      duree_minutes: 90,
      tampon_minutes: 15,
      prix_centimes: 30000,
    });
    expect(eq).toHaveBeenCalledWith("id", "individuelle");
  });

  it("never writes the English name, even when a request carries one", async () => {
    await patch({ ...edit, libelle_en: "Changed", libelleEn: "Changed" });

    const row = update.mock.calls[0]?.[0] ?? {};
    expect(Object.keys(row).sort()).toEqual(["duree_minutes", "libelle", "prix_centimes", "tampon_minutes"]);
  });

  it("refreshes both agendas, French and English, after a save", async () => {
    await patch(edit);

    expect(revalidatePath).toHaveBeenCalledWith("/agenda");
    expect(revalidatePath).toHaveBeenCalledWith("/en/calendar");
  });

  it("refuses an invalid edit without saving or refreshing anything", async () => {
    const response = await patch({ ...edit, libelle: "" });

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ erreur: "libelleInvalide" });
    expect(update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * why (#24): the appointment types the agenda shows, read in French or in
 * English. The query module is exercised whole; the database client is the
 * only double — it records the columns asked for and returns fixed rows.
 */
type Row = Record<string, unknown>;

const { client, state } = vi.hoisted(() => {
  const state: { rows: Row[]; select: string[] } = { rows: [], select: [] };
  const query = {
    select(columns: string) {
      state.select.push(columns);
      return query;
    },
    eq() {
      return query;
    },
    order() {
      return Promise.resolve({ data: state.rows, error: null });
    },
  };
  return { client: { from: () => query }, state };
});

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/public", () => ({ createPublicClient: () => client }));

import { getTypesRendezVous } from "./types-rendez-vous";

const decouverte = {
  id: "decouverte",
  libelle: "Appel découverte",
  libelle_en: "Discovery call",
  duree_minutes: 30,
  tampon_minutes: 15,
  prix_centimes: 0,
  ordre: 0,
};
const individuelle = {
  id: "individuelle",
  libelle: "Session individuelle",
  libelle_en: "Individual session",
  duree_minutes: 90,
  tampon_minutes: 15,
  prix_centimes: 30000,
  ordre: 1,
};

beforeEach(() => {
  state.rows = [decouverte, individuelle];
  state.select = [];
});

describe("getTypesRendezVous", () => {
  it("reads the French names with the same columns as before", async () => {
    state.rows = [
      { ...decouverte, libelle_en: undefined },
      { ...individuelle, libelle_en: undefined },
    ];
    const result = await getTypesRendezVous();

    expect(state.select).toEqual(["id, libelle, duree_minutes, tampon_minutes, prix_centimes, ordre"]);
    expect(result).toEqual({
      ok: true,
      data: [
        { id: "decouverte", libelle: "Appel découverte", dureeMinutes: 30, tamponMinutes: 15, prixCentimes: 0, ordre: 0 },
        { id: "individuelle", libelle: "Session individuelle", dureeMinutes: 90, tamponMinutes: 15, prixCentimes: 30000, ordre: 1 },
      ],
    });
  });

  it("reads the English names in English", async () => {
    const result = await getTypesRendezVous("en");

    expect(result.ok && result.data.map((t) => t.libelle)).toEqual(["Discovery call", "Individual session"]);
  });

  it("falls back to the French name, type by type, when the English one is missing or blank", async () => {
    state.rows = [{ ...decouverte, libelle_en: null }, { ...individuelle, libelle_en: "  " }];
    const result = await getTypesRendezVous("en");

    expect(result.ok && result.data.map((t) => t.libelle)).toEqual(["Appel découverte", "Session individuelle"]);
  });

  it("keeps the English name of one type when its neighbour falls back", async () => {
    state.rows = [{ ...decouverte, libelle_en: null }, individuelle];
    const result = await getTypesRendezVous("en");

    expect(result.ok && result.data.map((t) => t.libelle)).toEqual(["Appel découverte", "Individual session"]);
  });

  it("keeps durations, prices and order identical in both languages", async () => {
    const fr = await getTypesRendezVous("fr");
    const en = await getTypesRendezVous("en");

    const numbers = (r: typeof fr) =>
      r.ok ? r.data.map(({ id, dureeMinutes, tamponMinutes, prixCentimes, ordre }) => ({ id, dureeMinutes, tamponMinutes, prixCentimes, ordre })) : null;
    expect(numbers(en)).toEqual(numbers(fr));
    expect(numbers(en)).not.toBeNull();
  });
});

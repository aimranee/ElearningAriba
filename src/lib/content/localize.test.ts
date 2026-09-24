import { describe, expect, it } from "vitest";

import type { Database } from "@/types/database.types";
import { localizeItem, localizeSection } from "./localize";

type SectionRow = Database["app"]["Tables"]["content_section"]["Row"];
type ItemRow = Database["app"]["Tables"]["content_item"]["Row"];

const section: SectionRow = {
  id: "s1",
  cle: "page-a-propos",
  eyebrow: "À propos",
  titre: "Derrière cette formation, un formateur.",
  titre_accent: "Voici son parcours.",
  lead: "Une légitimité construite sur la pratique.",
  eyebrow_en: "About",
  titre_en: "Behind this course, a trainer.",
  titre_accent_en: "Here is their background.",
  lead_en: "Credibility built on hands-on practice.",
  position: 11,
  publie: true,
  created_at: "2026-09-24T00:00:00Z",
  updated_at: "2026-09-24T00:00:00Z",
};

const item: ItemRow = {
  id: "i1",
  section_cle: "confiance",
  cle: "formateur",
  titre: "Un formateur certifié",
  description: "Description française",
  titre_en: "A certified trainer",
  description_en: "English description",
  picto: null,
  duree_heures: null,
  statut: null,
  position: 1,
  publie: true,
  donnees: {
    preuve: { texte: "Preuve française", lienHref: "/formation", lienLabel: "Voir" },
    deroule: ["Étape 1", "Étape 2"],
  },
  donnees_en: {
    preuve: { texte: "English proof", lienLabel: "See" },
    deroule: ["Step 1", "Step 2"],
  },
  created_at: "2026-09-24T00:00:00Z",
  updated_at: "2026-09-24T00:00:00Z",
};

describe("localizeSection", () => {
  it("reads the English columns in English", () => {
    const en = localizeSection(section, "en");
    expect(en.eyebrow).toBe("About");
    expect(en.titre).toBe("Behind this course, a trainer.");
    expect(en.titre_accent).toBe("Here is their background.");
    expect(en.lead).toBe("Credibility built on hands-on practice.");
  });

  it("falls back to French field by field when an English value is null", () => {
    const en = localizeSection({ ...section, lead_en: null }, "en");
    expect(en.lead).toBe("Une légitimité construite sur la pratique.");
    expect(en.titre).toBe("Behind this course, a trainer.");
  });

  it("treats a blank English value as empty", () => {
    const en = localizeSection({ ...section, titre_en: "  " }, "en");
    expect(en.titre).toBe("Derrière cette formation, un formateur.");
    expect(en.eyebrow).toBe("About");
  });

  it("falls back to French when the English column is absent (database not migrated)", () => {
    const unmigrated: Partial<SectionRow> = { ...section };
    delete unmigrated.lead_en;
    const en = localizeSection(unmigrated as SectionRow, "en");
    expect(en.lead).toBe("Une légitimité construite sur la pratique.");
  });

  it("returns the French row unchanged in French", () => {
    expect(localizeSection(section, "fr")).toBe(section);
  });
});

describe("localizeItem", () => {
  it("reads titre and description in English, and keeps French where English is empty", () => {
    const en = localizeItem({ ...item, description_en: null }, "en");
    expect(en.titre).toBe("A certified trainer");
    expect(en.description).toBe("Description française");
  });

  it("merges donnees_en over donnees key by key, recursing into objects", () => {
    const en = localizeItem(item, "en");
    expect(en.donnees).toEqual({
      preuve: { texte: "English proof", lienHref: "/formation", lienLabel: "See" },
      deroule: ["Step 1", "Step 2"],
    });
  });

  it("keeps a French key whose English value is null, blank or an empty list", () => {
    const en = localizeItem(
      { ...item, donnees_en: { preuve: { texte: "" }, deroule: [] } },
      "en",
    );
    expect(en.donnees).toEqual(item.donnees);
  });

  it("uses the French donnees when donnees_en is null", () => {
    expect(localizeItem({ ...item, donnees_en: null }, "en").donnees).toEqual(item.donnees);
  });

  it("returns the French row unchanged in French", () => {
    expect(localizeItem(item, "fr")).toBe(item);
  });
});

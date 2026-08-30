// Idempotent seed: moves the signed src/locales/fr/*.json bundles into the
// app.content_section / app.content_item tables (D-24). Upserts on the
// stable natural key (cle, or section_cle+cle) so a second run is a no-op
// (D-27). Every French string below is read from a JSON file — nothing here
// is authored copy. Connects with SUPABASE_SERVICE_ROLE_KEY: RLS grants anon
// no insert on the content tables (D-28).
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const localesDir = join(rootDir, "src/locales/fr");

function readJson(name) {
  return JSON.parse(readFileSync(join(localesDir, name), "utf8"));
}

// why: content_item.cle is a stable natural key the seed upserts on (D-27) —
// derived from the JSON's own titre rather than hand-authored, so no French
// sentence is invented here, only transliterated into an ascii identifier.
function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// why: `competences.items` (landing.json) is a plain string array with no
// per-item picto key — this is the same positional mapping page.tsx used
// (COMPETENCE_PICTOS), moved here so the column becomes real data instead of
// a hardcoded positional array at the call site.
const COMPETENCE_PICTOS = [
  "ecosysteme-ariba",
  "procure-to-pay",
  "source-to-pay",
  "rfq-rfp",
  "gestion-catalogues",
  "contrats-workflows",
];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "content:seed: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  db: { schema: "app" },
  auth: { persistSession: false, autoRefreshToken: false },
});

function normalizeSection(row) {
  return {
    eyebrow: null,
    titre_accent: null,
    lead: null,
    ...row,
  };
}

async function upsertSections(rows) {
  const { error } = await supabase
    .from("content_section")
    .upsert(rows.map(normalizeSection), {
      onConflict: "cle",
      ignoreDuplicates: false,
    });
  if (error) {
    console.error(`content:seed: content_section upsert failed: ${error.message}`);
    process.exit(1);
  }
}

// why: PostgREST's bulk upsert builds one INSERT statement whose column list
// is the union of keys across the batch — a row that omits an optional key
// gets an explicit NULL for it rather than falling back to the column
// default, so every row in a single call must carry every column explicitly.
function normalizeItem(row) {
  return {
    titre: null,
    description: null,
    picto: null,
    duree_heures: null,
    statut: null,
    donnees: {},
    ...row,
  };
}

async function upsertItems(rows) {
  const { error } = await supabase
    .from("content_item")
    .upsert(rows.map(normalizeItem), {
      onConflict: "section_cle,cle",
      ignoreDuplicates: false,
    });
  if (error) {
    console.error(`content:seed: content_item upsert failed: ${error.message}`);
    process.exit(1);
  }
}

async function main() {
  const landing = readJson("landing.json");
  const programme = readJson("programme.json");
  const formation = readJson("formation.json");
  const aPropos = readJson("a-propos.json");

  await upsertSections([
    { cle: "hero", titre: landing.hero.titre, lead: landing.hero.sousTitre, position: 1 },
    {
      cle: "pour-qui",
      titre: landing.pourQui.titre,
      lead: landing.pourQui.reassurance,
      position: 2,
    },
    { cle: "competences", titre: landing.competences.titre, position: 3 },
    { cle: "programme", titre: landing.programme.titre, position: 4 },
    { cle: "format-modalites", titre: landing.formatModalites.titre, position: 5 },
    { cle: "confiance", titre: landing.confiance.titre, position: 6 },
    {
      cle: "cta-final",
      titre: landing.ctaFinal.titre,
      lead: landing.ctaFinal.supportLine,
      position: 7,
    },
    { cle: "faq", titre: landing.faq.titre, position: 8 },
    {
      cle: "page-programme",
      titre: programme.titre,
      lead: programme.intro,
      position: 9,
    },
    {
      cle: "page-formation",
      titre: formation.titre,
      lead: formation.intro,
      position: 10,
    },
    {
      cle: "page-a-propos",
      titre: aPropos.titre,
      lead: aPropos.intro,
      position: 11,
    },
  ]);

  const profilItems = landing.pourQui.profils.map((profil, index) => ({
    section_cle: "pour-qui",
    cle: profil.picto,
    titre: profil.titre,
    description: profil.description,
    picto: profil.picto,
    position: index + 1,
  }));

  const competenceItems = landing.competences.items.map((titre, index) => ({
    section_cle: "competences",
    cle: COMPETENCE_PICTOS[index],
    titre,
    picto: COMPETENCE_PICTOS[index],
    position: index + 1,
  }));

  const moduleItems = landing.programme.modules.map((module, index) => ({
    section_cle: "programme",
    cle: slugify(module.titre),
    titre: module.titre,
    description: module.resume,
    duree_heures: module.duree,
    donnees: {
      objectifs: programme.modules[index].objectifs,
      contenu: programme.modules[index].contenu,
    },
    position: index + 1,
  }));

  const pageProgrammeItems = programme.modules.map((module, index) => ({
    section_cle: "page-programme",
    cle: slugify(module.titre),
    titre: module.titre,
    duree_heures: module.duree,
    donnees: {
      objectifs: module.objectifs,
      contenu: module.contenu,
    },
    position: index + 1,
  }));

  const formatItems = landing.formatModalites.items.map((item, index) => ({
    section_cle: "format-modalites",
    cle: slugify(item.titre),
    titre: item.titre,
    description: item.description,
    statut: item.statut ?? null,
    position: index + 1,
  }));

  const confianceItems = landing.confiance.items.map((item, index) => ({
    section_cle: "confiance",
    cle: slugify(item.titre),
    titre: item.titre,
    description: item.description,
    position: index + 1,
  }));

  const confiancePlaceholders = [
    {
      section_cle: "confiance",
      cle: "temoignages",
      description: landing.confiance.temoignages.placeholder,
      statut: "placeholder",
      position: confianceItems.length + 1,
    },
    {
      section_cle: "confiance",
      cle: "logos",
      description: landing.confiance.logos.placeholder,
      statut: "placeholder",
      position: confianceItems.length + 2,
    },
  ];

  const faqItems = landing.faq.items.map((item, index) => ({
    section_cle: "faq",
    cle: `faq-${index + 1}`,
    donnees: { question: item.question, reponse: item.reponse },
    position: index + 1,
  }));

  // why: page-formation carried a titre/lead content_section row (upserted
  // above) but no content_item rows — a gap left open by the previous plan
  // (02-02-SUMMARY.md, Next Phase Readiness). The Formation page reads its
  // modalités, déroulé and "ce qui est fourni" from these items.
  const pageFormationModaliteItems = formation.modalites.map((modalite, index) => ({
    section_cle: "page-formation",
    cle: slugify(modalite.titre),
    titre: modalite.titre,
    description: modalite.description,
    statut: modalite.statut ?? null,
    position: index + 1,
  }));

  const pageFormationDerouleItem = {
    section_cle: "page-formation",
    cle: "deroule",
    donnees: { deroule: formation.deroule },
    position: pageFormationModaliteItems.length + 1,
  };

  const pageFormationFourniItem = {
    section_cle: "page-formation",
    cle: "fourni",
    donnees: {
      fourni: formation.fourni,
      prerequis: formation.prerequis,
      dureeAcces: formation.dureeAcces,
    },
    position: pageFormationModaliteItems.length + 2,
  };

  // why: same gap as page-formation (02-02-SUMMARY.md) — page-a-propos had a
  // content_section row and no content_item rows. The three narrative blocks
  // (parcours, légitimité, approche) become items; the JSON carries no
  // separate title for each block (the current page renders the narrative
  // sentence itself as the card title), so `titre` holds that sentence
  // verbatim rather than inventing a label (D-25).
  const pageAProposItems = [
    { section_cle: "page-a-propos", cle: "parcours", titre: aPropos.parcours, position: 1 },
    { section_cle: "page-a-propos", cle: "legitimite", titre: aPropos.legitimite, position: 2 },
    { section_cle: "page-a-propos", cle: "approche", titre: aPropos.approche, position: 3 },
  ];

  await upsertItems([
    ...profilItems,
    ...competenceItems,
    ...moduleItems,
    ...formatItems,
    ...confianceItems,
    ...confiancePlaceholders,
    ...faqItems,
    ...pageProgrammeItems,
    ...pageFormationModaliteItems,
    pageFormationDerouleItem,
    pageFormationFourniItem,
    ...pageAProposItems,
  ]);

  console.log("content:seed: done");
}

main();

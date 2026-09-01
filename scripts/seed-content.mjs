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

// why: D-22 wants the signed two-sentence H2 split into title (first
// sentence, plain) + titleAccent (second sentence, gradient). SectionHeader's
// own comment forbids doing this split at render time (fragile on
// abbreviations) — splitting once here, at seed time, against the known
// signed string is the sanctioned alternative; the split point is authored,
// not inferred at runtime.
function splitTwoSentences(value) {
  const breakAt = value.indexOf(". ");
  if (breakAt === -1) {
    return { title: value, titleAccent: undefined };
  }
  return {
    title: value.slice(0, breakAt + 1),
    titleAccent: value.slice(breakAt + 2),
  };
}

// why: the FAQ's signed H2 (landing.json's faq.titre) is one sentence, not
// two — the maquette still gives it a gradient turn, but mid-sentence
// ("...fréquentes / trouvent leur réponse ici.") rather than at a period.
// splitTwoSentences can't find that boundary (no ". " inside a single
// sentence), so this is the same "authored split point against the known
// signed string" idea, keyed to the maquette's own literal accent phrase
// instead of a sentence break.
function splitAtPhrase(value, phrase) {
  const index = value.indexOf(phrase);
  if (index === -1) {
    return { title: value, titleAccent: undefined };
  }
  return { title: value.slice(0, index).trimEnd(), titleAccent: value.slice(index) };
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
  // why: eyebrow -> two-sentence H2 -> lead (D-22) needs a short label above
  // the internal-page headers. The nav labels are already signed copy
  // (common.json is chrome, read at seed time here rather than invented).
  const common = readJson("common.json");

  await upsertSections([
    { cle: "hero", titre: landing.hero.titre, lead: landing.hero.sousTitre, position: 1 },
    {
      cle: "pour-qui",
      eyebrow: landing.pourQui.eyebrow,
      titre: splitTwoSentences(landing.pourQui.titre).title,
      titre_accent: splitTwoSentences(landing.pourQui.titre).titleAccent,
      lead: landing.pourQui.reassurance,
      position: 2,
    },
    {
      cle: "competences",
      eyebrow: landing.competences.eyebrow,
      titre: splitTwoSentences(landing.competences.titre).title,
      titre_accent: splitTwoSentences(landing.competences.titre).titleAccent,
      position: 3,
    },
    {
      cle: "programme",
      eyebrow: landing.programme.eyebrow,
      titre: splitTwoSentences(landing.programme.titre).title,
      titre_accent: splitTwoSentences(landing.programme.titre).titleAccent,
      position: 4,
    },
    {
      cle: "format-modalites",
      eyebrow: landing.formatModalites.eyebrow,
      titre: splitTwoSentences(landing.formatModalites.titre).title,
      titre_accent: splitTwoSentences(landing.formatModalites.titre).titleAccent,
      position: 5,
    },
    {
      cle: "confiance",
      eyebrow: landing.confiance.eyebrow,
      titre: splitTwoSentences(landing.confiance.titre).title,
      titre_accent: splitTwoSentences(landing.confiance.titre).titleAccent,
      position: 6,
    },
    {
      cle: "cta-final",
      eyebrow: landing.ctaFinal.eyebrow,
      titre: splitTwoSentences(landing.ctaFinal.titre).title,
      titre_accent: splitTwoSentences(landing.ctaFinal.titre).titleAccent,
      lead: landing.ctaFinal.supportLine,
      position: 7,
    },
    {
      cle: "faq",
      eyebrow: landing.faq.eyebrow,
      titre: splitAtPhrase(landing.faq.titre, "trouvent leur réponse ici.").title,
      titre_accent: splitAtPhrase(landing.faq.titre, "trouvent leur réponse ici.")
        .titleAccent,
      position: 8,
    },
    {
      cle: "page-programme",
      eyebrow: common.nav.programme,
      titre: splitTwoSentences(programme.titre).title,
      titre_accent: splitTwoSentences(programme.titre).titleAccent,
      lead: programme.intro,
      position: 9,
    },
    {
      cle: "page-formation",
      eyebrow: common.nav.formation,
      titre: splitTwoSentences(formation.titre).title,
      titre_accent: splitTwoSentences(formation.titre).titleAccent,
      lead: formation.intro,
      position: 10,
    },
    {
      cle: "page-a-propos",
      eyebrow: common.nav.aPropos,
      titre: splitTwoSentences(aPropos.titre).title,
      titre_accent: splitTwoSentences(aPropos.titre).titleAccent,
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
    donnees: { accroche: profil.accroche },
  }));

  const competenceItems = landing.competences.items.map((competence, index) => ({
    section_cle: "competences",
    cle: competence.picto,
    titre: competence.titre,
    description: competence.description,
    picto: competence.picto,
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

  // why: the download-PDF button label must come from the database (D-24),
  // not a hardcoded string — a non-module item carries it, distinguished by
  // having no duree_heures.
  const pageProgrammeDownloadItem = {
    section_cle: "page-programme",
    cle: "telecharger-pdf",
    titre: programme.telechargerPdf,
    position: pageProgrammeItems.length + 1,
  };

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
    cle: item.cle,
    titre: item.titre,
    description: item.description,
    donnees: { preuve: item.preuve },
    position: index + 1,
  }));

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
    ...faqItems,
    ...pageProgrammeItems,
    pageProgrammeDownloadItem,
    ...pageFormationModaliteItems,
    pageFormationDerouleItem,
    pageFormationFourniItem,
    ...pageAProposItems,
  ]);

  // why (2026-09-01): upsertItems clé sur (section_cle, cle) et ne supprime
  // jamais. La refonte fusionne « catalogues » et « contrats et workflows » en
  // une compétence : sans retrait explicite la ligne retirée survit à chaque
  // re-seed et rend une septième tuile. Retrait nominatif, jamais en masse.
  const RETIRED_ITEMS = [
    { section_cle: "competences", cle: "contrats-workflows" },
    { section_cle: "confiance", cle: "temoignages" },
    { section_cle: "confiance", cle: "logos" },
    { section_cle: "confiance", cle: "protection-des-donnees" },
    { section_cle: "confiance", cle: "experts-sap-ariba-certifies" },
    { section_cle: "confiance", cle: "contenus-regulierement-mis-a-jour" },
  ];

  for (const entry of RETIRED_ITEMS) {
    const { error } = await supabase
      .from("content_item")
      .delete()
      .eq("section_cle", entry.section_cle)
      .eq("cle", entry.cle);
    if (error) {
      console.error(`content:seed: content_item retirement failed: ${error.message}`);
      process.exit(1);
    }
  }

  console.log("content:seed: done");
}

main();

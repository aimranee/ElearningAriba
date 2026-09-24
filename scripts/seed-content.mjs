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
// why (#19): English copies mirror the French files key for key (typed in
// src/lib/i18n/messages.ts); only namespaces already translated exist here.
const enLocalesDir = join(rootDir, "src/locales/en");

function readJson(name) {
  return JSON.parse(readFileSync(join(localesDir, name), "utf8"));
}

function readEnJson(name) {
  return JSON.parse(readFileSync(join(enLocalesDir, name), "utf8"));
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

// why (#19): a section without English copy yet carries null *_en columns —
// the English site falls back to French field by field.
function normalizeSection(row) {
  return {
    eyebrow: null,
    titre_accent: null,
    lead: null,
    eyebrow_en: null,
    titre_en: null,
    titre_accent_en: null,
    lead_en: null,
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
    titre_en: null,
    description_en: null,
    donnees_en: null,
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
  // why (#19, #21, #22): English is seeded section by section as the page
  // tickets (#21–#24) translate them — About, Formation and its programme,
  // then the landing.
  const aProposEn = readEnJson("a-propos.json");
  const commonEn = readEnJson("common.json");
  const programmeEn = readEnJson("programme.json");
  const formationEn = readEnJson("formation.json");
  // (#22) The landing: src/locales/en/landing.json mirrors the French file,
  // item for item in the same order; `cle` stays the French one.
  const landingEn = readEnJson("landing.json");

  await upsertSections([
    {
      cle: "hero",
      titre: landing.hero.titre,
      lead: landing.hero.sousTitre,
      titre_en: landingEn.hero.titre,
      lead_en: landingEn.hero.sousTitre,
      position: 1,
    },
    {
      cle: "pour-qui",
      eyebrow: landing.pourQui.eyebrow,
      titre: splitTwoSentences(landing.pourQui.titre).title,
      titre_accent: splitTwoSentences(landing.pourQui.titre).titleAccent,
      lead: landing.pourQui.reassurance,
      eyebrow_en: landingEn.pourQui.eyebrow,
      titre_en: splitTwoSentences(landingEn.pourQui.titre).title,
      titre_accent_en: splitTwoSentences(landingEn.pourQui.titre).titleAccent,
      lead_en: landingEn.pourQui.reassurance,
      position: 2,
    },
    {
      cle: "competences",
      eyebrow: landing.competences.eyebrow,
      titre: splitTwoSentences(landing.competences.titre).title,
      titre_accent: splitTwoSentences(landing.competences.titre).titleAccent,
      eyebrow_en: landingEn.competences.eyebrow,
      titre_en: splitTwoSentences(landingEn.competences.titre).title,
      titre_accent_en: splitTwoSentences(landingEn.competences.titre).titleAccent,
      position: 3,
    },
    {
      cle: "programme",
      eyebrow: landing.programme.eyebrow,
      titre: splitTwoSentences(landing.programme.titre).title,
      titre_accent: splitTwoSentences(landing.programme.titre).titleAccent,
      eyebrow_en: landingEn.programme.eyebrow,
      titre_en: splitTwoSentences(landingEn.programme.titre).title,
      titre_accent_en: splitTwoSentences(landingEn.programme.titre).titleAccent,
      position: 4,
    },
    {
      cle: "format-modalites",
      eyebrow: landing.formatModalites.eyebrow,
      titre: splitTwoSentences(landing.formatModalites.titre).title,
      titre_accent: splitTwoSentences(landing.formatModalites.titre).titleAccent,
      eyebrow_en: landingEn.formatModalites.eyebrow,
      titre_en: splitTwoSentences(landingEn.formatModalites.titre).title,
      titre_accent_en: splitTwoSentences(landingEn.formatModalites.titre).titleAccent,
      position: 5,
    },
    {
      cle: "confiance",
      eyebrow: landing.confiance.eyebrow,
      titre: splitTwoSentences(landing.confiance.titre).title,
      titre_accent: splitTwoSentences(landing.confiance.titre).titleAccent,
      lead: landing.confiance.lead,
      eyebrow_en: landingEn.confiance.eyebrow,
      titre_en: splitTwoSentences(landingEn.confiance.titre).title,
      titre_accent_en: splitTwoSentences(landingEn.confiance.titre).titleAccent,
      lead_en: landingEn.confiance.lead,
      position: 6,
    },
    {
      cle: "cta-final",
      eyebrow: landing.ctaFinal.eyebrow,
      titre: splitTwoSentences(landing.ctaFinal.titre).title,
      titre_accent: splitTwoSentences(landing.ctaFinal.titre).titleAccent,
      lead: landing.ctaFinal.supportLine,
      eyebrow_en: landingEn.ctaFinal.eyebrow,
      titre_en: splitTwoSentences(landingEn.ctaFinal.titre).title,
      titre_accent_en: splitTwoSentences(landingEn.ctaFinal.titre).titleAccent,
      lead_en: landingEn.ctaFinal.supportLine,
      position: 7,
    },
    {
      cle: "faq",
      eyebrow: landing.faq.eyebrow,
      titre: splitAtPhrase(landing.faq.titre, "trouvent leur réponse ici.").title,
      titre_accent: splitAtPhrase(landing.faq.titre, "trouvent leur réponse ici.")
        .titleAccent,
      // (#22) The English turn sits at the same point of the sentence.
      eyebrow_en: landingEn.faq.eyebrow,
      titre_en: splitAtPhrase(landingEn.faq.titre, "find their answer here.").title,
      titre_accent_en: splitAtPhrase(landingEn.faq.titre, "find their answer here.")
        .titleAccent,
      position: 8,
    },
    {
      cle: "page-programme",
      eyebrow: common.nav.programme,
      titre: splitTwoSentences(programme.titre).title,
      titre_accent: splitTwoSentences(programme.titre).titleAccent,
      lead: programme.intro,
      eyebrow_en: commonEn.nav.programme,
      titre_en: splitTwoSentences(programmeEn.titre).title,
      titre_accent_en: splitTwoSentences(programmeEn.titre).titleAccent,
      lead_en: programmeEn.intro,
      position: 9,
    },
    {
      cle: "page-formation",
      eyebrow: common.nav.formation,
      titre: splitTwoSentences(formation.titre).title,
      titre_accent: splitTwoSentences(formation.titre).titleAccent,
      lead: formation.intro,
      eyebrow_en: commonEn.nav.formation,
      titre_en: splitTwoSentences(formationEn.titre).title,
      titre_accent_en: splitTwoSentences(formationEn.titre).titleAccent,
      lead_en: formationEn.intro,
      position: 10,
    },
    {
      cle: "page-a-propos",
      eyebrow: common.nav.aPropos,
      titre: splitTwoSentences(aPropos.titre).title,
      titre_accent: splitTwoSentences(aPropos.titre).titleAccent,
      lead: aPropos.intro,
      eyebrow_en: commonEn.nav.aPropos,
      titre_en: splitTwoSentences(aProposEn.titre).title,
      titre_accent_en: splitTwoSentences(aProposEn.titre).titleAccent,
      lead_en: aProposEn.intro,
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
    titre_en: landingEn.pourQui.profils[index].titre,
    description_en: landingEn.pourQui.profils[index].description,
    donnees_en: { accroche: landingEn.pourQui.profils[index].accroche },
  }));

  const competenceItems = landing.competences.items.map((competence, index) => ({
    section_cle: "competences",
    cle: competence.picto,
    titre: competence.titre,
    description: competence.description,
    picto: competence.picto,
    position: index + 1,
    titre_en: landingEn.competences.items[index].titre,
    description_en: landingEn.competences.items[index].description,
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
    titre_en: landingEn.programme.modules[index].titre,
    description_en: landingEn.programme.modules[index].resume,
    donnees_en: {
      objectifs: programmeEn.modules[index].objectifs,
      contenu: programmeEn.modules[index].contenu,
    },
    position: index + 1,
  }));

  // why (#27): the cadrage's § 3.2 « Objectif pédagogique » and § 3.3 « Cas
  // pratique » ride the same page-programme rows as the module content —
  // the Formation page validates them at its read boundary and tolerates
  // rows that do not carry them yet.
  // (#21) Each row's English twin comes from the module at the same index of
  // src/locales/en/programme.json; `cle` stays the French slug.
  const pageProgrammeItems = programme.modules.map((module, index) => {
    const moduleEn = programmeEn.modules[index];
    return {
      section_cle: "page-programme",
      cle: slugify(module.titre),
      titre: module.titre,
      duree_heures: module.duree,
      donnees: {
        objectifs: module.objectifs,
        contenu: module.contenu,
        objectifPedagogique: module.objectifPedagogique,
        casPratique: module.casPratique,
      },
      titre_en: moduleEn.titre,
      donnees_en: {
        objectifs: moduleEn.objectifs,
        contenu: moduleEn.contenu,
        objectifPedagogique: moduleEn.objectifPedagogique,
        casPratique: moduleEn.casPratique,
      },
      position: index + 1,
    };
  });

  // why: the download-PDF button label must come from the database (D-24),
  // not a hardcoded string — a non-module item carries it, distinguished by
  // having no duree_heures.
  const pageProgrammeDownloadItem = {
    section_cle: "page-programme",
    cle: "telecharger-pdf",
    titre: programme.telechargerPdf,
    titre_en: programmeEn.telechargerPdf,
    position: pageProgrammeItems.length + 1,
  };

  const formatItems = landing.formatModalites.items.map((item, index) => ({
    section_cle: "format-modalites",
    cle: slugify(item.titre),
    titre: item.titre,
    description: item.description,
    statut: item.statut ?? null,
    titre_en: landingEn.formatModalites.items[index].titre,
    description_en: landingEn.formatModalites.items[index].description,
    position: index + 1,
  }));

  // (#22) The proof's link stays the French path in both columns; the page
  // shows it in its own language through the route map.
  const confianceItems = landing.confiance.items.map((item, index) => ({
    section_cle: "confiance",
    cle: item.cle,
    titre: item.titre,
    description: item.description,
    donnees: { preuve: item.preuve },
    titre_en: landingEn.confiance.items[index].titre,
    description_en: landingEn.confiance.items[index].description,
    donnees_en: { preuve: landingEn.confiance.items[index].preuve },
    position: index + 1,
  }));

  const faqItems = landing.faq.items.map((item, index) => ({
    section_cle: "faq",
    cle: `faq-${index + 1}`,
    donnees: { question: item.question, reponse: item.reponse },
    donnees_en: {
      question: landingEn.faq.items[index].question,
      reponse: landingEn.faq.items[index].reponse,
    },
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
    titre_en: formationEn.modalites[index].titre,
    description_en: formationEn.modalites[index].description,
    position: index + 1,
  }));

  // (#21) déroulé and fourni in English translate the seeded French rows —
  // the rulings of 2026-09-14 hold in both languages (no replay, no demo
  // environment).
  const pageFormationDerouleItem = {
    section_cle: "page-formation",
    cle: "deroule",
    donnees: { deroule: formation.deroule },
    donnees_en: { deroule: formationEn.deroule },
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
    donnees_en: {
      fourni: formationEn.fourni,
      prerequis: formationEn.prerequis,
      dureeAcces: formationEn.dureeAcces,
    },
    position: pageFormationModaliteItems.length + 2,
  };

  // why (#27): the § 4.1 facts of the cadrage (format, pedagogy split,
  // session length) are content, not chrome — seeded like deroule and
  // fourni so the Formation header's facts strip reads the database.
  const pageFormationChiffresItem = {
    section_cle: "page-formation",
    cle: "chiffres",
    donnees: formation.chiffres,
    donnees_en: formationEn.chiffres,
    position: pageFormationModaliteItems.length + 3,
  };

  // why: same gap as page-formation (02-02-SUMMARY.md) — page-a-propos had a
  // content_section row and no content_item rows. The three narrative blocks
  // (parcours, légitimité, approche) become items; the JSON carries no
  // separate title for each block (the current page renders the narrative
  // sentence itself as the card title), so `titre` holds that sentence
  // verbatim rather than inventing a label (D-25).
  const pageAProposItems = [
    {
      section_cle: "page-a-propos",
      cle: "parcours",
      titre: aPropos.parcours,
      titre_en: aProposEn.parcours,
      position: 1,
    },
    {
      section_cle: "page-a-propos",
      cle: "legitimite",
      titre: aPropos.legitimite,
      titre_en: aProposEn.legitimite,
      position: 2,
    },
    {
      section_cle: "page-a-propos",
      cle: "approche",
      titre: aPropos.approche,
      titre_en: aProposEn.approche,
      position: 3,
    },
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
    pageFormationChiffresItem,
    ...pageAProposItems,
  ]);

  // why (2026-09-01): upsertItems clé sur (section_cle, cle) et ne supprime
  // jamais. La refonte fusionne « catalogues » et « contrats et workflows » en
  // une compétence : sans retrait explicite la ligne retirée survit à chaque
  // re-seed et rend une septième tuile. Retrait nominatif, jamais en masse.
  // why: the client's programme (2026-09-14) replaces the five mock modules
  // outright — same structure, new titles/durees/resumes. The upsert keys on
  // (section_cle, cle) with cle = slugify(titre), so renaming the modules
  // creates five new rows per section without touching the old ones; they
  // must be retired by name, in both sections that carry them.
  const RETIRED_ITEMS = [
    { section_cle: "competences", cle: "contrats-workflows" },
    { section_cle: "confiance", cle: "temoignages" },
    { section_cle: "confiance", cle: "logos" },
    { section_cle: "confiance", cle: "protection-des-donnees" },
    { section_cle: "confiance", cle: "experts-sap-ariba-certifies" },
    { section_cle: "confiance", cle: "contenus-regulierement-mis-a-jour" },
    { section_cle: "programme", cle: "decouverte-de-l-ecosysteme-ariba" },
    { section_cle: "programme", cle: "procure-to-pay-au-quotidien" },
    { section_cle: "programme", cle: "source-to-pay-et-strategie-achats" },
    { section_cle: "programme", cle: "appels-d-offres-rfq-et-rfp" },
    { section_cle: "programme", cle: "catalogues-contrats-et-workflows" },
    { section_cle: "page-programme", cle: "decouverte-de-l-ecosysteme-ariba" },
    { section_cle: "page-programme", cle: "procure-to-pay-au-quotidien" },
    { section_cle: "page-programme", cle: "source-to-pay-et-strategie-achats" },
    { section_cle: "page-programme", cle: "appels-d-offres-rfq-et-rfp" },
    { section_cle: "page-programme", cle: "catalogues-contrats-et-workflows" },
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

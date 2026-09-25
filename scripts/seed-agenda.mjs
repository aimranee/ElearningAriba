// Idempotent, replayable bootstrap for the Lot 4 agenda (D-21/D-22): promotes
// the trainer's profil to `administrator`, seeds the two appointment types
// from src/locales/fr/agenda.json (bootstrap input only -- D-24 fence, this
// file never writes agenda.json), opens a typical Monday-to-Friday week, and
// pre-fills the eleven French public holidays for the current and next year
// (D-17). Every write below is read-then-insert-missing: nothing here
// upserts, updates or deletes, so a value an administrator has since
// configured survives a re-run (T-04-12). No French string and no personal
// datum is authored in this file -- labels come from src/locales/fr/admin.json
// and the trainer email from FORMATEUR_EMAIL. Connects with
// SUPABASE_SERVICE_ROLE_KEY: RLS grants no write to anon or authenticated on
// these tables (the reservation RPCs own writes; this script bypasses RLS
// entirely, as content:seed already does for the content tables).
//
// This script deliberately writes no row to app.maintien_creneau: a D-27
// retention is created by a visitor choosing a slot and lapses on its own --
// a seeded one would hide a slot from the CQO recette for no reason.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const localesDir = join(rootDir, "src/locales/fr");

function readJson(name) {
  return JSON.parse(readFileSync(join(localesDir, name), "utf8"));
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FORMATEUR_EMAIL = process.env.FORMATEUR_EMAIL;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !FORMATEUR_EMAIL) {
  console.error(
    "agenda:seed: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and FORMATEUR_EMAIL must be set",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  db: { schema: "app" },
  auth: { persistSession: false, autoRefreshToken: false },
});

// why: listUsers() is paginated (default 50/page) -- a fresh environment has
// few users, but this must not silently miss the trainer once real learner
// accounts exist. Page until found or exhausted.
async function trouverUtilisateurParEmail(email) {
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error(`agenda:seed: auth.admin.listUsers failed: ${error.message}`);
      process.exit(1);
    }
    const found = data.users.find((u) => u.email === email);
    if (found) return found;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

// D-21: promote the trainer's profil to administrator. A silent no-op here
// would leave /admin permanently unreachable, so a missing account is fatal,
// not a skip.
async function promouvoirAdministrateur() {
  const utilisateur = await trouverUtilisateurParEmail(FORMATEUR_EMAIL);
  if (!utilisateur) {
    console.error(
      `agenda:seed: no auth.users row for FORMATEUR_EMAIL (${FORMATEUR_EMAIL}) -- create the account first, then re-run`,
    );
    process.exit(1);
  }

  const { error } = await supabase
    .from("profil")
    .update({ role: "administrator" })
    .eq("utilisateur_id", utilisateur.id);

  if (error) {
    console.error(`agenda:seed: profil administrator promotion failed: ${error.message}`);
    process.exit(1);
  }

  return utilisateur.id;
}

// Appointment types -- bootstrap only. Insert only the ids not already
// present; never upsert, never update. From plan 04-09 the administrator
// owns these values through /admin/types-de-rendez-vous -- an upsert would
// silently revert a configured price or buffer on the next environment
// bootstrap.
async function seedTypesRendezVous() {
  const agenda = readJson("agenda.json");

  const { data: existants, error: erreurLecture } = await supabase
    .from("type_rendez_vous")
    .select("id");
  if (erreurLecture) {
    console.error(`agenda:seed: type_rendez_vous read failed: ${erreurLecture.message}`);
    process.exit(1);
  }
  const idsExistants = new Set((existants ?? []).map((r) => r.id));

  const manquants = agenda.typesRendezVous
    .filter((t) => !idsExistants.has(t.id))
    .map((t, index) => ({
      id: t.id,
      libelle: t.libelle,
      duree_minutes: t.dureeMinutes,
      tampon_minutes: 15, // D-20 -- explicit: the bulk-insert trap turns an omitted key into NULL
      prix_centimes: Math.round(t.prix * 100),
      actif: true,
      ordre: index,
    }));

  if (manquants.length === 0) return 0;

  const { error } = await supabase.from("type_rendez_vous").insert(manquants);
  if (error) {
    console.error(`agenda:seed: type_rendez_vous insert failed: ${error.message}`);
    process.exit(1);
  }
  return manquants.length;
}

// (#24) English names -- from src/locales/en/agenda.json, which mirrors the
// French file key for key. Written only where libelle_en is still null: the
// admin does not edit English until Phase C, so there is nothing configured
// to revert, and a name set by hand in the database survives a re-run.
async function seedLibellesAnglais() {
  const agendaEn = JSON.parse(readFileSync(join(rootDir, "src/locales/en/agenda.json"), "utf8"));
  let ecrits = 0;
  for (const t of agendaEn.typesRendezVous) {
    const { data, error } = await supabase
      .from("type_rendez_vous")
      .update({ libelle_en: t.libelle })
      .eq("id", t.id)
      .is("libelle_en", null)
      .select("id");
    if (error) {
      console.error(`agenda:seed: type_rendez_vous libelle_en update failed: ${error.message}`);
      process.exit(1);
    }
    ecrits += data.length;
  }
  return ecrits;
}

// D-22: a typical Monday(1)-to-Friday(5) week, 09:00-12:00 and 14:00-17:00.
// ISO isodow, never extract(dow). No natural unique key exists on this table
// yet, so read the existing active rows first and insert only the missing
// (jour_semaine, heure_debut, heure_fin) triples.
async function seedSemaineType() {
  const { data: existantes, error: erreurLecture } = await supabase
    .from("disponibilite_hebdomadaire")
    .select("jour_semaine, heure_debut, heure_fin")
    .eq("actif", true);
  if (erreurLecture) {
    console.error(`agenda:seed: disponibilite_hebdomadaire read failed: ${erreurLecture.message}`);
    process.exit(1);
  }
  const cle = (r) => `${r.jour_semaine}|${r.heure_debut}|${r.heure_fin}`;
  const existantesSet = new Set((existantes ?? []).map(cle));

  const voulues = [];
  for (let jour = 1; jour <= 5; jour += 1) {
    voulues.push({ jour_semaine: jour, heure_debut: "09:00:00", heure_fin: "12:00:00", actif: true });
    voulues.push({ jour_semaine: jour, heure_debut: "14:00:00", heure_fin: "17:00:00", actif: true });
  }

  const manquantes = voulues.filter((r) => !existantesSet.has(cle(r)));
  if (manquantes.length === 0) return 0;

  const { error } = await supabase.from("disponibilite_hebdomadaire").insert(manquantes);
  if (error) {
    console.error(`agenda:seed: disponibilite_hebdomadaire insert failed: ${error.message}`);
    process.exit(1);
  }
  return manquantes.length;
}

// D-17: the eleven French public holidays for the current and next year,
// Easter computed via app.paques -- never hardcoded. Read-then-insert-missing
// against exception_agenda_ferie_unique's partial index: an upsert with
// onConflict:"jour" fails SQLSTATE 42P10 against a partial unique index, and
// would also silently revert a holiday an administrator re-opened.
const JOURS_FIXES = [
  { mois: 1, jour: 1, cle: "jourDeLAn" },
  { mois: 5, jour: 1, cle: "feteDuTravail" },
  { mois: 5, jour: 8, cle: "victoire1945" },
  { mois: 7, jour: 14, cle: "feteNationale" },
  { mois: 8, jour: 15, cle: "assomption" },
  { mois: 11, jour: 1, cle: "toussaint" },
  { mois: 11, jour: 11, cle: "armistice" },
  { mois: 12, jour: 25, cle: "noel" },
];

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function ajouterJours(dateIso, delta) {
  const d = new Date(`${dateIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return isoDate(d);
}

async function seedJoursFeries() {
  const admin = readJson("admin.json");
  const anneeCourante = new Date().getUTCFullYear();
  const annees = [anneeCourante, anneeCourante + 1];

  const { data: existants, error: erreurLecture } = await supabase
    .from("exception_agenda")
    .select("jour")
    .eq("motif", "ferie")
    .gte("jour", `${annees[0]}-01-01`)
    .lte("jour", `${annees[annees.length - 1]}-12-31`);
  if (erreurLecture) {
    console.error(`agenda:seed: exception_agenda read failed: ${erreurLecture.message}`);
    process.exit(1);
  }
  const joursExistants = new Set((existants ?? []).map((r) => r.jour));

  const voulues = [];
  for (const annee of annees) {
    const { data: paques, error: erreurPaques } = await supabase.rpc("paques", { annee });
    if (erreurPaques) {
      console.error(`agenda:seed: app.paques(${annee}) failed: ${erreurPaques.message}`);
      process.exit(1);
    }

    for (const f of JOURS_FIXES) {
      const jour = `${annee}-${String(f.mois).padStart(2, "0")}-${String(f.jour).padStart(2, "0")}`;
      voulues.push({ jour, libelle: admin.joursFeries[f.cle] });
    }
    voulues.push({ jour: ajouterJours(paques, 1), libelle: admin.joursFeries.lundiDePaques });
    voulues.push({ jour: ajouterJours(paques, 39), libelle: admin.joursFeries.ascension });
    voulues.push({ jour: ajouterJours(paques, 50), libelle: admin.joursFeries.lundiDePentecote });
  }

  const manquantes = voulues
    .filter((r) => !joursExistants.has(r.jour))
    .map((r) => ({
      jour: r.jour,
      ouvert: false,
      motif: "ferie",
      libelle: r.libelle,
      heure_debut: null,
      heure_fin: null,
    }));

  if (manquantes.length === 0) return 0;

  const { error } = await supabase.from("exception_agenda").insert(manquantes);
  if (error) {
    console.error(`agenda:seed: exception_agenda (ferie) insert failed: ${error.message}`);
    process.exit(1);
  }
  return manquantes.length;
}

async function main() {
  await promouvoirAdministrateur();
  const typesInseres = await seedTypesRendezVous();
  const libellesAnglais = await seedLibellesAnglais();
  const semaineInseree = await seedSemaineType();
  const feriesInseres = await seedJoursFeries();

  console.log(
    `agenda:seed: done -- administrator promoted, ${typesInseres} type(s) inserted, ${libellesAnglais} English name(s) written, ${semaineInseree} weekly range(s) inserted, ${feriesInseres} holiday(s) inserted`,
  );
}

main();

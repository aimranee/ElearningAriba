// Answers "is anything still mocked?" in one run: reads every _mocks.*.json
// registry beside the locale bundles and reports each remaining placeholder
// with the requirement it blocks. Lot 1 (D-01) ships client-dependent copy as
// explicit mocks with a known end (D-02); this is the guard that keeps that
// bridge honest until the client's real answers replace them.
//
// Deliberately NOT wired into `lint`, `typecheck`, `build` or any CI workflow
// (D-09): it is designed to fail for the whole of Lot 1, so wiring it into the
// PR gate would block every merge in the lot and the pressure would be to
// delete the guard instead of closing the mocks. Run it by hand with
// `npm run content:check`.
//
// #29 (parent #17): the registry stays French-only, one entry per value —
// but since #19 an English translation can exist beside it at
// src/locales/en/<same file>#<same key>. Below the French lines, this also
// lists each entry's English twin when that file and key exist, via the
// pure lookup in src/lib/content/mock-english-twin.ts (kept out of this
// script so the twin logic has a test without reading real files).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { findEnglishTwin } from "../src/lib/content/mock-english-twin.ts";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const localesDir = join(rootDir, "src/locales/fr");
const localesEnDir = join(rootDir, "src/locales/en");

const registryNames = readdirSync(localesDir).filter((f) =>
  /^_mocks\..*\.json$/.test(f),
);

if (registryNames.length === 0) {
  console.error(
    "check-mock-content: no _mocks.*.json registry found in src/locales/fr — " +
      "deleting the registries is not a way to close the gate",
  );
  process.exit(1);
}

function resolvePath(bundle, key) {
  return key
    .split(".")
    .reduce(
      (value, segment) => (value === undefined ? undefined : value[segment]),
      bundle,
    );
}

let outstanding = 0;
let unresolvable = 0;
const perRequirement = new Map();
const resolvedMocks = [];

for (const registryName of registryNames) {
  const registry = JSON.parse(
    readFileSync(join(localesDir, registryName), "utf8"),
  );

  for (const mock of registry.mocks) {
    const bundlePath = join(localesDir, mock.file);
    let bundle;
    try {
      bundle = JSON.parse(readFileSync(bundlePath, "utf8"));
    } catch {
      console.error(
        `check-mock-content: ${mock.file}#${mock.key} — bundle file unreadable (registry drift)`,
      );
      unresolvable += 1;
      continue;
    }

    const value = resolvePath(bundle, mock.key);
    if (value === undefined) {
      console.error(
        `check-mock-content: ${mock.file}#${mock.key} — unresolvable key (registry drifted from the bundle)`,
      );
      unresolvable += 1;
      continue;
    }

    console.error(
      `check-mock-content: ${mock.file}#${mock.key} — bloque ${mock.blocks} — en attente de ${mock.awaiting}`,
    );
    outstanding += 1;
    perRequirement.set(mock.blocks, (perRequirement.get(mock.blocks) ?? 0) + 1);
    resolvedMocks.push(mock);
  }
}

if (perRequirement.size > 0) {
  console.error("check-mock-content: par exigence —");
  for (const [requirement, count] of perRequirement) {
    console.error(`check-mock-content:   ${requirement}: ${count}`);
  }
}

const englishBundleCache = new Map();

function readEnglishBundle(file) {
  if (englishBundleCache.has(file)) {
    return englishBundleCache.get(file);
  }
  const bundlePath = join(localesEnDir, file);
  const bundle = existsSync(bundlePath)
    ? JSON.parse(readFileSync(bundlePath, "utf8"))
    : undefined;
  englishBundleCache.set(file, bundle);
  return bundle;
}

const perRequirementEnglish = new Map();

for (const mock of resolvedMocks) {
  const englishValue = findEnglishTwin(mock, readEnglishBundle(mock.file));
  if (englishValue === undefined) {
    continue;
  }

  console.error(
    `check-mock-content: [en] ${mock.file}#${mock.key} — bloque ${mock.blocks} — en attente de ${mock.awaiting}`,
  );
  perRequirementEnglish.set(
    mock.blocks,
    (perRequirementEnglish.get(mock.blocks) ?? 0) + 1,
  );
}

if (perRequirementEnglish.size > 0) {
  console.error("check-mock-content: par exigence (anglais) —");
  for (const [requirement, count] of perRequirementEnglish) {
    console.error(`check-mock-content:   ${requirement}: ${count}`);
  }
}

if (unresolvable > 0) {
  console.error(
    `check-mock-content: ${unresolvable} clé(s) de registre non résolvable(s)`,
  );
}

if (outstanding > 0 || unresolvable > 0) {
  process.exit(1);
}

console.log("check-mock-content: aucune valeur mockée restante");

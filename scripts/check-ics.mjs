// Answers "is the hand-rolled .ics builder shaped correctly?" in one run:
// builds a fixture VEVENT through the real src/lib/agenda/ics.ts and asserts
// RFC 5545's line-ending, folding, escaping and required-property rules
// against its actual output. AGD-06's .ics has no test framework in this
// repo (T-04-SC, zero-dependency budget) — this is a plain node script, run
// by hand or via `npm run ics:check`, exactly like check-mock-content.mjs.
//
// Deliberately NOT wired into `lint`, `typecheck` or `build`.
//
// `import "server-only"` inside ics.ts only throws when resolved under the
// default export condition (the browser/bundler path) — the `react-server`
// condition it also declares is a no-op, which is what Next.js's server
// tree uses. Passing --conditions=react-server here reproduces that same
// resolution outside of Next.js, so this script can import the real module
// unmodified rather than re-implementing its rules a second time.

import { construireIcs } from "../src/lib/agenda/ics.ts";

let failures = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`OK: ${message}`);
  } else {
    failures += 1;
    console.error(`FAIL: ${message}`);
  }
}

// A SUMMARY long and accented enough (multi-byte UTF-8) to force a fold at
// 75 octets, and a DESCRIPTION carrying both a semicolon and a comma to
// exercise escaping.
const fixtureSummary =
  "Session individuelle SAP Ariba — préparation détaillée, échanges " +
  "approfondis et débriefing complet avec le formateur certifié";
const fixtureDescription =
  "Rendez-vous confirmé; merci de vous connecter cinq minutes avant, " +
  "muni de votre identifiant.";

const ics = construireIcs({
  uid: "11111111-1111-1111-1111-111111111111@formation-sap-ariba.fr",
  sequence: 0,
  debut: new Date("2026-09-08T12:30:00Z"),
  fin: new Date("2026-09-08T13:30:00Z"),
  titre: fixtureSummary,
  description: fixtureDescription,
  lieu: "https://meet.google.com/placeholder-cto-local",
  organisateurEmail: "contact@formation-sap-ariba.fr",
  participantEmail: "apprenant@example.test",
});

// 1. Every line ends with CRLF, and no bare LF exists anywhere.
const withoutCrlf = ics.replace(/\r\n/g, "");
assert(!withoutCrlf.includes("\n"), "no bare line-feed exists anywhere in the document");
assert(ics.endsWith("\r\n"), "the document is terminated with a CRLF pair");

const rawLines = ics.split("\r\n").slice(0, -1); // drop the trailing empty segment

// 2. Exactly one BEGIN/END pair for VCALENDAR and one for VEVENT.
function countLines(needle) {
  return rawLines.filter((line) => line === needle).length;
}
assert(countLines("BEGIN:VCALENDAR") === 1 && countLines("END:VCALENDAR") === 1, "exactly one BEGIN:VCALENDAR/END:VCALENDAR pair");
assert(countLines("BEGIN:VEVENT") === 1 && countLines("END:VEVENT") === 1, "exactly one BEGIN:VEVENT/END:VEVENT pair");

// 3. Required properties present, every DT value ends in Z. Folded
// continuation lines (leading space) are excluded from the property-prefix
// check by only matching lines that start at column 0 with the property name.
function findUnfoldedValue(prefix) {
  const idx = rawLines.findIndex((line) => line.startsWith(prefix));
  if (idx === -1) return null;
  let value = rawLines[idx].slice(prefix.length);
  let next = idx + 1;
  while (next < rawLines.length && rawLines[next].startsWith(" ")) {
    value += rawLines[next].slice(1);
    next += 1;
  }
  return value;
}

const uid = findUnfoldedValue("UID:");
const sequence = findUnfoldedValue("SEQUENCE:");
const dtstamp = findUnfoldedValue("DTSTAMP:");
const dtstart = findUnfoldedValue("DTSTART:");
const dtend = findUnfoldedValue("DTEND:");

assert(uid !== null && uid.length > 0, "UID: is present");
assert(sequence !== null && sequence.length > 0, "SEQUENCE: is present");
assert(dtstamp !== null && dtstamp.endsWith("Z"), "DTSTAMP: is present and ends in Z (UTC)");
assert(dtstart !== null && dtstart.endsWith("Z"), "DTSTART: is present and ends in Z (UTC)");
assert(dtend !== null && dtend.endsWith("Z"), "DTEND: is present and ends in Z (UTC)");

// 4. No physical line exceeds 75 octets; every continuation line begins
// with a single space.
let anyLineTooLong = false;
let anyBadContinuation = false;
for (let i = 0; i < rawLines.length; i += 1) {
  const line = rawLines[i];
  const byteLength = Buffer.byteLength(line, "utf8");
  if (byteLength > 75) anyLineTooLong = true;
  if (line.startsWith(" ") && line.startsWith("  ")) anyBadContinuation = true;
}
assert(!anyLineTooLong, "no physical line exceeds 75 octets");
assert(!anyBadContinuation, "every continuation line begins with exactly one space");

// 5. Unfolding restores the original accented SUMMARY byte for byte.
const summaryPrefix = "SUMMARY:";
const unfoldedSummaryEscaped = findUnfoldedValue(summaryPrefix);
const expectedEscapedSummary = fixtureSummary
  .replace(/\\/g, "\\\\")
  .replace(/;/g, "\\;")
  .replace(/,/g, "\\,");
assert(
  unfoldedSummaryEscaped === expectedEscapedSummary,
  "unfolding SUMMARY restores the original accented text byte for byte",
);

// 6. A semicolon and a comma inside the description survive as their
// escaped forms.
const unfoldedDescription = findUnfoldedValue("DESCRIPTION:");
assert(
  unfoldedDescription !== null && unfoldedDescription.includes("\\;") && unfoldedDescription.includes("\\,"),
  "a semicolon and a comma inside DESCRIPTION survive escaped",
);

if (failures > 0) {
  console.error(`\ncheck-ics: ${failures} assertion(s) failed`);
  process.exit(1);
}

console.log(`\ncheck-ics: all assertions passed`);

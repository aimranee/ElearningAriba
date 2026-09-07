import "server-only";

/*
 * Hand-rolled RFC 5545 VEVENT builder (AGD-06). No `ics`/`ical-generator`
 * dependency (T-04-SC, zero-dependency budget) — the output is ~40 lines and
 * every rule below is a proven interoperability bug class, not a style
 * choice. All instants are emitted in UTC (`…Z`), so no timezone-definition
 * component is ever needed and DST cannot be got wrong. Every French
 * string (titre, description, lieu) arrives as an argument read by the
 * caller from src/locales/fr/emails.json — nothing French is authored in
 * this file.
 */

const CRLF = "\r\n";

/** RFC 5545 §3.3.5 — basic-format UTC, e.g. 20260908T143000Z. */
function toIcsUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** RFC 5545 §3.3.11 — TEXT escaping. Backslash first, or it double-escapes. */
function escapeText(v: string): string {
  return v
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * RFC 5545 §3.1 — fold at 75 OCTETS (not characters): French accented copy
 * is multi-byte in UTF-8, and a character-count fold would split a line
 * mid-character on export from a naive implementation. Continuation lines
 * are prefixed by a single space and a UTF-8 continuation byte is never
 * split.
 */
function fold(line: string): string {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;

  const out: string[] = [];
  let start = 0;
  while (start < bytes.length) {
    let end = Math.min(start + (out.length === 0 ? 75 : 74), bytes.length);
    while (end > start && end < bytes.length && (bytes[end] & 0xc0) === 0x80) {
      end -= 1;
    }
    out.push((out.length === 0 ? "" : " ") + bytes.subarray(start, end).toString("utf8"));
    start = end;
  }
  return out.join(CRLF);
}

export interface IcsInput {
  uid: string;
  sequence: number;
  debut: Date;
  fin: Date;
  titre: string;
  description: string;
  lieu: string;
  organisateurEmail: string;
  participantEmail: string;
  annule?: boolean;
}

/**
 * Builds a complete VCALENDAR/VEVENT document. `uid`/`sequence` carry
 * through from the reservation row's `ics_uid`/`ics_sequence` — the same
 * UID with an incremented SEQUENCE is what lets Lot 8 send an update rather
 * than a duplicate.
 */
export function construireIcs(e: IcsInput): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//formation-sap-ariba.fr//Agenda//FR",
    "CALSCALE:GREGORIAN",
    `METHOD:${e.annule ? "CANCEL" : "REQUEST"}`,
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `SEQUENCE:${e.sequence}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(e.debut)}`,
    `DTEND:${toIcsUtc(e.fin)}`,
    `SUMMARY:${escapeText(e.titre)}`,
    `DESCRIPTION:${escapeText(e.description)}`,
    `LOCATION:${escapeText(e.lieu)}`,
    `ORGANIZER;CN=${escapeText(e.titre)}:mailto:${e.organisateurEmail}`,
    `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED:mailto:${e.participantEmail}`,
    `STATUS:${e.annule ? "CANCELLED" : "CONFIRMED"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join(CRLF) + CRLF;
}

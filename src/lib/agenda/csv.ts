import "server-only";

/**
 * D-19: a CSV that opens correctly and safely in French Excel. No csv
 * library (T-04-SC, zero-dependency budget) — the shape below is a proven
 * recipe (04-RESEARCH.md Pattern 10), not a style choice:
 *  - a leading UTF-8 BOM, or Excel FR renders é as Ã©
 *  - `;` as the field separator — Excel FR's list separator; a comma puts
 *    every row in one cell
 *  - CRLF line endings
 *  - every cell double-quoted, with an internal quote doubled
 *  - a formula-injection guard: a cell beginning with `=`, `+`, `-`, `@`, a
 *    tab or a carriage return is prefixed with a single quote so Excel
 *    renders it as text instead of executing it (T-04-44)
 *
 * No French string is authored here — every header/row value arrives as an
 * argument from the caller, sourced from src/locales/fr/admin.json.
 */

const BOM = "﻿";
const SEP = ";";
const EOL = "\r\n";

/** Formula-injection guard + CSV quoting for a single cell value. */
function cell(value: string): string {
  const neutralise = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${neutralise.replace(/"/g, '""')}"`;
}

/**
 * Builds the complete CSV string from an already-read header row and data
 * rows. Callers never assemble a French label or a formatted date/hour/price
 * here — those arrive pre-formatted, exactly as src/lib/email/render.ts
 * requires of its own callers.
 */
export function construireCsv(
  header: readonly string[],
  rows: readonly (readonly string[])[],
): string {
  const lignes = [header, ...rows].map((ligne) => ligne.map(cell).join(SEP));
  return BOM + lignes.join(EOL) + EOL;
}

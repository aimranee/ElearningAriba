import "server-only";

/*
 * why: a dependency-free PDF 1.4 writer was chosen over a PDF library —
 * this lot needs text-only output built from five database rows, and the
 * base-14 Helvetica fonts plus WinAnsiEncoding cover every character in the
 * signed French copy (accented vowels, cedilla, guillemets) without
 * embedding a font program or adding a package.
 */

export type FontWeight = "regular" | "bold";

export type TextRun = {
  x: number;
  y: number;
  size: number;
  weight: FontWeight;
  text: string;
};

export type PdfPage = {
  runs: TextRun[];
};

export type PageSize = { width: number; height: number };

/** A4 in points (1/72 inch), the only page size this writer supports. */
export const A4: PageSize = { width: 595.28, height: 841.89 };

export type PdfLine = {
  text: string;
  size: number;
  weight: FontWeight;
  /** Extra vertical space, in points, inserted after this line. */
  gapAfter?: number;
  /**
   * Leading part of `text` (a bullet and its space) that wrapped continuation
   * lines indent past, so they hang under the text rather than the bullet.
   */
  hangingPrefix?: string;
};

export type LayoutOptions = {
  size?: PageSize;
  marginX?: number;
  marginTop?: number;
  marginBottom?: number;
  /** Multiplier of font size used as the baseline-to-baseline step. */
  lineHeightFactor?: number;
};

/*
 * why: WinAnsiEncoding matches Unicode/Latin-1 code points for the whole
 * range this document needs (0x20-0x7e, and 0xa0-0xff for accented French
 * letters and the guillemets), so a direct code-point-to-byte pass covers
 * almost everything. `Intl.NumberFormat`'s fr-FR unit formatter (used by
 * formatHours) and ordinary French typography introduce a handful of
 * typographic Unicode characters — narrow no-break space, curly quotes, en/
 * em dash, ellipsis, bullet — that sit outside 0-255; those get their
 * WinAnsi-native code point where one exists (the bullet lives at 0x95) or
 * a lossless-enough ASCII stand-in otherwise, instead of crashing the render.
 */
const WINANSI_SUBSTITUTIONS: ReadonlyMap<number, number> = new Map([
  [0x2019, 0x27], // right single quotation mark -> apostrophe
  [0x2018, 0x27], // left single quotation mark -> apostrophe
  [0x201c, 0x22], // left double quotation mark -> straight quote
  [0x201d, 0x22], // right double quotation mark -> straight quote
  [0x2013, 0x2d], // en dash -> hyphen
  [0x2014, 0x2d], // em dash -> hyphen
  [0x2026, 0x2e], // horizontal ellipsis -> full stop
  [0x2022, 0x95], // bullet -> WinAnsiEncoding's own bullet code point (0x95)
  [0x202f, 0x20], // narrow no-break space -> space
  [0x2009, 0x20], // thin space -> space
  [0x2007, 0x20], // figure space -> space
]);

function winAnsiByte(codePoint: number): number {
  if (codePoint <= 0xff) {
    return codePoint;
  }
  const substitute = WINANSI_SUBSTITUTIONS.get(codePoint);
  if (substitute !== undefined) {
    return substitute;
  }
  throw new Error(
    `Character U+${codePoint.toString(16).padStart(4, "0")} has no WinAnsiEncoding mapping`,
  );
}

/** Encodes one PDF literal-string body: WinAnsi bytes with `(`, `)`, `\` escaped. */
function encodeWinAnsiLiteral(text: string): number[] {
  const bytes: number[] = [];
  for (const char of text) {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) {
      continue;
    }
    const byte = winAnsiByte(codePoint);
    if (byte === 0x28 || byte === 0x29 || byte === 0x5c) {
      bytes.push(0x5c);
    }
    bytes.push(byte);
  }
  return bytes;
}

/** Accumulates raw file bytes and tracks the current length for xref offsets. */
class ByteWriter {
  private data: number[] = [];

  get length(): number {
    return this.data.length;
  }

  /** Appends a structural PDF string; every code point here must be <= 0xff. */
  writeString(text: string): void {
    for (let i = 0; i < text.length; i++) {
      this.data.push(text.charCodeAt(i));
    }
  }

  writeBytes(bytes: number[]): void {
    for (const byte of bytes) {
      this.data.push(byte);
    }
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.data);
  }
}

function writeContentStream(writer: ByteWriter, page: PdfPage): void {
  writer.writeString("q\n");
  for (const run of page.runs) {
    const font = run.weight === "bold" ? "/F2" : "/F1";
    writer.writeString(`BT\n${font} ${run.size} Tf\n1 0 0 1 ${run.x} ${run.y} Tm\n(`);
    writer.writeBytes(encodeWinAnsiLiteral(run.text));
    writer.writeString(") Tj\nET\n");
  }
  writer.writeString("Q");
}

/**
 * Builds a complete PDF 1.4 file from an ordered set of pages, each holding
 * absolutely-positioned text runs. Emits Catalog, Pages, two base-14 fonts
 * (Helvetica, Helvetica-Bold, both WinAnsiEncoding), one Page + Contents
 * stream pair per page, and a byte-accurate xref table and trailer.
 */
export function buildPdf(pages: PdfPage[], size: PageSize = A4): Uint8Array {
  if (pages.length === 0) {
    throw new Error("buildPdf requires at least one page");
  }

  const writer = new ByteWriter();
  const offsets: number[] = [];

  const startObj = (objNum: number) => {
    offsets[objNum] = writer.length;
    writer.writeString(`${objNum} 0 obj\n`);
  };
  const endObj = () => {
    writer.writeString("endobj\n");
  };

  // Binary marker comment (bytes > 0x7f) signals a binary file to transfer tools.
  writer.writeString("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n");

  const catalogNum = 1;
  const pagesNum = 2;
  const fontRegularNum = 3;
  const fontBoldNum = 4;
  let nextObjNum = 5;

  const pageNums: number[] = [];
  const contentNums: number[] = [];
  for (let i = 0; i < pages.length; i++) {
    pageNums.push(nextObjNum++);
    contentNums.push(nextObjNum++);
  }
  const totalObjects = nextObjNum - 1;

  startObj(catalogNum);
  writer.writeString(`<< /Type /Catalog /Pages ${pagesNum} 0 R >>\n`);
  endObj();

  startObj(pagesNum);
  const kids = pageNums.map((n) => `${n} 0 R`).join(" ");
  writer.writeString(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>\n`);
  endObj();

  startObj(fontRegularNum);
  writer.writeString(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\n",
  );
  endObj();

  startObj(fontBoldNum);
  writer.writeString(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\n",
  );
  endObj();

  for (let i = 0; i < pages.length; i++) {
    const pageNum = pageNums[i];
    const contentNum = contentNums[i];

    startObj(pageNum);
    writer.writeString(
      `<< /Type /Page /Parent ${pagesNum} 0 R /MediaBox [0 0 ${size.width} ${size.height}] ` +
        `/Resources << /Font << /F1 ${fontRegularNum} 0 R /F2 ${fontBoldNum} 0 R >> >> ` +
        `/Contents ${contentNum} 0 R >>\n`,
    );
    endObj();

    const streamWriter = new ByteWriter();
    writeContentStream(streamWriter, pages[i]);
    const streamBytes = streamWriter.toUint8Array();

    startObj(contentNum);
    writer.writeString(`<< /Length ${streamBytes.length} >>\nstream\n`);
    writer.writeBytes(Array.from(streamBytes));
    writer.writeString("\nendstream\n");
    endObj();
  }

  const xrefOffset = writer.length;
  writer.writeString(`xref\n0 ${totalObjects + 1}\n`);
  writer.writeString("0000000000 65535 f \n");
  for (let n = 1; n <= totalObjects; n++) {
    const offset = offsets[n].toString().padStart(10, "0");
    writer.writeString(`${offset} 00000 n \n`);
  }
  writer.writeString(
    `trailer\n<< /Size ${totalObjects + 1} /Root ${catalogNum} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
  );

  return writer.toUint8Array();
}

/*
 * why (#32): wrapping needs glyph advance widths, and the base-14 fonts carry
 * none in the file. These are Adobe's Core14 AFM widths (1/1000 em) for the
 * WinAnsiEncoding bytes 0x20-0xff this writer emits — the metrics every
 * viewer uses for a non-embedded Helvetica. The writer draws no kerning, so a
 * run's width is the plain sum.
 */
const WIDTHS_FROM_0X20: Record<FontWeight, readonly number[]> = {
  regular: [
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, // 0x20
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, // 0x30
    1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, // 0x40
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, // 0x50
    333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, // 0x60
    556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584, 350, // 0x70
    556, 350, 222, 556, 333, 1000, 556, 556, 333, 1000, 667, 333, 1000, 350, 611, 350, // 0x80
    350, 222, 222, 333, 333, 350, 556, 1000, 333, 1000, 500, 333, 944, 350, 500, 667, // 0x90
    278, 333, 556, 556, 556, 556, 260, 556, 333, 737, 370, 556, 584, 333, 737, 333, // 0xa0
    400, 584, 333, 333, 333, 556, 537, 278, 333, 333, 365, 556, 834, 834, 834, 611, // 0xb0
    667, 667, 667, 667, 667, 667, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, // 0xc0
    722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, // 0xd0
    556, 556, 556, 556, 556, 556, 889, 500, 556, 556, 556, 556, 278, 278, 278, 278, // 0xe0
    556, 556, 556, 556, 556, 556, 556, 584, 611, 556, 556, 556, 556, 500, 556, 500, // 0xf0
  ],
  bold: [
    278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, // 0x20
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, // 0x30
    975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, // 0x40
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, // 0x50
    333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, // 0x60
    611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584, 350, // 0x70
    556, 350, 278, 556, 500, 1000, 556, 556, 333, 1000, 667, 333, 1000, 350, 611, 350, // 0x80
    350, 278, 278, 500, 500, 350, 556, 1000, 333, 1000, 556, 333, 944, 350, 500, 667, // 0x90
    278, 333, 556, 556, 556, 556, 280, 556, 333, 737, 370, 556, 584, 333, 737, 333, // 0xa0
    400, 584, 333, 333, 333, 611, 556, 278, 333, 333, 365, 556, 834, 834, 834, 611, // 0xb0
    722, 722, 722, 722, 722, 722, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, // 0xc0
    722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, // 0xd0
    556, 556, 556, 556, 556, 556, 889, 556, 556, 556, 556, 556, 278, 278, 278, 278, // 0xe0
    611, 611, 611, 611, 611, 611, 611, 584, 611, 611, 611, 611, 611, 556, 611, 556, // 0xf0
  ],
};

/** Width, in points, of `text` drawn by this writer in the given font and size. */
export function measureText(text: string, weight: FontWeight, size: number): number {
  const widths = WIDTHS_FROM_0X20[weight];
  let units = 0;
  for (const char of text) {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) {
      continue;
    }
    // Control bytes below 0x20 have no glyph: count a full em so a line
    // carrying one is over-measured, never drawn past the margin.
    units += widths[winAnsiByte(codePoint) - 0x20] ?? 1000;
  }
  return (units * size) / 1000;
}

export type WrappedText = {
  lines: string[];
  /** Words wider than a whole line, each left unsplit on a line of its own. */
  overlong: string[];
};

/**
 * Breaks `text` into lines no wider than `maxWidth`, at U+0020 spaces only
 * (no-break spaces hold). Continuation lines must fit `maxWidth -
 * continuationIndent`. Text that already fits comes back unchanged.
 */
export function wrapText(
  text: string,
  weight: FontWeight,
  size: number,
  maxWidth: number,
  continuationIndent = 0,
): WrappedText {
  if (measureText(text, weight, size) <= maxWidth) {
    return { lines: [text], overlong: [] };
  }

  const lines: string[] = [];
  const overlong: string[] = [];
  let current: string | null = null;
  const fits = (line: string) =>
    measureText(line, weight, size) <=
    (lines.length === 0 ? maxWidth : maxWidth - continuationIndent);

  for (const word of text.split(" ")) {
    if (current !== null) {
      const candidate: string = `${current} ${word}`;
      if (fits(candidate)) {
        current = candidate;
        continue;
      }
      lines.push(current.trimEnd());
      current = null;
    }
    // A line never starts with the spaces a break consumed.
    if (word === "") {
      continue;
    }
    current = word;
    if (!fits(current)) {
      overlong.push(current);
    }
  }
  if (current !== null) {
    lines.push(current.trimEnd());
  }

  return { lines, overlong };
}

/**
 * Lays out an ordered list of lines top-down within the page margins,
 * wrapping any line wider than the space between them (#32), and starting a
 * new page whenever the next line would cross the bottom margin — the
 * page-break helper that lets content longer than one page continue onto
 * a second without the caller pre-computing positions.
 */
export function layoutLines(lines: PdfLine[], options: LayoutOptions = {}): PdfPage[] {
  const size = options.size ?? A4;
  const marginX = options.marginX ?? 56;
  const marginTop = options.marginTop ?? 56;
  const marginBottom = options.marginBottom ?? 56;
  const lineHeightFactor = options.lineHeightFactor ?? 1.4;

  const pages: PdfPage[] = [];
  let currentRuns: TextRun[] = [];
  let y = size.height - marginTop;

  const startNewPage = () => {
    pages.push({ runs: currentRuns });
    currentRuns = [];
    y = size.height - marginTop;
  };

  const maxWidth = size.width - 2 * marginX;

  for (const line of lines) {
    const lineHeight = line.size * lineHeightFactor;
    const prefix = line.hangingPrefix ?? "";
    if (!line.text.startsWith(prefix)) {
      throw new Error(`hangingPrefix "${prefix}" does not start "${line.text}"`);
    }
    const indent = Math.round(measureText(prefix, line.weight, line.size) * 1000) / 1000;
    const wrapped = wrapText(line.text, line.weight, line.size, maxWidth, indent);
    if (wrapped.overlong.length > 0) {
      console.warn("layoutLines: words wider than the line left unsplit", wrapped.overlong);
    }

    wrapped.lines.forEach((text, index) => {
      if (currentRuns.length > 0 && y - lineHeight < marginBottom) {
        startNewPage();
      }
      const x = index === 0 ? marginX : marginX + indent;
      currentRuns.push({ x, y, size: line.size, weight: line.weight, text });
      // why: one subtraction per source line, as before #32, keeps the
      // floating-point baselines — and the bytes — of unwrapped documents.
      const isLast = index === wrapped.lines.length - 1;
      y -= isLast ? lineHeight + (line.gapAfter ?? 0) : lineHeight;
    });
  }

  if (currentRuns.length > 0 || pages.length === 0) {
    pages.push({ runs: currentRuns });
  }

  return pages;
}

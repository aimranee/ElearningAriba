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
export type PdfOptions = {
  /** BCP 47 tag written to the catalog's /Lang; omitted when absent. */
  lang?: string;
};

export function buildPdf(
  pages: PdfPage[],
  size: PageSize = A4,
  options: PdfOptions = {},
): Uint8Array {
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
  // why (#25): only the English programme declares a language, so the French
  // PDF keeps its base bytes.
  const lang = options.lang ? ` /Lang (${options.lang})` : "";
  writer.writeString(`<< /Type /Catalog /Pages ${pagesNum} 0 R${lang} >>\n`);
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

/**
 * Lays out an ordered list of lines top-down within the page margins,
 * starting a new page whenever the next line would cross the bottom margin —
 * the page-break helper that lets content longer than one page continue onto
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

  for (const line of lines) {
    const lineHeight = line.size * lineHeightFactor;
    if (currentRuns.length > 0 && y - lineHeight < marginBottom) {
      startNewPage();
    }
    currentRuns.push({ x: marginX, y, size: line.size, weight: line.weight, text: line.text });
    y -= lineHeight + (line.gapAfter ?? 0);
  }

  if (currentRuns.length > 0 || pages.length === 0) {
    pages.push({ runs: currentRuns });
  }

  return pages;
}

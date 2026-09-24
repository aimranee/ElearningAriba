/*
 * why (#29, parent #17): content:check's registries in src/locales/fr are
 * French-only — one entry covers both languages (#19 mirrors a French file
 * key for key into src/locales/en/<file> when that file has been
 * translated). This is the pure lookup that resolves a registered French
 * entry's English twin: the same dotted key path in the already-parsed
 * English bundle for that file, or `undefined` when the English file
 * doesn't exist yet or doesn't carry the key — both are "no English line
 * yet", never an error. Kept file-I/O free so
 * scripts/check-mock-content.mjs's directory scanning stays out of the
 * test; the script supplies the parsed bundle, this function only resolves
 * the path.
 */

export interface MockEntry {
  file: string;
  key: string;
  blocks: string;
  awaiting: string;
}

export type LocaleBundle = Record<string, unknown>;

function resolvePath(bundle: LocaleBundle, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>((value, segment) => {
      if (value === undefined || value === null) return undefined;
      return (value as Record<string, unknown>)[segment];
    }, bundle);
}

/**
 * Resolves the English twin of one registered French mock entry.
 *
 * `englishBundle` is the already-parsed src/locales/en/<entry.file> bundle,
 * or `undefined` when that file does not exist (or hasn't been read) for
 * this entry. Returns the resolved English value, or `undefined` when the
 * bundle is absent or does not carry the key at that path.
 */
export function findEnglishTwin(entry: MockEntry, englishBundle: LocaleBundle | undefined): unknown {
  if (englishBundle === undefined) {
    return undefined;
  }
  return resolvePath(englishBundle, entry.key);
}

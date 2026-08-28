// Wrapper around `supabase gen types`: the CLI has no header/banner flag, and a
// shell redirect would truncate the committed file if generation fails.
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { EOL } from "node:os";

const HEADER = `// GENERATED FILE — do not hand-edit.
// Regenerate with \`npm run db:types\` after applying a new migration under
// supabase/migrations/. Reflects the local stack's public and app schemas.
`;

const outPath = join(
  dirname(dirname(fileURLToPath(import.meta.url))),
  "src/types/database.types.ts",
);

// npx resolves to a .cmd shim on Windows, which node can only invoke through a shell.
const result = spawnSync(
  "npx",
  ["supabase", "gen", "types", "typescript", "--local", "--schema", "public,app"],
  { encoding: "utf8", shell: true },
);

if (result.error) {
  console.error(`db:types: failed to spawn supabase CLI: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(`db:types: supabase CLI exited with code ${result.status}`);
  if (result.stderr) console.error(result.stderr);
  process.exit(1);
}

const output = result.stdout;
if (!output || !output.includes("export type Json")) {
  console.error("db:types: supabase CLI produced empty or unexpected output; existing file left untouched");
  if (result.stderr) console.error(result.stderr);
  process.exit(1);
}

// Match the platform's git checkout line endings (core.autocrlf converts to
// CRLF on Windows), so the write doesn't produce a spurious diff via git status.
const content = `${HEADER}\n${output}`.replace(/\r\n|\n/g, "\n").replace(/\n/g, EOL);
writeFileSync(outPath, content, "utf8");
console.log(`db:types: wrote ${outPath}`);

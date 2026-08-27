// Re-exports both env modules. Kept as two separate files rather than one:
// importing the server module from a client component would pull the
// service-role key into the browser bundle. Client components must only
// ever import from "@/lib/env/client".
export { serverEnv } from "./server";
export type { ServerEnv } from "./server";
export { clientEnv } from "./client";
export type { ClientEnv } from "./client";

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// why: duplicated verbatim in header.tsx and footer.tsx (§3.3); this plan
// adds a third consumer class of interactive non-Button elements, which is
// the point the pattern map flags as justifying extraction. header.tsx and
// footer.tsx are not rewritten here — that belongs to plan 02-04.
export const FOCUS_RING =
  "outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring rounded-md"

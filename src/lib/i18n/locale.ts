/* why (#17): French is the site's language and stays at the root; English
   is a copy under /en/…. Every locale-aware seam takes this type. */
export type Locale = "fr" | "en";

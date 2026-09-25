-- Bilingual Phase A (#17, I18N-07; #24): a nullable English twin of the one
-- text column of app.type_rendez_vous that the public agenda displays, the
-- type's name. French stays required and its column is untouched; the
-- English agenda reads `libelle_en` and falls back to `libelle` when it is
-- null or blank (src/lib/agenda/types-rendez-vous.ts).
-- Not translated on purpose: `id` (a key), and the numeric columns
-- (duration, buffer, price, order), which the page formats per language.
-- The admin does not edit this column until Phase C (Lot 10): its PATCH
-- writes the four French fields only.
-- Strictly additive: the table-level grants (20260901181000) cover the new
-- column, RLS is unchanged, and the booking RPCs read the row by %rowtype.
-- Reversible with:
--   alter table app.type_rendez_vous drop column libelle_en;

alter table app.type_rendez_vous
  add column libelle_en text;

comment on column app.type_rendez_vous.libelle_en is 'English twin of `libelle`; null or blank falls back to French (#17, #24). Not edited by the admin until Phase C.';

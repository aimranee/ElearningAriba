-- Bilingual Phase A (#17, I18N-07): a nullable English twin beside every
-- public-facing text column of the content tables. French stays required and
-- its columns are untouched; the English site reads the *_en column and falls
-- back to the French one field by field when the English value is null or
-- blank (src/lib/content/localize.ts). `donnees_en` carries the same shape as
-- `donnees` and is validated by the same zod schemas at read time.
-- Not translated on purpose: `cle`, `section_cle`, `picto` (icon key),
-- `statut` (enum-like key), `duree_heures`, `position`, `publie`.
-- Strictly additive: the table-level grants to anon and service_role
-- (20260830090000, 20260830093000) cover the new columns, and RLS is
-- unchanged.
-- Reversible with:
--   alter table app.content_section
--     drop column eyebrow_en, drop column titre_en,
--     drop column titre_accent_en, drop column lead_en;
--   alter table app.content_item
--     drop column titre_en, drop column description_en, drop column donnees_en;

alter table app.content_section
  add column eyebrow_en text,
  add column titre_en text,
  add column titre_accent_en text,
  add column lead_en text;

alter table app.content_item
  add column titre_en text,
  add column description_en text,
  add column donnees_en jsonb;

comment on column app.content_section.titre_en is 'English twin of `titre`; null or blank falls back to French (#17).';
comment on column app.content_item.donnees_en is 'English twin of `donnees`, same shape; a null value, or a key missing or blank inside it, falls back to the French key (#17).';

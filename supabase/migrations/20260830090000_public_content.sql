-- The public site reads content from the database, not from the JSON bundle
-- (D-24): landing sections, programme modules, format items, trust facts and
-- FAQ entries all live as rows here, seeded from the signed
-- src/locales/fr/*.json bundles. This migration sets the table/RLS precedent
-- for Lots 3-10. Strictly additive: it creates objects only, no `alter` and
-- no `drop` against anything Phase 0 made.
-- Reversible with:
--   drop table app.content_item, app.content_section, app.contact_message cascade;

create table app.content_section (
  id uuid primary key default gen_random_uuid(),
  cle text not null unique,
  eyebrow text,
  titre text not null,
  titre_accent text,
  lead text,
  position integer not null,
  publie boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table app.content_section is 'Public landing/page sections (hero, pour-qui, programme, faq, ...), keyed on a stable `cle` the seed upserts on (D-27).';

create table app.content_item (
  id uuid primary key default gen_random_uuid(),
  section_cle text not null references app.content_section(cle) on delete cascade,
  cle text not null,
  titre text,
  description text,
  picto text,
  duree_heures integer,
  statut text,
  position integer not null,
  publie boolean not null default true,
  donnees jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_cle, cle)
);

comment on table app.content_item is 'Rows within a content_section (profils, competences, modules, format items, faits de confiance, faq). `duree_heures` stays numeric so totals are computed at read time (D-30); `donnees` holds per-page arrays (objectifs, contenu, deroule, fourni, question, reponse) that do not deserve their own table.';

create table app.contact_message (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  email text not null,
  telephone text,
  profil text not null,
  message text not null,
  created_at timestamptz not null default now()
);

comment on table app.contact_message is 'Contact form submissions. No delete policy and no delete route here — deletion and export are Lot 5 RGPD work (D-37).';

-- updated_at trigger, attached to both content tables.
create function app.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger content_section_touch_updated_at
  before update on app.content_section
  for each row
  execute function app.touch_updated_at();

create trigger content_item_touch_updated_at
  before update on app.content_item
  for each row
  execute function app.touch_updated_at();

-- Row level security (D-28): anon can read published content rows and can
-- insert a contact message, and nothing else.
alter table app.content_section enable row level security;
alter table app.content_item enable row level security;
alter table app.contact_message enable row level security;

create policy content_section_anon_select
  on app.content_section
  for select
  to anon
  using (publie = true);

create policy content_item_anon_select
  on app.content_item
  for select
  to anon
  using (publie = true);

create policy contact_message_anon_insert
  on app.contact_message
  for insert
  to anon
  with check (true);

-- RLS alone does not confer table privileges — grant the matching operations.
grant usage on schema app to anon;
grant select on app.content_section to anon;
grant select on app.content_item to anon;
grant insert on app.contact_message to anon;

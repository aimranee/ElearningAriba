-- Lot 3's data spine: the single identity anchor every learner surface reads
-- from (CPT-04), the support-access grant mechanism CPT-07 will later write
-- through, and the deletion-request record CPT-09 closes without an admin
-- screen. Lot 3 owns exactly these three tables and nothing else (D-03).
-- Strictly additive: creates objects only, no `alter` and no `drop` against
-- anything Phase 0 or Lot 2 made.
-- Reversible with:
--   drop trigger creer_profil_apres_inscription on auth.users;
--   drop function app.creer_profil_pour_nouvel_utilisateur();
--   drop trigger profil_touch_updated_at on app.profil;
--   drop table app.demande_suppression, app.acces_support, app.profil cascade;

create table app.profil (
  utilisateur_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  prenom text not null default '',
  nom text not null default '',
  telephone text,
  profil_professionnel text not null default 'acheteur'
    check (profil_professionnel in ('acheteur', 'consultant', 'etudiant', 'entreprise')),
  role text not null default 'learner'
    check (role in ('learner', 'administrator')),
  preference_rappels boolean not null default true,
  preference_actualites boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table app.profil is 'The sole identity anchor for a learner (CPT-04). No company/seat/team column exists because a learner is a natural person (D-24) — multi-seat company accounts are excluded from every offer.';
comment on column app.profil.role is 'The administrator value is created and isolated at the database level and is never rendered by any Lot 3 surface (D-02).';

create table app.acces_support (
  id uuid primary key default gen_random_uuid(),
  utilisateur_id uuid not null references auth.users(id) on delete cascade,
  titre text not null,
  chemin_fichier text not null,
  octets bigint,
  created_at timestamptz not null default now(),
  unique (utilisateur_id, chemin_fichier)
);

comment on table app.acces_support is 'CPT-07 mechanism: private-bucket object path granted to a learner. Lot 3 ships the mechanism only — rows are written by SQL until Lot 6 makes enrolment the writer (D-05); no Lot 3 UI creates a row here.';

create table app.demande_suppression (
  id uuid primary key default gen_random_uuid(),
  utilisateur_id uuid not null references auth.users(id) on delete cascade,
  statut text not null default 'enregistree'
    check (statut in ('enregistree', 'traitee')),
  demandee_le timestamptz not null default now(),
  traitee_le timestamptz
);

create unique index demande_suppression_une_en_attente
  on app.demande_suppression (utilisateur_id)
  where statut = 'enregistree';

comment on table app.demande_suppression is 'CPT-09: the deletion request is recorded and acknowledged here; the deletion itself is executed in SQL until ADM-02 in Lot 10 (D-10).';

create trigger profil_touch_updated_at
  before update on app.profil
  for each row
  execute function app.touch_updated_at();

create function app.creer_profil_pour_nouvel_utilisateur()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- why: client-supplied raw_user_meta_data must not be able to mint an
  -- administrator — role is never read from it, only the column default applies.
  insert into app.profil (utilisateur_id, email, prenom, nom, profil_professionnel)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'prenom', ''),
    coalesce(new.raw_user_meta_data ->> 'nom', ''),
    coalesce(new.raw_user_meta_data ->> 'profil_professionnel', 'acheteur')
  );
  return new;
end;
$$;

create trigger creer_profil_apres_inscription
  after insert on auth.users
  for each row
  execute function app.creer_profil_pour_nouvel_utilisateur();

-- Row level security (D-18: isolation must be proven negatively, not declared).
alter table app.profil enable row level security;
alter table app.acces_support enable row level security;
alter table app.demande_suppression enable row level security;

create policy profil_self_select
  on app.profil
  for select
  to authenticated
  using (utilisateur_id = (select auth.uid()));

create policy profil_self_update
  on app.profil
  for update
  to authenticated
  using (utilisateur_id = (select auth.uid()))
  with check (utilisateur_id = (select auth.uid()));

create policy acces_support_self_select
  on app.acces_support
  for select
  to authenticated
  using (utilisateur_id = (select auth.uid()));

create policy demande_suppression_self_select
  on app.demande_suppression
  for select
  to authenticated
  using (utilisateur_id = (select auth.uid()));

create policy demande_suppression_self_insert
  on app.demande_suppression
  for insert
  to authenticated
  with check (utilisateur_id = (select auth.uid()));

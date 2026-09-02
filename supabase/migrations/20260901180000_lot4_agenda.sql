-- Lot 4's temporal model: three availability tables (type, weekly rule,
-- exception), one reservation table whose exclusion constraint makes double-
-- booking impossible (D-03, AGD-05), and the D-27 slot-retention table with
-- its own definer RPCs. Every read and write later Lot 4 plans need --
-- public agenda, booking flow, admin back-office -- goes through the objects
-- this migration creates.
-- Strictly additive: creates objects only, no `alter` and no `drop` against
-- anything Lot 1-3 made.
-- Reversible with:
--   drop function app.reserver_creneau(text, timestamptz, text, uuid);
--   drop function app.liberer_creneau(uuid);
--   drop function app.maintenir_creneau(text, timestamptz, uuid);
--   drop function app.purger_maintiens_expires();
--   drop function app.creneaux_libres(text, date, date, uuid);
--   drop function app.paques(int);
--   drop function app.est_administrateur();
--   drop trigger reservation_touch_updated_at on app.reservation;
--   drop trigger exception_agenda_touch_updated_at on app.exception_agenda;
--   drop trigger disponibilite_hebdomadaire_touch_updated_at on app.disponibilite_hebdomadaire;
--   drop trigger type_rendez_vous_touch_updated_at on app.type_rendez_vous;
--   drop table app.maintien_creneau, app.reservation, app.exception_agenda,
--     app.disponibilite_hebdomadaire, app.type_rendez_vous cascade;

-- ============================================================================
-- Tables
-- ============================================================================

create table app.type_rendez_vous (
  id              text primary key,                       -- 'decouverte' | 'individuelle' (agenda.json ids)
  libelle         text not null,
  duree_minutes   int  not null check (duree_minutes > 0),
  tampon_minutes  int  not null default 15 check (tampon_minutes >= 0),   -- D-20
  prix_centimes   int  not null default 0 check (prix_centimes >= 0),     -- integer money, never float
  actif           boolean not null default true,
  ordre           int  not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table app.type_rendez_vous is 'AGD-03: the single source of truth for label, duration, buffer and price. src/locales/fr/agenda.json is bootstrap seed input only (D-21/D-22) -- no runtime consumer reads its typesRendezVous array.';
comment on column app.type_rendez_vous.tampon_minutes is 'D-20: default buffer, configurable per type.';
comment on column app.type_rendez_vous.prix_centimes is 'Integer money, never float (D-14 display, Lot 7 settlement).';

create table app.disponibilite_hebdomadaire (
  id            uuid primary key default gen_random_uuid(),
  jour_semaine  smallint not null check (jour_semaine between 1 and 7),
  heure_debut   time not null,
  heure_fin     time not null,
  actif         boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (heure_fin > heure_debut)
);

comment on column app.disponibilite_hebdomadaire.jour_semaine is 'ISO-8601 isodow numbering: 1 = lundi ... 7 = dimanche. Never mix with extract(dow), which is 0 = dimanche (Pitfall 5) -- the seed script must use the same numbering.';
comment on column app.disponibilite_hebdomadaire.heure_debut is 'D-04: a continuous declared range, split at read time by the chosen type''s duree_minutes + tampon_minutes. Wall-clock time, never timetz -- timetz pins a fixed offset and is exactly wrong across a DST switch.';

create table app.exception_agenda (
  id           uuid primary key default gen_random_uuid(),
  jour         date not null,
  ouvert       boolean not null default false,   -- D-17: a ferie is seeded ouvert=false, reopened by flipping this
  motif        text not null default 'blocage' check (motif in ('blocage','ferie','ouverture')),
  libelle      text,                              -- "Lundi de Paques"
  heure_debut  time,                              -- both null = whole day
  heure_fin    time,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check ((heure_debut is null) = (heure_fin is null)),
  check (heure_fin is null or heure_fin > heure_debut)
);

create unique index exception_agenda_ferie_unique
  on app.exception_agenda (jour) where motif = 'ferie';   -- at most one ferie row per date

comment on index app.exception_agenda_ferie_unique is 'Partial by design, not a total unique(jour, motif): plan 04-06 explicitly supports blocking a second, partial range on a day that already carries a ferie/blocage row, so a total index would forbid that. Cost: a partial unique index carries a predicate that PostgREST''s on_conflict cannot express, so an upsert against it fails 42P10 -- plan 04-02 therefore seeds holidays by read-then-insert-missing, never by upsert. Do not "fix" this by widening the index.';

create table app.reservation (
  id               uuid primary key default gen_random_uuid(),
  utilisateur_id   uuid references auth.users(id) on delete set null,   -- D-08
  type_id          text not null references app.type_rendez_vous(id),
  debut            timestamptz not null,
  fin              timestamptz not null,                 -- the meeting end -- what the .ics and the CSV "duree" carry
  fin_avec_tampon  timestamptz not null,                 -- D-03: the locked range includes the buffer
  plage            tstzrange generated always as (tstzrange(debut, fin_avec_tampon, '[)')) stored,
  statut           text not null default 'confirmee'
                     check (statut in ('confirmee','en_attente_paiement','annulee')),   -- D-07
  paiement_requis  boolean not null default false,                                       -- D-07
  lieu             text not null,                        -- D-15, snapshotted at booking time
  ics_uid          text not null unique,                 -- stable across Lot 8 updates
  ics_sequence     int  not null default 0,
  annulee_le       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (fin > debut and fin_avec_tampon >= fin),

  -- AGD-05. Partial by design: cancelling frees the slot, which is exactly
  -- the release path Lot 7 needs when a payment fails (AGD-09).
  constraint reservation_pas_de_chevauchement
    exclude using gist (plage with &&) where (statut <> 'annulee')
);

comment on table app.reservation is 'AGD-05 lock via an exclusion constraint (D-03): the database refuses overlap, independent of RLS and of application code correctness.';
comment on column app.reservation.utilisateur_id is 'on delete set null (D-08): erasing an account nulls the identity and leaves the slot taken, rendered "compte supprime" in /admin. Never snapshot a name/email here -- that would resurrect the identity and break the right to erasure.';
comment on column app.reservation.fin is 'The meeting end -- what the .ics DTEND and the CSV "duree" carry. Distinct from fin_avec_tampon (Pitfall 4: buffer double-counting).';
comment on column app.reservation.fin_avec_tampon is 'D-03: the locked range includes the buffer. Its own stored column because timestamptz + interval is STABLE, not IMMUTABLE, and cannot live inside a generated column (42P17, proven).';
comment on column app.reservation.plage is 'Half-open [) bounds deliberately: a 09:00-09:45 and a 09:45-10:30 appointment must not collide. Never use [].';
comment on column app.reservation.statut is 'D-07: the inert Lot 7 seam. Lot 4 always writes confirmee. No fourth value -- the D-27 retention lives in its own table and must never become a reservation state.';
comment on column app.reservation.paiement_requis is 'D-07: defaults false. Lot 7 flips the default and adds the payment screen without rewriting the booking flow.';
comment on column app.reservation.lieu is 'D-15: the trainer''s fixed video link, snapshotted at booking time from an env var.';
comment on constraint reservation_pas_de_chevauchement on app.reservation is 'AGD-05/D-03: the database refuses overlap so the application code does not have to be right. The partial WHERE statut <> annulee clause is also the AGD-09/Lot-7 release mechanism -- cancelling a reservation frees its slot for a new booking.';

-- D-12: no more than one non-cancelled discovery call per account.
create unique index reservation_un_seul_appel_decouverte
  on app.reservation (utilisateur_id)
  where type_id = 'decouverte' and statut <> 'annulee';

comment on index app.reservation_un_seul_appel_decouverte is 'D-12: enforced as a partial unique index rather than a count(*)-then-insert check -- the same check-then-act race the exclusion constraint guards against.';

create table app.maintien_creneau (
  id               uuid primary key default gen_random_uuid(),
  jeton            uuid not null,
  type_id          text not null references app.type_rendez_vous(id),
  debut            timestamptz not null,
  fin_avec_tampon  timestamptz not null,
  plage            tstzrange generated always as (tstzrange(debut, fin_avec_tampon, '[)')) stored,
  expire_le        timestamptz not null,
  created_at       timestamptz not null default now(),

  -- Unqualified, no WHERE clause: an exclusion constraint predicate must be
  -- immutable and now() is only stable, so expiry cannot live in the
  -- constraint. Expiry is enforced two ways instead, and both are required:
  -- every reader filters on expire_le > now(), and
  -- app.purger_maintiens_expires() physically deletes lapsed rows at the top
  -- of every retention/booking transaction.
  constraint maintien_pas_de_chevauchement
    exclude using gist (plage with &&)
);

-- One live retention per visitor token: choosing a second slot replaces the
-- first rather than letting one visitor hoard the grid.
create unique index maintien_creneau_jeton_unique on app.maintien_creneau (jeton);

comment on table app.maintien_creneau is 'D-27: this table is the experience, not the truth. It is advisory, invisible to app.reservation''s exclusion constraint, and nothing may ever be allowed to depend on it for correctness -- a retention can only ever hide a slot from other visitors for at most fifteen minutes. RLS is enabled below with no policy at all; combined with the withheld table grants in the companion grants migration, the three security definer RPCs are its only reachable path. A readable retention table would tell a visitor *why* a slot is missing -- someone is about to take it -- which is exactly the activity signal D-23 exists to withhold. service_role still reaches it, which is what the SQL tests use.';
comment on constraint maintien_pas_de_chevauchement on app.maintien_creneau is 'Unqualified, no WHERE clause -- an exclusion predicate must be immutable and now() is only stable. Expiry is a read-side predicate (expire_le > now()) plus app.purger_maintiens_expires(), never a constraint clause.';
comment on index app.maintien_creneau_jeton_unique is 'One live retention per visitor token (D-27).';

-- ============================================================================
-- updated_at triggers -- app.touch_updated_at() already exists (Lot 1), do
-- not re-create it. app.maintien_creneau has no updated_at column and
-- therefore no trigger.
-- ============================================================================

create trigger type_rendez_vous_touch_updated_at
  before update on app.type_rendez_vous
  for each row execute function app.touch_updated_at();

create trigger disponibilite_hebdomadaire_touch_updated_at
  before update on app.disponibilite_hebdomadaire
  for each row execute function app.touch_updated_at();

create trigger exception_agenda_touch_updated_at
  before update on app.exception_agenda
  for each row execute function app.touch_updated_at();

create trigger reservation_touch_updated_at
  before update on app.reservation
  for each row execute function app.touch_updated_at();

-- ============================================================================
-- Functions -- every one security definer with set search_path = '' and
-- every identifier fully qualified (Pitfall 6).
-- ============================================================================

create function app.est_administrateur()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from app.profil p
    where p.utilisateur_id = (select auth.uid()) and p.role = 'administrator'
  );
$$;

comment on function app.est_administrateur() is 'Helper so every admin RLS policy is one predicate instead of a repeated subquery. Copies the Lot 3 definer-function precedent (creer_profil_pour_nouvel_utilisateur).';

create function app.paques(annee int) returns date
language sql
immutable
security definer
set search_path = ''
as $$
  with c as (select annee/100 as siecle, annee%19 as g),
  h as (select ((siecle - siecle/4 - (8*siecle+13)/25 + 19*g + 15) % 30) as h, siecle, g from c),
  i as (select h - (h/28)*(1 - (29/(h+1))*((21-g)/11)) as i, siecle, g, h from h),
  j as (select i, (annee + annee/4 + i + 2 - siecle + siecle/4) % 7 as j, siecle, g from i),
  l as (select i - j as l from j)
  select make_date(annee, 3 + (l+40)/44, l + 28 - 31*((l+40)/44)) from l;
$$;

comment on function app.paques(int) is 'D-17: anonymous Gregorian computus, verified against known Easter dates 2024-2028 (04-RESEARCH.md). Consumed by plan 04-02''s French-holiday seed so no annual re-seed is ever needed.';

create function app.creneaux_libres(
  p_type_id text,
  p_du      date,
  p_au      date,
  p_jeton   uuid default null
)
returns table (debut timestamptz, fin timestamptz)
language sql
stable
security definer
set search_path = ''          -- mandatory: a definer function without this is CVE-shaped
as $$
  with t as (
    select duree_minutes, tampon_minutes
    from app.type_rendez_vous
    where id = p_type_id and actif
  ),
  jours as (
    select d::date as jour
    from generate_series(
      greatest(p_du, (now() at time zone 'Europe/Paris')::date),
      least(p_au,  ((now() + interval '8 weeks') at time zone 'Europe/Paris')::date),   -- D-13 horizon
      interval '1 day'
    ) d
  ),
  -- a day's open ranges: the weekly rules, unless a whole-day exception
  -- closes it, plus any `ouvert` exception range (a ferie reopened, or an
  -- extra opening)
  plages as (
    select j.jour, r.heure_debut, r.heure_fin
    from jours j
    join app.disponibilite_hebdomadaire r
      on r.actif and r.jour_semaine = extract(isodow from j.jour)
    where not exists (
      select 1 from app.exception_agenda e
      where e.jour = j.jour and not e.ouvert and e.heure_debut is null
    )
    union all
    select e.jour, e.heure_debut, e.heure_fin
    from app.exception_agenda e
    join jours j on j.jour = e.jour
    where e.ouvert and e.heure_debut is not null
  ),
  -- D-04: one continuous declared range is chopped at read time by
  -- duree + tampon
  pas as (
    select
      (p.jour + p.heure_debut) at time zone 'Europe/Paris'
        + (g * (t.duree_minutes + t.tampon_minutes) * interval '1 minute') as debut,
      t.duree_minutes, t.tampon_minutes
    from plages p
    cross join t
    cross join lateral generate_series(
      0,
      (extract(epoch from (p.heure_fin - p.heure_debut))::int / 60
        - t.duree_minutes) / (t.duree_minutes + t.tampon_minutes)
    ) g
  )
  select
    pas.debut,
    pas.debut + (pas.duree_minutes * interval '1 minute') as fin
  from pas
  where pas.debut >= now() + interval '24 hours'                       -- D-13 notice
    -- partial-day blocages
    and not exists (
      select 1 from app.exception_agenda e
      where not e.ouvert and e.heure_debut is not null
        and tstzrange((e.jour + e.heure_debut) at time zone 'Europe/Paris',
                      (e.jour + e.heure_fin)   at time zone 'Europe/Paris', '[)')
            && tstzrange(pas.debut,
                         pas.debut + ((pas.duree_minutes + pas.tampon_minutes) * interval '1 minute'), '[)')
    )
    -- D-23: taken slots are simply absent -- the visitor is never told *why*
    and not exists (
      select 1 from app.reservation res
      where res.statut <> 'annulee'
        and res.plage && tstzrange(pas.debut,
              pas.debut + ((pas.duree_minutes + pas.tampon_minutes) * interval '1 minute'), '[)')
    )
    -- D-27: a live retention hides the slot from everyone except its own
    -- holder -- the defaulted p_jeton is what lets the holder keep seeing
    -- their own retained slot while it stays hidden from every other caller.
    and not exists (
      select 1 from app.maintien_creneau m
      where m.expire_le > now()
        and (p_jeton is null or m.jeton is distinct from p_jeton)
        and m.plage && tstzrange(pas.debut,
              pas.debut + ((pas.duree_minutes + pas.tampon_minutes) * interval '1 minute'), '[)')
    )
  order by 1;
$$;

comment on function app.creneaux_libres(text, date, date, uuid) is 'AGD-02/D-02/D-23: returns only free instants, never a per-day status enum, which would publish the trainer''s activity volume. security definer because it anti-joins app.reservation, which anon must never SELECT directly.';

create function app.purger_maintiens_expires()
returns int
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  delete from app.maintien_creneau where expire_le <= now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

comment on function app.purger_maintiens_expires() is 'D-27 sweep, called inline at the top of app.maintenir_creneau and app.reserver_creneau rather than from a scheduler -- Lot 4 adds no cron, no scheduled job and no hosted dependency.';

create function app.maintenir_creneau(
  p_type_id text,
  p_debut   timestamptz,
  p_jeton   uuid default null
)
returns table (resultat text, jeton uuid, expire_le timestamptz)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_type            app.type_rendez_vous%rowtype;
  v_jeton           uuid;
  v_fin_avec_tampon timestamptz;
  v_expire_le       timestamptz;
begin
  perform app.purger_maintiens_expires();

  select * into v_type from app.type_rendez_vous where id = p_type_id and actif;
  if not found then
    return query select 'type_inconnu'::text, null::uuid, null::timestamptz; return;
  end if;

  -- Resolve the token. This is a security control, not a convenience:
  -- p_jeton arrives from an unauthenticated caller who chooses its value, so
  -- it is not evidence of anything until this function says it is.
  if p_jeton is null then
    -- mint: the only path that may create a token.
    v_jeton := gen_random_uuid();
  else
    -- table-qualified: this function's own OUT column is also named
    -- `jeton` (returns table (resultat, jeton, expire_le)), so an
    -- unqualified `jeton` here is ambiguous between the OUT variable and
    -- app.maintien_creneau.jeton.
    if exists (select 1 from app.maintien_creneau m where m.jeton = p_jeton and m.expire_le > now()) then
      -- replace: reuse the live token, drop its previous retention so one
      -- visitor never holds two slots.
      v_jeton := p_jeton;
      delete from app.maintien_creneau where app.maintien_creneau.jeton = p_jeton;
    else
      -- why: refusing an unrecognised token is what makes minting
      -- identifiable from outside this function. Accepting it verbatim
      -- would let a caller mint unlimited retentions under self-chosen
      -- tokens -- every request would carry a never-before-seen uuid, so
      -- neither the unique index nor the overlap constraint would constrain
      -- anything, and a few hundred cheap requests would blank the
      -- published grid to "Indisponible" for fifteen minutes, refreshable
      -- indefinitely (T-04-07c).
      return query select 'jeton_inconnu'::text, null::uuid, null::timestamptz; return;
    end if;
  end if;

  -- why: both bounds must go through `at time zone 'Europe/Paris'`. A bare
  -- p_debut::date resolves in the session TimeZone, which is UTC on
  -- Supabase, so any instant before 01:00/02:00 Paris lands on the previous
  -- UTC date and this re-derivation looks in the wrong day -- the same
  -- class of defect as dow vs isodow (Pitfall 5).
  if not exists (
    select 1 from app.creneaux_libres(
      p_type_id,
      (p_debut at time zone 'Europe/Paris')::date,
      (p_debut at time zone 'Europe/Paris')::date,
      v_jeton
    ) c where c.debut = p_debut
  ) then
    return query select 'creneau_indisponible'::text, null::uuid, null::timestamptz; return;
  end if;

  v_fin_avec_tampon := p_debut + ((v_type.duree_minutes + v_type.tampon_minutes) * interval '1 minute');
  v_expire_le := now() + interval '15 minutes';   -- server literal -- never read from a parameter

  begin
    insert into app.maintien_creneau (jeton, type_id, debut, fin_avec_tampon, expire_le)
    values (v_jeton, p_type_id, p_debut, v_fin_avec_tampon, v_expire_le);
  exception
    when exclusion_violation then
      return query select 'creneau_indisponible'::text, null::uuid, null::timestamptz; return;
  end;

  return query select 'ok'::text, v_jeton, v_expire_le;
end;
$$;

comment on function app.maintenir_creneau(text, timestamptz, uuid) is 'D-27: writes nothing to app.reservation and reads no session identity -- a visitor has no account at this point (D-28). The 15-minute window is a SQL literal, never a parameter.';

create function app.liberer_creneau(p_jeton uuid)
returns table (resultat text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  -- Idempotent by design: the browser calls this on abandon and on
  -- beforeunload, where a retry is normal and an error would be noise.
  delete from app.maintien_creneau where jeton = p_jeton;
  return query select 'ok'::text;
end;
$$;

create function app.reserver_creneau(
  p_type_id text,
  p_debut   timestamptz,
  p_lieu    text,
  p_jeton   uuid default null
)
returns table (resultat text, reservation_id uuid)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := (select auth.uid());
  v_type  app.type_rendez_vous%rowtype;
  v_id    uuid;
begin
  perform app.purger_maintiens_expires();

  if v_uid is null then
    return query select 'non_authentifie'::text, null::uuid; return;
  end if;

  select * into v_type from app.type_rendez_vous where id = p_type_id and actif;
  if not found then
    return query select 'type_inconnu'::text, null::uuid; return;
  end if;

  -- Never trust the client's instant: re-derive it from the same expansion
  -- the public list came from, inside this transaction. p_jeton passes
  -- through so the caller's own retention does not hide the slot from them.
  if not exists (
    select 1 from app.creneaux_libres(
      p_type_id,
      (p_debut at time zone 'Europe/Paris')::date,
      (p_debut at time zone 'Europe/Paris')::date,
      p_jeton
    ) c where c.debut = p_debut
  ) then
    return query select 'creneau_indisponible'::text, null::uuid; return;
  end if;

  begin
    insert into app.reservation (
      utilisateur_id, type_id, debut, fin, fin_avec_tampon, lieu, ics_uid
    ) values (
      v_uid, p_type_id, p_debut,
      p_debut + (v_type.duree_minutes * interval '1 minute'),
      p_debut + ((v_type.duree_minutes + v_type.tampon_minutes) * interval '1 minute'),
      p_lieu,
      gen_random_uuid()::text || '@formation-sap-ariba.fr'
    )
    returning id into v_id;
  exception
    when exclusion_violation then                 -- 23P01, AGD-05
      return query select 'creneau_indisponible'::text, null::uuid; return;
    when unique_violation then                    -- 23505, D-12
      return query select 'appel_decouverte_deja_reserve'::text, null::uuid; return;
  end;

  -- release-on-commit (D-27): the retention row for the committing token is
  -- deleted in the same transaction as the insert.
  if p_jeton is not null then
    delete from app.maintien_creneau where jeton = p_jeton;
  end if;

  return query select 'ok'::text, v_id;
end;
$$;

comment on function app.reserver_creneau(text, timestamptz, text, uuid) is 'AGD-04/AGD-05/D-12/D-13: reads the caller from auth.uid(), never from a parameter. The retention (p_jeton) is an input to nothing but the re-derivation''s anti-join -- it grants no right to book and the exclusion constraint is still what decides (D-03, D-27).';

-- ============================================================================
-- Row level security
-- ============================================================================

alter table app.type_rendez_vous enable row level security;
alter table app.disponibilite_hebdomadaire enable row level security;
alter table app.exception_agenda enable row level security;
alter table app.reservation enable row level security;

-- RLS enabled, deliberately with NO policy at all, for any role -- see the
-- table comment above. Only the three security definer RPCs and service_role
-- reach this table.
alter table app.maintien_creneau enable row level security;

create policy reservation_self_select on app.reservation
  for select to authenticated using (utilisateur_id = (select auth.uid()));

create policy reservation_admin_all on app.reservation
  for all to authenticated using (app.est_administrateur()) with check (app.est_administrateur());

-- public reference data only. app.reservation gets NO anon policy at all.
create policy type_public_select on app.type_rendez_vous
  for select to anon, authenticated using (actif);

-- AGD-03: for update only, deliberately no insert and no delete policy.
create policy type_admin_update on app.type_rendez_vous
  for update to authenticated using (app.est_administrateur()) with check (app.est_administrateur());

comment on policy type_admin_update on app.type_rendez_vous is 'AGD-03 reads "configure appointment types ... with configurable label, duration, buffer time and price" -- it does not ask for creating or destroying types, and both seeded ids are referenced by app.reservation.type_id, so no insert and no delete policy exists on this table. This policy plus the table it guards is what makes app.type_rendez_vous the single source of truth for label, duration, tampon_minutes and prix_centimes.';

create policy dispo_admin_all on app.disponibilite_hebdomadaire
  for all to authenticated using (app.est_administrateur()) with check (app.est_administrateur());

create policy exception_admin_all on app.exception_agenda
  for all to authenticated using (app.est_administrateur()) with check (app.est_administrateur());

-- AGD-02, D-13, D-23, D-04: the read-time free-slot expansion, proven at its
-- boundaries by SQL assertion. Local-only: lives under supabase/tests/,
-- never under supabase/migrations/, and is never pushed.
--
-- Run with: docker exec -i supabase_db_ElearningAriba psql -U postgres
-- -d postgres -v ON_ERROR_STOP=1 -f - < supabase/tests/lot4_creneaux_libres.sql
-- Single transaction, rolled back at the end so it leaves no data and can be
-- re-run at will.

begin;

-- 0. Isolation from the D-21/D-22 seed: agenda:seed permanently writes
-- app.disponibilite_hebdomadaire (Mon-Fri, split morning/afternoon) and
-- app.exception_agenda (22 ferie rows) outside any transaction. This file's
-- exact-count assertions (a single continuous 09:00-17:00 range, a 75-minute
-- step across the whole day) need a clean slate, not the seeded split shape
-- or a control day that might land on a seeded ferie date. Clearing both
-- tables here is scoped to this transaction and undone by the closing
-- rollback -- the seeded rows are back the instant this file finishes.
delete from app.disponibilite_hebdomadaire;
delete from app.exception_agenda;

-- 1. Control: a type (duree_minutes = 60, tampon_minutes = 15) and a
-- Monday-to-Friday weekly rule (09:00-17:00, D-22 shape) wide enough to yield
-- several slots per day. Assert a non-zero count over a window starting two
-- days out -- a green run must not be able to come from an empty result.
-- on conflict/do update, not a plain insert: plan 04-02's own agenda:seed
-- permanently seeds this id outside any transaction, so a plain insert
-- collides (23505) once the environment has been bootstrapped.
insert into app.type_rendez_vous (id, libelle, duree_minutes, tampon_minutes, prix_centimes)
values ('individuelle', 'Session individuelle', 60, 15, 9000)
on conflict (id) do update set
  libelle = excluded.libelle,
  duree_minutes = excluded.duree_minutes,
  tampon_minutes = excluded.tampon_minutes,
  prix_centimes = excluded.prix_centimes;

insert into app.disponibilite_hebdomadaire (jour_semaine, heure_debut, heure_fin)
select d, '09:00', '17:00' from generate_series(1, 5) d;

-- The dates used below are derived from the calendar, never hardcoded, so
-- the file's pass/fail does not depend on what day it happens to run.
do $$
declare
  v_lundi_control date;
begin
  select min(d) into v_lundi_control
  from generate_series(current_date + 2, current_date + 20, interval '1 day') d
  where extract(isodow from d) between 1 and 5;

  if v_lundi_control is null then
    raise exception 'setup failed: no weekday found in the search window';
  end if;

  create temporary table jours_test (nom text primary key, jour date);
  insert into jours_test values
    ('control', v_lundi_control);
end $$;

do $$
declare
  v_control_day date := (select jour from jours_test where nom = 'control');
  v_count int;
begin
  select count(*) into v_count
  from app.creneaux_libres('individuelle', v_control_day, v_control_day);

  if v_count = 0 then
    raise exception 'control failed: no free instants on the control day';
  end if;
  raise notice 'CRENEAUX: step 1 control OK, % free instant(s) on the control day', v_count;
end $$;

-- 2. D-04 step: consecutive debut values are exactly duree_minutes +
-- tampon_minutes apart, and each row's fin - debut equals duree_minutes --
-- the buffer is in the step and in the locked range, never in the meeting
-- length (Pitfall 4).
do $$
declare
  v_control_day date := (select jour from jours_test where nom = 'control');
  r record;
  v_precedent timestamptz;
  v_first boolean := true;
begin
  for r in
    select debut, fin from app.creneaux_libres('individuelle', v_control_day, v_control_day) order by debut
  loop
    if r.fin - r.debut != interval '60 minutes' then
      raise exception 'CRENEAUX: step 2 -- fin - debut was % instead of 60 minutes for debut=%', r.fin - r.debut, r.debut;
    end if;
    if not v_first and (r.debut - v_precedent) != interval '75 minutes' then
      raise exception 'CRENEAUX: step 2 -- step between consecutive instants was % instead of 75 minutes', r.debut - v_precedent;
    end if;
    v_precedent := r.debut;
    v_first := false;
  end loop;

  raise notice 'CRENEAUX: step 2 D-04 OK, 75-minute step (60min type + 15min buffer), 60-minute meeting length confirmed';
end $$;

-- 3. D-13 notice: no returned instant is earlier than now() + 24 hours, even
-- when p_du is today.
do $$
declare
  v_min timestamptz;
begin
  select min(debut) into v_min
  from app.creneaux_libres('individuelle', current_date, current_date + 20);

  if v_min is null then
    raise exception 'CRENEAUX: step 3 setup failed -- no instants returned at all';
  end if;
  if v_min < now() + interval '24 hours' then
    raise exception 'CRENEAUX: step 3 -- earliest returned instant % is inside the 24-hour notice', v_min;
  end if;
  raise notice 'CRENEAUX: step 3 D-13 24-hour notice OK, earliest instant % is at or after now()+24h', v_min;
end $$;

-- 4. D-13 horizon: no returned instant is later than now() + 8 weeks, even
-- when p_au is a year out.
do $$
declare
  v_max timestamptz;
begin
  select max(debut) into v_max
  from app.creneaux_libres('individuelle', current_date, current_date + 365);

  if v_max is null then
    raise exception 'CRENEAUX: step 4 setup failed -- no instants returned at all';
  end if;
  if v_max > now() + interval '8 weeks' then
    raise exception 'CRENEAUX: step 4 -- latest returned instant % is beyond the 8-week horizon', v_max;
  end if;
  raise notice 'CRENEAUX: step 4 D-13 8-week horizon OK, latest instant % is at or before now()+8w', v_max;
end $$;

-- 5. D-23 taken: a confirmed reservation over one of the control day's
-- returned instants makes it disappear, and only it.
do $$
declare
  v_control_day date := (select jour from jours_test where nom = 'control');
  v_cible timestamptz;
  v_count_avant int;
  v_count_apres int;
begin
  select debut into v_cible
  from app.creneaux_libres('individuelle', v_control_day, v_control_day)
  order by debut limit 1;

  select count(*) into v_count_avant
  from app.creneaux_libres('individuelle', v_control_day, v_control_day);

  insert into app.reservation (type_id, debut, fin, fin_avec_tampon, lieu, ics_uid)
  values (
    'individuelle', v_cible, v_cible + interval '60 minutes', v_cible + interval '75 minutes',
    'https://meet.example.test/salle', 'creneaux-taken@formation-sap-ariba.fr'
  );

  select count(*) into v_count_apres
  from app.creneaux_libres('individuelle', v_control_day, v_control_day);

  if v_count_apres != v_count_avant - 1 then
    raise exception 'CRENEAUX: step 5 -- count went from % to % instead of decreasing by exactly 1', v_count_avant, v_count_apres;
  end if;
  if exists (select 1 from app.creneaux_libres('individuelle', v_control_day, v_control_day) c where c.debut = v_cible) then
    raise exception 'CRENEAUX: step 5 -- the taken instant is still offered';
  end if;

  create temporary table cible_taken (jour date, debut timestamptz);
  insert into cible_taken values (v_control_day, v_cible);

  raise notice 'CRENEAUX: step 5 D-23 taken OK, taken instant absent, % other instant(s) unaffected', v_count_apres;
end $$;

-- 6. D-23 blocked, whole day: a weekday distinct from the control day, with
-- an ouvert = false / null-hours exception, yields zero instants.
do $$
declare
  v_jour_ferme date;
  v_count int;
begin
  select min(d) into v_jour_ferme
  from generate_series(current_date + 21, current_date + 40, interval '1 day') d
  where extract(isodow from d) between 1 and 5;

  if v_jour_ferme is null then
    raise exception 'CRENEAUX: step 6 setup failed -- no weekday found in the search window';
  end if;

  select count(*) into v_count from app.creneaux_libres('individuelle', v_jour_ferme, v_jour_ferme);
  if v_count = 0 then
    raise exception 'CRENEAUX: step 6 setup failed -- carrier day already had zero instants before the block';
  end if;

  insert into app.exception_agenda (jour, ouvert, motif, heure_debut, heure_fin)
  values (v_jour_ferme, false, 'blocage', null, null);

  select count(*) into v_count from app.creneaux_libres('individuelle', v_jour_ferme, v_jour_ferme);
  if v_count != 0 then
    raise exception 'CRENEAUX: step 6 -- whole-day block left % instant(s) offered', v_count;
  end if;

  raise notice 'CRENEAUX: step 6 D-23 whole-day closure OK, carrier day now yields zero instants';
end $$;

-- 7. D-23 blocked, partial day: a distinct weekday with an ouvert = false
-- exception covering only part of it removes only the overlapping instants.
do $$
declare
  v_jour_partiel date;
  v_count_avant int;
  v_count_apres int;
begin
  select min(d) into v_jour_partiel
  from generate_series(current_date + 41, current_date + 60, interval '1 day') d
  where extract(isodow from d) between 1 and 5;

  if v_jour_partiel is null then
    raise exception 'CRENEAUX: step 7 setup failed -- no weekday found in the search window';
  end if;

  select count(*) into v_count_avant from app.creneaux_libres('individuelle', v_jour_partiel, v_jour_partiel);
  if v_count_avant = 0 then
    raise exception 'CRENEAUX: step 7 setup failed -- carrier day already had zero instants before the block';
  end if;

  insert into app.exception_agenda (jour, ouvert, motif, heure_debut, heure_fin)
  values (v_jour_partiel, false, 'blocage', '09:00', '12:00');

  select count(*) into v_count_apres from app.creneaux_libres('individuelle', v_jour_partiel, v_jour_partiel);
  if v_count_apres = 0 or v_count_apres >= v_count_avant then
    raise exception 'CRENEAUX: step 7 -- partial block removed % of % instants, expected some but not all removed', v_count_avant - v_count_apres, v_count_avant;
  end if;

  -- the afternoon instant (14:00 Europe/Paris) must survive; a morning one must not.
  if not exists (
    select 1 from app.creneaux_libres('individuelle', v_jour_partiel, v_jour_partiel) c
    where (c.debut at time zone 'Europe/Paris')::time = '14:00'
  ) then
    raise exception 'CRENEAUX: step 7 -- the 14:00 instant outside the blocked range was also removed';
  end if;
  if exists (
    select 1 from app.creneaux_libres('individuelle', v_jour_partiel, v_jour_partiel) c
    where (c.debut at time zone 'Europe/Paris')::time = '09:00'
  ) then
    raise exception 'CRENEAUX: step 7 -- the 09:00 instant inside the blocked range is still offered';
  end if;

  raise notice 'CRENEAUX: step 7 D-23 partial closure OK, % of % instant(s) removed, afternoon instant survives', v_count_avant - v_count_apres, v_count_avant;
end $$;

-- 8. Re-opening: an ouvert = true exception with hours on a Saturday (no
-- weekly rule) makes instants appear on that day.
do $$
declare
  v_samedi date;
  v_count int;
begin
  select min(d) into v_samedi
  from generate_series(current_date + 2, current_date + 60, interval '1 day') d
  where extract(isodow from d) = 6;

  if v_samedi is null then
    raise exception 'CRENEAUX: step 8 setup failed -- no Saturday found in the search window';
  end if;

  select count(*) into v_count from app.creneaux_libres('individuelle', v_samedi, v_samedi);
  if v_count != 0 then
    raise exception 'CRENEAUX: step 8 setup failed -- the Saturday already had % instant(s) with no weekly rule and no exception', v_count;
  end if;

  insert into app.exception_agenda (jour, ouvert, motif, heure_debut, heure_fin)
  values (v_samedi, true, 'ouverture', '10:00', '12:00');

  select count(*) into v_count from app.creneaux_libres('individuelle', v_samedi, v_samedi);
  if v_count = 0 then
    raise exception 'CRENEAUX: step 8 -- re-opened Saturday still yields zero instants';
  end if;

  raise notice 'CRENEAUX: step 8 D-23/D-17 re-opening OK, % instant(s) now offered on a day with no weekly rule', v_count;
end $$;

-- 9. Cancelled reservations free the slot (AGD-09's release path, read side):
-- setting step 5's reservation to statut = 'annulee' makes the instant
-- reappear.
do $$
declare
  v_control_day date := (select jour from cible_taken);
  v_cible timestamptz := (select debut from cible_taken);
begin
  update app.reservation set statut = 'annulee' where ics_uid = 'creneaux-taken@formation-sap-ariba.fr';

  if not exists (
    select 1 from app.creneaux_libres('individuelle', v_control_day, v_control_day) c where c.debut = v_cible
  ) then
    raise exception 'CRENEAUX: step 9 -- cancelling the reservation did not restore the instant';
  end if;

  raise notice 'CRENEAUX: step 9 AGD-09 cancel-frees-slot OK, instant reappeared';
end $$;

-- 10. Retention (D-27), one assertion only -- the full proof is
-- lot4_maintien_creneau.sql (plan 04-01); this confirms the seeded week and
-- the retention agree: a retention hides exactly one slot from a tokenless
-- read and leaves every other instant of that day unchanged.
do $$
declare
  v_control_day date := (select jour from jours_test where nom = 'control');
  v_cible timestamptz;
  v_count_avant int;
  v_count_apres int;
  v_resultat text;
  v_jeton uuid;
begin
  select count(*) into v_count_avant from app.creneaux_libres('individuelle', v_control_day, v_control_day);

  select debut into v_cible
  from app.creneaux_libres('individuelle', v_control_day, v_control_day)
  order by debut desc limit 1;

  select resultat, jeton into v_resultat, v_jeton from app.maintenir_creneau('individuelle', v_cible);
  if v_resultat != 'ok' then
    raise exception 'CRENEAUX: step 10 setup mint returned %', v_resultat;
  end if;

  select count(*) into v_count_apres
  from app.creneaux_libres('individuelle', v_control_day, v_control_day);

  if v_count_apres != v_count_avant - 1 then
    raise exception 'CRENEAUX: step 10 -- retention hid % instant(s) instead of exactly 1 (% -> %)', v_count_avant - v_count_apres, v_count_avant, v_count_apres;
  end if;
  if exists (
    select 1 from app.creneaux_libres('individuelle', v_control_day, v_control_day, null::uuid) c where c.debut = v_cible
  ) then
    raise exception 'CRENEAUX: step 10 -- the retained instant is still offered to a tokenless read';
  end if;

  perform app.liberer_creneau(v_jeton);

  raise notice 'CRENEAUX: step 10 D-27 OK, retention hid exactly 1 instant, % other instant(s) unchanged', v_count_apres;
end $$;

rollback;

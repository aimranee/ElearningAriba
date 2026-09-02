-- AGD-05, AGD-09, AGD-01, D-12: the exclusion constraint, its half-open
-- bound, the Lot 7 release path (cancelling frees a slot) and the DST
-- correctness of the wall-clock -> instant conversion. Local-only: lives
-- under supabase/tests/, never under supabase/migrations/, and is never
-- pushed.
--
-- Run with: psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/lot4_verrou_creneau.sql
-- (psql is not on PATH on this machine: docker exec -i supabase_db_ElearningAriba
-- psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f - < <this file>)
-- Single transaction, rolled back at the end so it leaves no data and can be
-- re-run at will.

begin;

-- 1. Control: seed a type, two auth.users rows (learner A and B, reusing the
-- Lot 3 column list), one weekly rule, and one confirmed reservation as
-- superuser. Assert it exists.
-- on conflict/do update, not a plain insert: plan 04-02's agenda:seed now
-- permanently seeds these two ids outside any transaction, so a plain insert
-- collides (23505) once the environment has been bootstrapped. The upsert
-- forces this file's own duree_minutes/tampon_minutes/prix_centimes for the
-- duration of this transaction; rollback restores the seeded row afterward.
insert into app.type_rendez_vous (id, libelle, duree_minutes, tampon_minutes, prix_centimes)
values
  ('decouverte', 'Appel decouverte', 30, 15, 0),
  ('individuelle', 'Session individuelle', 30, 15, 9000)
on conflict (id) do update set
  libelle = excluded.libelle,
  duree_minutes = excluded.duree_minutes,
  tampon_minutes = excluded.tampon_minutes,
  prix_centimes = excluded.prix_centimes;
-- why individuelle for the lock/RLS/DST/erasure steps below: 'decouverte' is
-- reserved for step 6's D-12 proof alone, so the two concerns (the
-- exclusion constraint vs. the one-discovery-call rule) do not interfere.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  is_sso_user, is_anonymous, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000001a',
   'authenticated', 'authenticated', 'verrou-a@example.test', 'x',
   now(), '{}'::jsonb, '{}'::jsonb, false, false, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000001b',
   'authenticated', 'authenticated', 'verrou-b@example.test', 'x',
   now(), '{}'::jsonb, '{}'::jsonb, false, false, now(), now());

-- every isodow so every offset below is a carrier day, regardless of what
-- day of the week this test happens to run on
insert into app.disponibilite_hebdomadaire (jour_semaine, heure_debut, heure_fin)
select d, '09:00', '17:00' from generate_series(1, 7) d;

-- A reservation nine days from now (well past D-13's 24h notice), 09:00-09:30
-- with a 09:30-09:45 buffer -> plage 09:00-09:45.
insert into app.reservation (utilisateur_id, type_id, debut, fin, fin_avec_tampon, lieu, ics_uid)
values (
  '00000000-0000-0000-0000-00000000001a', 'individuelle',
  ((current_date + 9) + time '09:00') at time zone 'Europe/Paris',
  ((current_date + 9) + time '09:30') at time zone 'Europe/Paris',
  ((current_date + 9) + time '09:45') at time zone 'Europe/Paris',
  'https://meet.example.test/salle', 'ctrl-1@formation-sap-ariba.fr'
);

do $$
begin
  if (select count(*) from app.reservation) != 1 then
    raise exception 'control failed: control reservation row missing';
  end if;
  raise notice 'VERROU: step 1 control OK';
end $$;

-- 2. Negative: an overlapping insert raises exclusion_violation.
do $$
declare
  refused boolean := false;
  caught_sqlstate text;
begin
  begin
    insert into app.reservation (utilisateur_id, type_id, debut, fin, fin_avec_tampon, lieu, ics_uid)
    values (
      '00000000-0000-0000-0000-00000000001b', 'individuelle',
      ((current_date + 9) + time '09:15') at time zone 'Europe/Paris',
      ((current_date + 9) + time '09:45') at time zone 'Europe/Paris',
      ((current_date + 9) + time '10:00') at time zone 'Europe/Paris',
      'https://meet.example.test/salle', 'ctrl-2@formation-sap-ariba.fr'
    );
  exception
    when exclusion_violation then
      refused := true;
      get stacked diagnostics caught_sqlstate = returned_sqlstate;
  end;

  if not refused then
    raise exception 'VERROU: overlapping insert was ACCEPTED';
  end if;
  raise notice 'VERROU: step 2 overlap refused SQLSTATE=%', caught_sqlstate;
end $$;

-- 3. Positive control: an adjacent insert (starting exactly at the previous
-- row's fin_avec_tampon) is ACCEPTED -- half-open '[)' bounds.
do $$
begin
  insert into app.reservation (utilisateur_id, type_id, debut, fin, fin_avec_tampon, lieu, ics_uid)
  values (
    '00000000-0000-0000-0000-00000000001b', 'individuelle',
    ((current_date + 9) + time '09:45') at time zone 'Europe/Paris',
    ((current_date + 9) + time '10:15') at time zone 'Europe/Paris',
    ((current_date + 9) + time '10:30') at time zone 'Europe/Paris',
    'https://meet.example.test/salle', 'ctrl-3@formation-sap-ariba.fr'
  );
  if (select count(*) from app.reservation where ics_uid = 'ctrl-3@formation-sap-ariba.fr') != 1 then
    raise exception 'VERROU: adjacent insert was REFUSED (bounds are not half-open)';
  end if;
  raise notice 'VERROU: step 3 adjacent insert ACCEPTED';
end $$;

-- 4. AGD-09: an insert overlapping a cancelled row is ACCEPTED; a
-- en_attente_paiement row still blocks an overlap.
do $$
begin
  insert into app.reservation (utilisateur_id, type_id, debut, fin, fin_avec_tampon, lieu, ics_uid, statut)
  values (
    '00000000-0000-0000-0000-00000000001a', 'individuelle',
    ((current_date + 10) + time '09:00') at time zone 'Europe/Paris',
    ((current_date + 10) + time '09:30') at time zone 'Europe/Paris',
    ((current_date + 10) + time '09:45') at time zone 'Europe/Paris',
    'https://meet.example.test/salle', 'ctrl-4-cancelled@formation-sap-ariba.fr', 'annulee'
  );

  insert into app.reservation (utilisateur_id, type_id, debut, fin, fin_avec_tampon, lieu, ics_uid)
  values (
    '00000000-0000-0000-0000-00000000001b', 'individuelle',
    ((current_date + 10) + time '09:00') at time zone 'Europe/Paris',
    ((current_date + 10) + time '09:30') at time zone 'Europe/Paris',
    ((current_date + 10) + time '09:45') at time zone 'Europe/Paris',
    'https://meet.example.test/salle', 'ctrl-4-fresh@formation-sap-ariba.fr'
  );

  if (select paiement_requis from app.reservation where ics_uid = 'ctrl-4-fresh@formation-sap-ariba.fr') != false then
    raise exception 'VERROU: paiement_requis did not default to false';
  end if;
end $$;

do $$
declare
  refused boolean := false;
begin
  insert into app.reservation (utilisateur_id, type_id, debut, fin, fin_avec_tampon, lieu, ics_uid, statut)
  values (
    '00000000-0000-0000-0000-00000000001a', 'individuelle',
    ((current_date + 11) + time '09:00') at time zone 'Europe/Paris',
    ((current_date + 11) + time '09:30') at time zone 'Europe/Paris',
    ((current_date + 11) + time '09:45') at time zone 'Europe/Paris',
    'https://meet.example.test/salle', 'ctrl-4-en-attente@formation-sap-ariba.fr', 'en_attente_paiement'
  );

  begin
    insert into app.reservation (utilisateur_id, type_id, debut, fin, fin_avec_tampon, lieu, ics_uid)
    values (
      '00000000-0000-0000-0000-00000000001b', 'individuelle',
      ((current_date + 11) + time '09:15') at time zone 'Europe/Paris',
      ((current_date + 11) + time '09:45') at time zone 'Europe/Paris',
      ((current_date + 11) + time '10:00') at time zone 'Europe/Paris',
      'https://meet.example.test/salle', 'ctrl-4-overlap@formation-sap-ariba.fr'
    );
  exception
    when exclusion_violation then
      refused := true;
  end;

  if not refused then
    raise exception 'VERROU: en_attente_paiement row did not block an overlap';
  end if;
  raise notice 'VERROU: step 4 AGD-09 cancelled-frees-slot / paiement_requis default / en_attente_paiement-still-blocks all OK';
end $$;

-- 5. AGD-05 under RLS: as learner B, attempt an insert overlapping the
-- control reservation (owned by A), which RLS hides from B. The refusal
-- must still be exclusion_violation (evaluated independently of RLS) or
-- insufficient_privilege (insert withheld) -- assert whichever fires, and
-- that no row was written. Then call app.reserver_creneau as B on the same
-- taken instant and assert 'creneau_indisponible'.
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000001b","role":"authenticated"}';

do $$
declare
  refused boolean := false;
  caught_sqlstate text;
  rows_before int;
  rows_after int;
begin
  select count(*) into rows_before from app.reservation;

  begin
    insert into app.reservation (utilisateur_id, type_id, debut, fin, fin_avec_tampon, lieu, ics_uid)
    values (
      '00000000-0000-0000-0000-00000000001b', 'individuelle',
      ((current_date + 9) + time '09:00') at time zone 'Europe/Paris',
      ((current_date + 9) + time '09:30') at time zone 'Europe/Paris',
      ((current_date + 9) + time '09:45') at time zone 'Europe/Paris',
      'https://meet.example.test/salle', 'rls-forged@formation-sap-ariba.fr'
    );
  exception
    when exclusion_violation then
      refused := true;
      get stacked diagnostics caught_sqlstate = returned_sqlstate;
    when insufficient_privilege then
      refused := true;
      get stacked diagnostics caught_sqlstate = returned_sqlstate;
  end;

  select count(*) into rows_after from app.reservation;

  if not refused or rows_after != rows_before then
    raise exception 'VERROU: learner B inserted over an RLS-invisible reservation owned by learner A';
  end if;
  raise notice 'VERROU: step 5a insert over RLS-invisible row refused SQLSTATE=%', caught_sqlstate;
end $$;

do $$
declare
  v_resultat text;
begin
  select resultat into v_resultat
  from app.reserver_creneau('individuelle', ((current_date + 9) + time '09:00') at time zone 'Europe/Paris', 'https://meet.example.test/salle');

  if v_resultat != 'creneau_indisponible' then
    raise exception 'VERROU: reserver_creneau on a taken instant returned % instead of creneau_indisponible', v_resultat;
  end if;
  raise notice 'VERROU: step 5b reserver_creneau on taken instant returned creneau_indisponible';
end $$;

-- 6. D-12: as learner B, call reserver_creneau twice for 'decouverte' on two
-- different free instants; assert the second returns
-- 'appel_decouverte_deja_reserve'.
do $$
declare
  v_resultat1 text;
  v_resultat2 text;
begin
  select resultat into v_resultat1
  from app.reserver_creneau('decouverte', ((current_date + 12) + time '09:00') at time zone 'Europe/Paris', 'https://meet.example.test/salle');

  if v_resultat1 != 'ok' then
    raise exception 'VERROU: first discovery-call booking for learner B failed with %', v_resultat1;
  end if;

  select resultat into v_resultat2
  from app.reserver_creneau('decouverte', ((current_date + 13) + time '09:00') at time zone 'Europe/Paris', 'https://meet.example.test/salle');

  if v_resultat2 != 'appel_decouverte_deja_reserve' then
    raise exception 'VERROU: second discovery-call booking returned % instead of appel_decouverte_deja_reserve', v_resultat2;
  end if;
  raise notice 'VERROU: step 6 D-12 second discovery call refused: appel_decouverte_deja_reserve';
end $$;

reset role;

-- 7. AGD-01 / D-05 DST: a 09:00 Europe/Paris wall-clock rule resolves to a
-- different UTC instant either side of both 2026 switches, with a constant
-- 8-hour wall-clock span.
do $$
declare
  spring_before timestamptz := (date '2026-03-28' + time '09:00') at time zone 'Europe/Paris';
  spring_after  timestamptz := (date '2026-03-29' + time '09:00') at time zone 'Europe/Paris';
  autumn_before timestamptz := (date '2026-10-24' + time '09:00') at time zone 'Europe/Paris';
  autumn_after  timestamptz := (date '2026-10-25' + time '09:00') at time zone 'Europe/Paris';
begin
  if spring_before != '2026-03-28 08:00:00+00'::timestamptz then
    raise exception 'VERROU: 2026-03-28 09:00 Paris did not resolve to 08:00 UTC (got %)', spring_before;
  end if;
  if spring_after != '2026-03-29 07:00:00+00'::timestamptz then
    raise exception 'VERROU: 2026-03-29 09:00 Paris did not resolve to 07:00 UTC (got %)', spring_after;
  end if;
  if autumn_before != '2026-10-24 07:00:00+00'::timestamptz then
    raise exception 'VERROU: 2026-10-24 09:00 Paris did not resolve to 07:00 UTC (got %)', autumn_before;
  end if;
  if autumn_after != '2026-10-25 08:00:00+00'::timestamptz then
    raise exception 'VERROU: 2026-10-25 09:00 Paris did not resolve to 08:00 UTC (got %)', autumn_after;
  end if;

  if (((date '2026-03-28' + time '17:00') at time zone 'Europe/Paris') - spring_before) != interval '8 hours'
    or (((date '2026-03-29' + time '17:00') at time zone 'Europe/Paris') - spring_after) != interval '8 hours'
    or (((date '2026-10-24' + time '17:00') at time zone 'Europe/Paris') - autumn_before) != interval '8 hours'
    or (((date '2026-10-25' + time '17:00') at time zone 'Europe/Paris') - autumn_after) != interval '8 hours'
  then
    raise exception 'VERROU: wall-clock span between 09:00 and 17:00 was not a constant 8 hours across a DST switch';
  end if;

  raise notice 'VERROU: step 7 AGD-01/D-05 DST correctness OK, constant 8h wall-clock span';
end $$;

-- 8. D-08: delete learner A's auth.users row and assert their reservation
-- still exists with utilisateur_id null and its plage still blocking an
-- overlap.
do $$
declare
  refused boolean := false;
begin
  delete from auth.users where id = '00000000-0000-0000-0000-00000000001a';

  if (select utilisateur_id from app.reservation where ics_uid = 'ctrl-1@formation-sap-ariba.fr') is not null then
    raise exception 'VERROU: reservation.utilisateur_id was not nulled on account erasure';
  end if;

  begin
    insert into app.reservation (utilisateur_id, type_id, debut, fin, fin_avec_tampon, lieu, ics_uid)
    values (
      '00000000-0000-0000-0000-00000000001b', 'individuelle',
      ((current_date + 9) + time '09:15') at time zone 'Europe/Paris',
      ((current_date + 9) + time '09:45') at time zone 'Europe/Paris',
      ((current_date + 9) + time '10:00') at time zone 'Europe/Paris',
      'https://meet.example.test/salle', 'ctrl-8-overlap@formation-sap-ariba.fr'
    );
  exception
    when exclusion_violation then
      refused := true;
  end;

  if not refused then
    raise exception 'VERROU: erased-account reservation no longer blocks an overlap';
  end if;
  raise notice 'VERROU: step 8 D-08 erasure nulls utilisateur_id and still blocks an overlap';
end $$;

rollback;

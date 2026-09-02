-- D-27: the 15-minute slot retention. This file exists to prove the
-- retention never becomes a second source of truth -- app.reserver_creneau
-- still re-derives availability inside its own transaction and still relies
-- on the exclusion constraint, so an expired, purged or forged retention can
-- only ever produce a French refusal, never a double booking. Local-only:
-- lives under supabase/tests/, never under supabase/migrations/, and is
-- never pushed.
--
-- Run with: docker exec -i supabase_db_ElearningAriba psql -U postgres
-- -d postgres -v ON_ERROR_STOP=1 -f - < supabase/tests/lot4_maintien_creneau.sql
-- Single transaction, rolled back at the end so it leaves no data and can be
-- re-run at will.

begin;

-- 1. Control: seed a type, a weekly rule and two auth.users rows. Assert
-- app.creneaux_libres returns a non-zero count over a window two days out,
-- and capture one free instant as the subject.
insert into app.type_rendez_vous (id, libelle, duree_minutes, tampon_minutes, prix_centimes)
values ('individuelle', 'Session individuelle', 30, 15, 9000);

insert into app.disponibilite_hebdomadaire (jour_semaine, heure_debut, heure_fin)
select d, '09:00', '17:00' from generate_series(1, 7) d;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  is_sso_user, is_anonymous, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000003a',
   'authenticated', 'authenticated', 'maintien-a@example.test', 'x',
   now(), '{}'::jsonb, '{}'::jsonb, false, false, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000003b',
   'authenticated', 'authenticated', 'maintien-b@example.test', 'x',
   now(), '{}'::jsonb, '{}'::jsonb, false, false, now(), now());

do $$
declare
  free_count int;
begin
  select count(*) into free_count from app.creneaux_libres('individuelle', current_date + 2, current_date + 2);
  if free_count = 0 then
    raise exception 'control failed: no free instants two days out';
  end if;
  raise notice 'MAINTIEN: step 1 control OK, % free instant(s) two days out', free_count;
end $$;

-- 2. Early-morning bound (the at time zone guard): insert a weekly rule
-- starting at 00:30 Europe/Paris on a carrier weekday, take the resulting
-- 00:30 instant from app.creneaux_libres, and assert app.maintenir_creneau
-- on it returns 'ok' and not 'creneau_indisponible'. Run before the ordinary
-- cases so a green suite cannot come from never touching the boundary.
insert into app.disponibilite_hebdomadaire (jour_semaine, heure_debut, heure_fin)
select d, '00:30', '01:15' from generate_series(1, 7) d;

do $$
declare
  v_early timestamptz;
  v_resultat text;
  v_jeton uuid;
  v_expire_le timestamptz;
begin
  select debut into v_early
  from app.creneaux_libres('individuelle', current_date + 3, current_date + 3)
  where (debut at time zone 'Europe/Paris')::time >= '00:00' and (debut at time zone 'Europe/Paris')::time < '01:00'
  order by debut limit 1;

  if v_early is null then
    raise exception 'MAINTIEN: step 2 setup failed -- no early-morning instant found (bare p_debut::date would land on the wrong day if this test itself mis-derived it)';
  end if;

  select resultat, jeton, expire_le into v_resultat, v_jeton, v_expire_le
  from app.maintenir_creneau('individuelle', v_early);

  if v_resultat != 'ok' then
    raise exception 'MAINTIEN: step 2 early-morning retention returned % instead of ok (at time zone guard failed)', v_resultat;
  end if;

  -- release immediately so it does not interfere with the ordinary cases
  perform app.liberer_creneau(v_jeton);

  raise notice 'MAINTIEN: step 2 early-morning (00:xx Europe/Paris) retention returned ok -- at time zone guard OK';
end $$;

-- 3. A never-minted token creates nothing (the B2 property). Five different
-- fresh, never-issued tokens each return 'jeton_inconnu' and leave
-- app.maintien_creneau unchanged, and the targeted instant is still offered
-- by a tokenless read.
do $$
declare
  v_target timestamptz;
  v_resultat text;
  v_before int;
  v_after int;
  i int;
begin
  select debut into v_target
  from app.creneaux_libres('individuelle', current_date + 4, current_date + 4)
  order by debut limit 1;

  select count(*) into v_before from app.maintien_creneau;

  for i in 1..5 loop
    select resultat into v_resultat
    from app.maintenir_creneau('individuelle', v_target, gen_random_uuid());

    if v_resultat != 'jeton_inconnu' then
      raise exception 'MAINTIEN: step 3 iteration % returned % instead of jeton_inconnu for a never-minted token', i, v_resultat;
    end if;

    select count(*) into v_after from app.maintien_creneau;
    if v_after != v_before then
      raise exception 'MAINTIEN: step 3 iteration % -- a never-minted token created a row (count % -> %)', i, v_before, v_after;
    end if;
  end loop;

  if not exists (select 1 from app.creneaux_libres('individuelle', current_date + 4, current_date + 4) c where c.debut = v_target) then
    raise exception 'MAINTIEN: step 3 -- the targeted instant is no longer offered after five refused mint attempts';
  end if;

  raise notice 'MAINTIEN: step 3 five never-minted tokens each returned jeton_inconnu, created zero rows -- bounds anonymous grid-blanking';
end $$;

-- 4. Retain: call app.maintenir_creneau for a free instant with a null
-- token. Assert resultat = 'ok', a token came back, and expire_le - now()
-- is between 14 and 15 minutes.
do $$
declare
  v_target timestamptz;
  v_resultat text;
  v_jeton uuid;
  v_expire_le timestamptz;
begin
  select debut into v_target
  from app.creneaux_libres('individuelle', current_date + 5, current_date + 5)
  order by debut limit 1;

  select resultat, jeton, expire_le into v_resultat, v_jeton, v_expire_le
  from app.maintenir_creneau('individuelle', v_target);

  if v_resultat != 'ok' then
    raise exception 'MAINTIEN: step 4 mint returned % instead of ok', v_resultat;
  end if;
  if v_jeton is null then
    raise exception 'MAINTIEN: step 4 mint returned no token';
  end if;
  if (v_expire_le - now()) < interval '14 minutes' or (v_expire_le - now()) > interval '15 minutes' then
    raise exception 'MAINTIEN: step 4 expire_le - now() was % (expected 14-15 minutes)', (v_expire_le - now());
  end if;

  raise notice 'MAINTIEN: step 4 mint OK, token=%, window=%', v_jeton, (v_expire_le - now());
end $$;

-- 5. Cross-visitor hiding: creneaux_libres with no token no longer returns
-- that instant, while creneaux_libres with the token still does.
do $$
declare
  v_target timestamptz;
  v_jeton uuid;
  v_resultat text;
begin
  select debut into v_target
  from app.creneaux_libres('individuelle', current_date + 6, current_date + 6)
  order by debut limit 1;

  select resultat, jeton into v_resultat, v_jeton
  from app.maintenir_creneau('individuelle', v_target);

  if v_resultat != 'ok' then
    raise exception 'MAINTIEN: step 5 setup mint returned %', v_resultat;
  end if;

  if exists (select 1 from app.creneaux_libres('individuelle', current_date + 6, current_date + 6) c where c.debut = v_target) then
    raise exception 'MAINTIEN: step 5 -- tokenless read still shows the retained instant';
  end if;

  if not exists (select 1 from app.creneaux_libres('individuelle', current_date + 6, current_date + 6, v_jeton) c where c.debut = v_target) then
    raise exception 'MAINTIEN: step 5 -- the holder''s own token does not see their retained instant';
  end if;

  raise notice 'MAINTIEN: step 5 cross-visitor hiding OK -- hidden tokenless, visible to holder';
end $$;

-- 6. One retention per token: call app.maintenir_creneau again with the
-- same token on a different free instant; assert one row for that token and
-- the first instant is offered publicly again.
do $$
declare
  v_first timestamptz;
  v_second timestamptz;
  v_jeton uuid;
  v_resultat text;
  v_count int;
begin
  select debut into v_first
  from app.creneaux_libres('individuelle', current_date + 7, current_date + 7)
  order by debut limit 1;

  select resultat, jeton into v_resultat, v_jeton
  from app.maintenir_creneau('individuelle', v_first);
  if v_resultat != 'ok' then
    raise exception 'MAINTIEN: step 6 setup mint returned %', v_resultat;
  end if;

  select debut into v_second
  from app.creneaux_libres('individuelle', current_date + 7, current_date + 7, v_jeton)
  where debut != v_first
  order by debut limit 1;

  select resultat into v_resultat
  from app.maintenir_creneau('individuelle', v_second, v_jeton);
  if v_resultat != 'ok' then
    raise exception 'MAINTIEN: step 6 replace on a different instant returned %', v_resultat;
  end if;

  select count(*) into v_count from app.maintien_creneau where jeton = v_jeton;
  if v_count != 1 then
    raise exception 'MAINTIEN: step 6 -- % row(s) exist for one token after a replace (expected 1)', v_count;
  end if;

  if not exists (select 1 from app.creneaux_libres('individuelle', current_date + 7, current_date + 7) c where c.debut = v_first) then
    raise exception 'MAINTIEN: step 6 -- the first instant is not offered publicly again after the replace';
  end if;

  raise notice 'MAINTIEN: step 6 one retention per token OK -- replace freed the first instant';
end $$;

-- 7. Contention: with instant A retained by token 1, call
-- app.maintenir_creneau for A with a fresh token 2 and assert
-- 'creneau_indisponible' and no second row exists.
do $$
declare
  v_target timestamptz;
  v_jeton1 uuid;
  v_resultat text;
  v_count_before int;
  v_count_after int;
begin
  select debut into v_target
  from app.creneaux_libres('individuelle', current_date + 8, current_date + 8)
  order by debut limit 1;

  select resultat, jeton into v_resultat, v_jeton1
  from app.maintenir_creneau('individuelle', v_target);
  if v_resultat != 'ok' then
    raise exception 'MAINTIEN: step 7 setup mint returned %', v_resultat;
  end if;

  select count(*) into v_count_before from app.maintien_creneau;

  select resultat into v_resultat
  from app.maintenir_creneau('individuelle', v_target);   -- p_jeton null -> a fresh, second visitor

  if v_resultat != 'creneau_indisponible' then
    raise exception 'MAINTIEN: step 7 -- a second visitor retained an already-held instant (got %)', v_resultat;
  end if;

  select count(*) into v_count_after from app.maintien_creneau;
  if v_count_after != v_count_before then
    raise exception 'MAINTIEN: step 7 -- refused contention still created a row (% -> %)', v_count_before, v_count_after;
  end if;

  raise notice 'MAINTIEN: step 7 contention OK -- second visitor refused, no second row';
end $$;

-- 8. Lapse: force expire_le into the past, then assert the instant is
-- offered publicly again WITHOUT any sweep having run -- expiry is a
-- read-side predicate, not a deletion. Then call
-- app.purger_maintiens_expires() and assert it deleted the row, and that a
-- second call deletes 0.
do $$
declare
  v_target timestamptz;
  v_jeton uuid;
  v_resultat text;
  v_purged int;
  v_purged_again int;
begin
  select debut into v_target
  from app.creneaux_libres('individuelle', current_date + 15, current_date + 15)
  order by debut limit 1;

  select resultat, jeton into v_resultat, v_jeton
  from app.maintenir_creneau('individuelle', v_target);
  if v_resultat != 'ok' then
    raise exception 'MAINTIEN: step 8 setup mint returned %', v_resultat;
  end if;

  update app.maintien_creneau set expire_le = now() - interval '1 minute' where jeton = v_jeton;

  if not exists (select 1 from app.creneaux_libres('individuelle', current_date + 15, current_date + 15) c where c.debut = v_target) then
    raise exception 'MAINTIEN: step 8 -- lapsed instant is not offered publicly before any sweep ran';
  end if;

  select app.purger_maintiens_expires() into v_purged;
  if v_purged < 1 then
    raise exception 'MAINTIEN: step 8 -- purge deleted % rows, expected at least 1', v_purged;
  end if;
  if exists (select 1 from app.maintien_creneau where jeton = v_jeton) then
    raise exception 'MAINTIEN: step 8 -- lapsed row survived the purge';
  end if;

  select app.purger_maintiens_expires() into v_purged_again;
  if v_purged_again != 0 then
    raise exception 'MAINTIEN: step 8 -- a second purge deleted % rows, expected 0', v_purged_again;
  end if;

  raise notice 'MAINTIEN: step 8 lapse OK -- offered before any sweep, purge deleted the lapsed row, second purge deleted 0';
end $$;

-- 9. The retention is not authority. Retain instant A with token 1. As
-- learner B (token 2), call app.reserver_creneau for A and assert
-- 'creneau_indisponible'. Then delete the retention row directly as
-- superuser and, as learner B, book A successfully. Finally, as learner A
-- holding a forged token that matches no row, call app.reserver_creneau on
-- the now-taken instant and assert 'creneau_indisponible'.
do $$
declare
  v_target timestamptz;
  v_jeton1 uuid;
  v_resultat text;
begin
  select debut into v_target
  from app.creneaux_libres('individuelle', current_date + 16, current_date + 16)
  order by debut limit 1;

  select resultat, jeton into v_resultat, v_jeton1
  from app.maintenir_creneau('individuelle', v_target);
  if v_resultat != 'ok' then
    raise exception 'MAINTIEN: step 9 setup mint returned %', v_resultat;
  end if;

  -- as learner B, attempt to book the retained instant
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000003b","role":"authenticated"}', true);

  select resultat into v_resultat from app.reserver_creneau('individuelle', v_target, 'https://meet.example.test/salle');
  if v_resultat != 'creneau_indisponible' then
    raise exception 'MAINTIEN: step 9a learner B booked a retention-hidden instant (got %)', v_resultat;
  end if;

  perform set_config('role', 'postgres', true);

  -- superuser deletes the retention directly
  delete from app.maintien_creneau where jeton = v_jeton1;

  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000003b","role":"authenticated"}', true);

  select resultat into v_resultat from app.reserver_creneau('individuelle', v_target, 'https://meet.example.test/salle');
  if v_resultat != 'ok' then
    raise exception 'MAINTIEN: step 9b learner B could not book after the retention was cleared (got %)', v_resultat;
  end if;

  -- as learner A, with a forged token matching no row, try the now-taken
  -- instant
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000003a","role":"authenticated"}', true);

  select resultat into v_resultat
  from app.reserver_creneau('individuelle', v_target, 'https://meet.example.test/salle', gen_random_uuid());
  if v_resultat != 'creneau_indisponible' then
    raise exception 'MAINTIEN: step 9c a forged token let learner A book an already-taken instant (got %)', v_resultat;
  end if;

  perform set_config('role', 'postgres', true);

  raise notice 'MAINTIEN: step 9 retention grants nothing -- hidden while held, bookable once cleared, forged token grants nothing (D-03, D-27)';
end $$;

-- 10. Release-on-commit: retain a free instant with a token, call
-- app.reserver_creneau for it passing that same token, assert 'ok', and
-- assert the retention row for that token is now gone.
do $$
declare
  v_target timestamptz;
  v_jeton uuid;
  v_resultat text;
  v_remaining int;
begin
  select debut into v_target
  from app.creneaux_libres('individuelle', current_date + 17, current_date + 17)
  order by debut limit 1;

  select resultat, jeton into v_resultat, v_jeton
  from app.maintenir_creneau('individuelle', v_target);
  if v_resultat != 'ok' then
    raise exception 'MAINTIEN: step 10 setup mint returned %', v_resultat;
  end if;

  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000003a","role":"authenticated"}', true);

  select resultat into v_resultat
  from app.reserver_creneau('individuelle', v_target, 'https://meet.example.test/salle', v_jeton);
  if v_resultat != 'ok' then
    raise exception 'MAINTIEN: step 10 booking with the retaining token returned %', v_resultat;
  end if;

  perform set_config('role', 'postgres', true);

  select count(*) into v_remaining from app.maintien_creneau where jeton = v_jeton;
  if v_remaining != 0 then
    raise exception 'MAINTIEN: step 10 -- % retention row(s) remain for the committing token after booking', v_remaining;
  end if;

  raise notice 'MAINTIEN: step 10 release-on-commit OK -- 0 retention rows remain for the committing token';
end $$;

rollback;

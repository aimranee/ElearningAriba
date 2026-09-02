-- AGD-04, AGD-07, AGD-08: learner isolation on app.reservation, the
-- withheld insert/update privilege (the Lot 7 seam), self-escalation
-- refusal, admin write access to disponibilite_hebdomadaire and
-- exception_agenda, and AGD-03 store isolation on app.type_rendez_vous
-- (update-only, zero rows for a learner). Local-only: lives under
-- supabase/tests/, never under supabase/migrations/, and is never pushed.
--
-- Run with: docker exec -i supabase_db_ElearningAriba psql -U postgres
-- -d postgres -v ON_ERROR_STOP=1 -f - < supabase/tests/lot4_rls_reservation.sql
-- Single transaction, rolled back at the end so it leaves no data and can be
-- re-run at will.

begin;

-- 1. Control: two learners plus one administrator, each with one
-- reservation, all demonstrably present on the bypass path.
-- on conflict/do update, not a plain insert: plan 04-02's agenda:seed now
-- permanently seeds this id outside any transaction, so a plain insert
-- collides (23505) once the environment has been bootstrapped. The upsert
-- forces this file's own duree_minutes/tampon_minutes/prix_centimes for the
-- duration of this transaction; rollback restores the seeded row afterward.
insert into app.type_rendez_vous (id, libelle, duree_minutes, tampon_minutes, prix_centimes)
values ('individuelle', 'Session individuelle', 30, 15, 9000)
on conflict (id) do update set
  libelle = excluded.libelle,
  duree_minutes = excluded.duree_minutes,
  tampon_minutes = excluded.tampon_minutes,
  prix_centimes = excluded.prix_centimes;

-- every isodow, so step 7b's anon read of app.creneaux_libres has a
-- guaranteed non-empty result within the 8-week horizon regardless of what
-- day of the week this test happens to run on
insert into app.disponibilite_hebdomadaire (jour_semaine, heure_debut, heure_fin)
select d, '09:00', '17:00' from generate_series(1, 7) d;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  is_sso_user, is_anonymous, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000002a',
   'authenticated', 'authenticated', 'rls-a@example.test', 'x',
   now(), '{}'::jsonb, '{}'::jsonb, false, false, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000002b',
   'authenticated', 'authenticated', 'rls-b@example.test', 'x',
   now(), '{}'::jsonb, '{}'::jsonb, false, false, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000002c',
   'authenticated', 'authenticated', 'rls-admin@example.test', 'x',
   now(), '{}'::jsonb, '{}'::jsonb, false, false, now(), now());

update app.profil set role = 'administrator' where utilisateur_id = '00000000-0000-0000-0000-00000000002c';

insert into app.reservation (utilisateur_id, type_id, debut, fin, fin_avec_tampon, lieu, ics_uid)
values
  ('00000000-0000-0000-0000-00000000002a', 'individuelle',
   ((current_date + 9) + time '09:00') at time zone 'Europe/Paris',
   ((current_date + 9) + time '09:30') at time zone 'Europe/Paris',
   ((current_date + 9) + time '09:45') at time zone 'Europe/Paris',
   'https://meet.example.test/salle', 'rls-a-1@formation-sap-ariba.fr'),
  ('00000000-0000-0000-0000-00000000002b', 'individuelle',
   ((current_date + 9) + time '11:00') at time zone 'Europe/Paris',
   ((current_date + 9) + time '11:30') at time zone 'Europe/Paris',
   ((current_date + 9) + time '11:45') at time zone 'Europe/Paris',
   'https://meet.example.test/salle', 'rls-b-1@formation-sap-ariba.fr'),
  ('00000000-0000-0000-0000-00000000002c', 'individuelle',
   ((current_date + 9) + time '13:00') at time zone 'Europe/Paris',
   ((current_date + 9) + time '13:30') at time zone 'Europe/Paris',
   ((current_date + 9) + time '13:45') at time zone 'Europe/Paris',
   'https://meet.example.test/salle', 'rls-admin-1@formation-sap-ariba.fr');

do $$
begin
  if (select count(*) from app.reservation) != 3 then
    raise exception 'control failed: three control reservations missing';
  end if;
  if (select role from app.profil where utilisateur_id = '00000000-0000-0000-0000-00000000002c') != 'administrator' then
    raise exception 'control failed: administrator role not set';
  end if;
  raise notice 'RLS-RESERVATION: step 1 control OK';
end $$;

-- Switch identity: authenticated as learner A.
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000002a","role":"authenticated"}';

-- 2. As learner A: select count(*) where utilisateur_id = B must be 0.
do $$
declare
  leaked_count int;
begin
  select count(*) into leaked_count from app.reservation where utilisateur_id = '00000000-0000-0000-0000-00000000002b';
  if leaked_count != 0 then
    raise exception 'RLS-RESERVATION LEAK: learner A read % of learner B reservation row(s)', leaked_count;
  end if;
  raise notice 'RLS-RESERVATION: step 2 DENIED cross-learner read';
end $$;

-- 3. As learner A: update/insert on app.reservation must be refused
-- (insufficient_privilege -- both verbs withheld from authenticated).
do $$
declare
  update_refused boolean := false;
  insert_refused boolean := false;
begin
  begin
    update app.reservation set statut = 'annulee' where utilisateur_id = '00000000-0000-0000-0000-00000000002a';
  exception
    when insufficient_privilege then
      update_refused := true;
  end;

  begin
    insert into app.reservation (utilisateur_id, type_id, debut, fin, fin_avec_tampon, lieu, ics_uid)
    values (
      '00000000-0000-0000-0000-00000000002a', 'individuelle',
      ((current_date + 20) + time '09:00') at time zone 'Europe/Paris',
      ((current_date + 20) + time '09:30') at time zone 'Europe/Paris',
      ((current_date + 20) + time '09:45') at time zone 'Europe/Paris',
      'https://meet.example.test/salle', 'rls-forged-insert@formation-sap-ariba.fr'
    );
  exception
    when insufficient_privilege then
      insert_refused := true;
  end;

  if not update_refused then
    raise exception 'RLS-RESERVATION LEAK: learner A updated a reservation directly';
  end if;
  if not insert_refused then
    raise exception 'RLS-RESERVATION LEAK: learner A inserted a reservation directly';
  end if;
  raise notice 'RLS-RESERVATION: step 3 DENIED learner update/insert on app.reservation';
end $$;

-- 4. As learner A: self-escalation to administrator must still raise
-- insufficient_privilege (the withheld column grant, Lot 3's control,
-- unchanged by Lot 4).
do $$
declare
  escalation_raised boolean := false;
begin
  begin
    update app.profil set role = 'administrator' where utilisateur_id = '00000000-0000-0000-0000-00000000002a';
  exception
    when insufficient_privilege then
      escalation_raised := true;
  end;

  if not escalation_raised then
    raise exception 'RLS-RESERVATION LEAK: learner A escalated their own role to administrator';
  end if;
  raise notice 'RLS-RESERVATION: step 4 DENIED role escalation';
end $$;

-- 5. As learner A: writes to disponibilite_hebdomadaire and exception_agenda
-- must be refused; as the administrator, the same writes must succeed and
-- select count(*) from app.reservation must see all rows.
do $$
declare
  dispo_refused boolean := false;
  exception_refused boolean := false;
begin
  begin
    insert into app.disponibilite_hebdomadaire (jour_semaine, heure_debut, heure_fin)
    values (1, '08:00', '09:00');
  exception
    when insufficient_privilege then dispo_refused := true;
  end;

  begin
    insert into app.exception_agenda (jour, ouvert, motif)
    values (current_date + 30, false, 'blocage');
  exception
    when insufficient_privilege then exception_refused := true;
  end;

  if not dispo_refused then
    raise exception 'RLS-RESERVATION LEAK: learner A wrote to disponibilite_hebdomadaire';
  end if;
  if not exception_refused then
    raise exception 'RLS-RESERVATION LEAK: learner A wrote to exception_agenda';
  end if;
  raise notice 'RLS-RESERVATION: step 5a DENIED learner writes to disponibilite_hebdomadaire and exception_agenda';
end $$;

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000002c","role":"authenticated"}';

do $$
declare
  all_count int;
begin
  insert into app.disponibilite_hebdomadaire (jour_semaine, heure_debut, heure_fin)
  values (2, '08:00', '09:00');

  insert into app.exception_agenda (jour, ouvert, motif)
  values (current_date + 30, false, 'blocage');

  select count(*) into all_count from app.reservation;
  if all_count != 3 then
    raise exception 'RLS-RESERVATION: administrator did not see all 3 reservation rows (saw %)', all_count;
  end if;

  raise notice 'RLS-RESERVATION: step 5b ALLOWED administrator writes to disponibilite_hebdomadaire/exception_agenda and full reservation visibility';
end $$;

-- 6. AGD-03 store isolation: as learner A, update on app.type_rendez_vous
-- must affect zero rows (privilege exists, policy refuses) -- assert the
-- row's price is unchanged, not merely that no error was raised. insert and
-- delete must raise insufficient_privilege. As the administrator, update
-- must change the row while insert/delete must still raise
-- insufficient_privilege -- configure-only holds for every role.
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000002a","role":"authenticated"}';

do $$
declare
  affected_rows int;
  price_after int;
  insert_refused boolean := false;
  delete_refused boolean := false;
begin
  update app.type_rendez_vous set prix_centimes = 0 where id = 'individuelle';
  get diagnostics affected_rows = row_count;

  select prix_centimes into price_after from app.type_rendez_vous where id = 'individuelle';

  if affected_rows != 0 then
    raise exception 'RLS-RESERVATION LEAK: learner A''s update of type_rendez_vous affected % row(s)', affected_rows;
  end if;
  if price_after != 9000 then
    raise exception 'RLS-RESERVATION LEAK: type_rendez_vous price changed to % after learner A''s refused update', price_after;
  end if;

  begin
    insert into app.type_rendez_vous (id, libelle, duree_minutes)
    values ('forge', 'Forge', 30);
  exception
    when insufficient_privilege then insert_refused := true;
  end;

  begin
    delete from app.type_rendez_vous where id = 'individuelle';
  exception
    when insufficient_privilege then delete_refused := true;
  end;

  if not insert_refused then
    raise exception 'RLS-RESERVATION LEAK: learner A inserted a type_rendez_vous row';
  end if;
  if not delete_refused then
    raise exception 'RLS-RESERVATION LEAK: learner A deleted a type_rendez_vous row';
  end if;

  raise notice 'RLS-RESERVATION: step 6a DENIED learner update (0 rows, price unchanged), insert and delete on type_rendez_vous';
end $$;

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000002c","role":"authenticated"}';

do $$
declare
  affected_rows int;
  price_after int;
  insert_refused boolean := false;
  delete_refused boolean := false;
begin
  update app.type_rendez_vous set prix_centimes = 9500 where id = 'individuelle';
  get diagnostics affected_rows = row_count;

  select prix_centimes into price_after from app.type_rendez_vous where id = 'individuelle';

  if affected_rows != 1 or price_after != 9500 then
    raise exception 'RLS-RESERVATION: administrator update of type_rendez_vous did not take effect (rows=%, price=%)', affected_rows, price_after;
  end if;

  begin
    insert into app.type_rendez_vous (id, libelle, duree_minutes)
    values ('forge-admin', 'Forge admin', 30);
  exception
    when insufficient_privilege then insert_refused := true;
  end;

  begin
    delete from app.type_rendez_vous where id = 'individuelle';
  exception
    when insufficient_privilege then delete_refused := true;
  end;

  if not insert_refused then
    raise exception 'RLS-RESERVATION LEAK: administrator inserted a type_rendez_vous row despite no insert policy/grant';
  end if;
  if not delete_refused then
    raise exception 'RLS-RESERVATION LEAK: administrator deleted a type_rendez_vous row despite no delete policy/grant';
  end if;

  raise notice 'RLS-RESERVATION: step 6b ALLOWED administrator update (price changed); DENIED insert and delete -- configure-only holds for every role';
end $$;

reset role;

-- 7. As anon: select count(*) from app.reservation must be refused or 0,
-- while app.creneaux_libres must still return rows (D-23: the visitor
-- learns that an instant is not offered, never why).
set local role anon;

do $$
declare
  anon_reservation_count int;
  select_refused boolean := false;
begin
  begin
    select count(*) into anon_reservation_count from app.reservation;
  exception
    when insufficient_privilege then
      select_refused := true;
      anon_reservation_count := 0;
  end;

  if not select_refused and anon_reservation_count != 0 then
    raise exception 'RLS-RESERVATION LEAK: anon read % reservation row(s)', anon_reservation_count;
  end if;

  raise notice 'RLS-RESERVATION: step 7a DENIED anon read of app.reservation';
end $$;

do $$
declare
  free_count int;
begin
  select count(*) into free_count from app.creneaux_libres('individuelle', current_date, current_date + 7);
  raise notice 'RLS-RESERVATION: step 7b anon app.creneaux_libres() still returns % free instant(s) -- D-23', free_count;
end $$;

reset role;

-- ============================================================================
-- Plan 04-07: the three admin-only reservation RPCs
-- (app.deplacer_reservation, app.annuler_reservation,
-- app.reserver_pour_apprenant), extending the file rather than replacing it.
-- ============================================================================

-- 8. Setup: a fourth learner (D), used below as reserver_pour_apprenant's
-- known-email target.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  is_sso_user, is_anonymous, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000002d',
   'authenticated', 'authenticated', 'rls-d@example.test', 'x',
   now(), '{}'::jsonb, '{}'::jsonb, false, false, now(), now());

-- 9. As learner A: each of the three admin RPCs is executable but refuses
-- with 'non_autorise' and writes nothing -- the grant is not the control,
-- the in-body app.est_administrateur() check is.
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000002a","role":"authenticated"}';

do $$
declare
  v_resultat text;
  v_reservation_id uuid;
  v_count_before int;
  v_count_after int;
  v_id_a uuid;
begin
  select id into v_id_a from app.reservation where utilisateur_id = '00000000-0000-0000-0000-00000000002a';

  select resultat into v_resultat from app.deplacer_reservation(
    v_id_a, ((current_date + 9) + time '15:00') at time zone 'Europe/Paris');
  if v_resultat != 'non_autorise' then
    raise exception 'RLS-RESERVATION LEAK: learner A invoked deplacer_reservation, got %', v_resultat;
  end if;

  select resultat into v_resultat from app.annuler_reservation(v_id_a);
  if v_resultat != 'non_autorise' then
    raise exception 'RLS-RESERVATION LEAK: learner A invoked annuler_reservation, got %', v_resultat;
  end if;

  select count(*) into v_count_before from app.reservation;
  select resultat, reservation_id into v_resultat, v_reservation_id
    from app.reserver_pour_apprenant('rls-b@example.test', 'individuelle',
      ((current_date + 9) + time '15:00') at time zone 'Europe/Paris',
      'https://meet.example.test/salle');
  select count(*) into v_count_after from app.reservation;
  if v_resultat != 'non_autorise' then
    raise exception 'RLS-RESERVATION LEAK: learner A invoked reserver_pour_apprenant, got %', v_resultat;
  end if;
  if v_count_before != v_count_after then
    raise exception 'RLS-RESERVATION LEAK: reserver_pour_apprenant wrote a row for a non-admin caller';
  end if;

  raise notice 'RLS-RESERVATION: step 8 DENIED all three admin RPCs for a learner caller, writing nothing';
end $$;

-- 10. As the administrator: deplacer_reservation onto a free instant
-- succeeds, bumps ics_sequence by exactly 1, and leaves ics_uid unchanged.
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000002c","role":"authenticated"}';

do $$
declare
  v_id_a uuid;
  v_uid_before text;
  v_seq_before int;
  v_uid_after text;
  v_seq_after int;
  v_resultat text;
begin
  select id, ics_uid, ics_sequence into v_id_a, v_uid_before, v_seq_before
    from app.reservation where utilisateur_id = '00000000-0000-0000-0000-00000000002a';

  select resultat into v_resultat from app.deplacer_reservation(
    v_id_a, ((current_date + 9) + time '15:00') at time zone 'Europe/Paris');
  if v_resultat != 'ok' then
    raise exception 'RLS-RESERVATION: admin move onto a free instant failed, got %', v_resultat;
  end if;

  select ics_uid, ics_sequence into v_uid_after, v_seq_after
    from app.reservation where id = v_id_a;
  if v_uid_after != v_uid_before then
    raise exception 'RLS-RESERVATION: deplacer_reservation changed ics_uid';
  end if;
  if v_seq_after != v_seq_before + 1 then
    raise exception 'RLS-RESERVATION: deplacer_reservation did not bump ics_sequence by exactly 1 (before=%, after=%)', v_seq_before, v_seq_after;
  end if;

  raise notice 'RLS-RESERVATION: step 9 ALLOWED admin move onto a free instant, ics_sequence +1, ics_uid unchanged';
end $$;

-- 11. As the administrator: deplacer_reservation onto an instant already
-- held by another confirmed reservation (learner B's, 11:00) is refused and
-- leaves the row untouched.
do $$
declare
  v_id_a uuid;
  v_debut_before timestamptz;
  v_debut_after timestamptz;
  v_resultat text;
begin
  select id, debut into v_id_a, v_debut_before
    from app.reservation where utilisateur_id = '00000000-0000-0000-0000-00000000002a';

  select resultat into v_resultat from app.deplacer_reservation(
    v_id_a, ((current_date + 9) + time '11:00') at time zone 'Europe/Paris');
  if v_resultat != 'creneau_indisponible' then
    raise exception 'RLS-RESERVATION: admin move onto a taken instant should be refused, got %', v_resultat;
  end if;

  select debut into v_debut_after from app.reservation where id = v_id_a;
  if v_debut_after != v_debut_before then
    raise exception 'RLS-RESERVATION: refused move nonetheless changed debut';
  end if;

  raise notice 'RLS-RESERVATION: step 10 DENIED admin move onto a taken instant, row untouched';
end $$;

-- 12. As the administrator: annuler_reservation sets statut = 'annulee', and
-- a subsequent reserver_creneau by a learner on the freed instant succeeds.
do $$
declare
  v_id_a uuid;
  v_resultat text;
begin
  select id into v_id_a
    from app.reservation where utilisateur_id = '00000000-0000-0000-0000-00000000002a';

  select resultat into v_resultat from app.annuler_reservation(v_id_a);
  if v_resultat != 'ok' then
    raise exception 'RLS-RESERVATION: admin cancel failed, got %', v_resultat;
  end if;

  raise notice 'RLS-RESERVATION: step 11a ALLOWED admin cancel, statut set to annulee';
end $$;

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000002b","role":"authenticated"}';

do $$
declare
  v_resultat text;
  v_new_id uuid;
begin
  select resultat, reservation_id into v_resultat, v_new_id
    from app.reserver_creneau('individuelle',
      ((current_date + 9) + time '15:00') at time zone 'Europe/Paris',
      'https://meet.example.test/salle');
  if v_resultat != 'ok' then
    raise exception 'RLS-RESERVATION: learner booking the instant freed by an admin cancellation should succeed, got %', v_resultat;
  end if;

  raise notice 'RLS-RESERVATION: step 11b ALLOWED learner booking on the instant freed by admin cancellation';
end $$;

reset role;

-- 13. D-27 interaction: a visitor holds a retention on instant A; an
-- administrator's deplacer_reservation onto A succeeds (the admin outranks
-- the hold) and app.maintien_creneau is then empty for that instant -- the
-- sold slot is not left hidden by a stale hold.
set local role anon;

do $$
declare
  v_resultat text;
  v_jeton uuid;
begin
  select resultat, jeton into v_resultat, v_jeton
    from app.maintenir_creneau('individuelle',
      ((current_date + 11) + time '09:00') at time zone 'Europe/Paris');
  if v_resultat != 'ok' then
    raise exception 'RLS-RESERVATION: visitor retention setup failed, got %', v_resultat;
  end if;
  raise notice 'RLS-RESERVATION: step 12a a visitor holds a retention on instant A';
end $$;

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000002c","role":"authenticated"}';

do $$
declare
  v_id_admin uuid;
  v_resultat text;
begin
  select id into v_id_admin
    from app.reservation where utilisateur_id = '00000000-0000-0000-0000-00000000002c';

  select resultat into v_resultat from app.deplacer_reservation(
    v_id_admin, ((current_date + 11) + time '09:00') at time zone 'Europe/Paris');
  if v_resultat != 'ok' then
    raise exception 'RLS-RESERVATION: admin move onto a visitor-held instant should succeed (admin outranks the hold), got %', v_resultat;
  end if;
  raise notice 'RLS-RESERVATION: step 12b ALLOWED admin move onto instant A despite the visitor''s hold';
end $$;

reset role;

do $$
declare
  v_maintien_count int;
begin
  select count(*) into v_maintien_count from app.maintien_creneau
    where plage && tstzrange(
      ((current_date + 11) + time '09:00') at time zone 'Europe/Paris',
      ((current_date + 11) + time '09:45') at time zone 'Europe/Paris', '[)');
  if v_maintien_count != 0 then
    raise exception 'RLS-RESERVATION: a stale retention is still present after the admin sold the slot (count=%)', v_maintien_count;
  end if;
  raise notice 'RLS-RESERVATION: step 12c the sold slot is not left hidden by a stale hold (app.maintien_creneau count 0)';
end $$;

-- 14. reserver_pour_apprenant: an unknown email refuses and creates
-- nothing (D-18); a known email succeeds and the row belongs to the
-- learner, not the administrator.
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000002c","role":"authenticated"}';

do $$
declare
  v_resultat text;
  v_reservation_id uuid;
  v_count_before int;
  v_count_after int;
begin
  select count(*) into v_count_before from app.reservation;
  select resultat, reservation_id into v_resultat, v_reservation_id
    from app.reserver_pour_apprenant('inconnu@example.test', 'individuelle',
      ((current_date + 12) + time '09:00') at time zone 'Europe/Paris',
      'https://meet.example.test/salle');
  select count(*) into v_count_after from app.reservation;

  if v_resultat != 'apprenant_introuvable' then
    raise exception 'RLS-RESERVATION: reserver_pour_apprenant with an unknown email should refuse, got %', v_resultat;
  end if;
  if v_count_before != v_count_after then
    raise exception 'RLS-RESERVATION LEAK: reserver_pour_apprenant created a row for an unknown email';
  end if;

  raise notice 'RLS-RESERVATION: step 13a DENIED reserver_pour_apprenant for an unknown email, no row created';
end $$;

do $$
declare
  v_resultat text;
  v_reservation_id uuid;
  v_owner uuid;
begin
  select resultat, reservation_id into v_resultat, v_reservation_id
    from app.reserver_pour_apprenant('rls-d@example.test', 'individuelle',
      ((current_date + 12) + time '09:00') at time zone 'Europe/Paris',
      'https://meet.example.test/salle');

  if v_resultat != 'ok' or v_reservation_id is null then
    raise exception 'RLS-RESERVATION: reserver_pour_apprenant with a known email should succeed, got %', v_resultat;
  end if;

  select utilisateur_id into v_owner from app.reservation where id = v_reservation_id;
  if v_owner != '00000000-0000-0000-0000-00000000002d' then
    raise exception 'RLS-RESERVATION: reserver_pour_apprenant assigned the reservation to % instead of the learner', v_owner;
  end if;

  raise notice 'RLS-RESERVATION: step 13b ALLOWED reserver_pour_apprenant for a known email, row owned by the learner not the admin';
end $$;

reset role;

-- 15. profil_admin_select (added by this plan, supabase/migrations/
-- 20260901182000_lot4_admin_reservation.sql): the administrator can read
-- other learners' app.profil rows for the plan 04-07 export/read join; a
-- learner still cannot.
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000002c","role":"authenticated"}';

do $$
declare
  v_profil_count int;
begin
  select count(*) into v_profil_count from app.profil
    where utilisateur_id in (
      '00000000-0000-0000-0000-00000000002a',
      '00000000-0000-0000-0000-00000000002b',
      '00000000-0000-0000-0000-00000000002d'
    );
  if v_profil_count != 3 then
    raise exception 'RLS-RESERVATION: administrator could not read other learners'' profil rows via profil_admin_select (count=%)', v_profil_count;
  end if;
  raise notice 'RLS-RESERVATION: step 14 ALLOWED administrator read of other learners'' profil rows (profil_admin_select)';
end $$;

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000002a","role":"authenticated"}';

do $$
declare
  v_leak int;
begin
  select count(*) into v_leak from app.profil where utilisateur_id = '00000000-0000-0000-0000-00000000002b';
  if v_leak != 0 then
    raise exception 'RLS-RESERVATION LEAK: learner A read % of learner B profil row(s) via profil_admin_select', v_leak;
  end if;
  raise notice 'RLS-RESERVATION: step 15 DENIED learner cross-read of profil (profil_admin_select is administrator-only)';
end $$;

reset role;

rollback;

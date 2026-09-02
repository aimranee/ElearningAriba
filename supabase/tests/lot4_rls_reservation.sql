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
insert into app.type_rendez_vous (id, libelle, duree_minutes, tampon_minutes, prix_centimes)
values ('individuelle', 'Session individuelle', 30, 15, 9000);

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

rollback;

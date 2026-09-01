-- D-18 forbids a proof that only shows the passing case: learner A reading
-- their own row proves nothing about isolation. This file asserts REFUSALS —
-- cross-learner reads, cross-learner writes and self-escalation to
-- `administrator` must all be denied by the database, not by application
-- code. Local-only: it lives under supabase/tests/, never under
-- supabase/migrations/, and is never pushed.
--
-- Run with: psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/lot3_rls_isolation.sql
-- Single transaction, rolled back at the end so it leaves no data and can be
-- re-run at will.

begin;

-- 1. Seed two auth users as the superuser. The Task 1 trigger creates both
-- profile rows. One acces_support row and one demande_suppression row, both
-- owned by B.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  is_sso_user, is_anonymous, created_at, updated_at
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000000a',
   'authenticated', 'authenticated', 'learner-a@example.test', 'x',
   now(), '{}'::jsonb, '{}'::jsonb, false, false, now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000000b',
   'authenticated', 'authenticated', 'learner-b@example.test', 'x',
   now(), '{}'::jsonb, '{}'::jsonb, false, false, now(), now());

insert into app.acces_support (utilisateur_id, titre, chemin_fichier)
values ('00000000-0000-0000-0000-00000000000b', 'Support B', 'b/support.pdf');

insert into app.demande_suppression (utilisateur_id)
values ('00000000-0000-0000-0000-00000000000b');

-- 2. Control assertion (bypass path, superuser): B's rows demonstrably exist.
-- Guards against the whole proof passing because the data was never there.
do $$
begin
  if (select count(*) from app.profil where utilisateur_id = '00000000-0000-0000-0000-00000000000b') != 1 then
    raise exception 'control failed: learner B profile row missing';
  end if;
  if (select count(*) from app.acces_support where utilisateur_id = '00000000-0000-0000-0000-00000000000b') != 1 then
    raise exception 'control failed: learner B acces_support row missing';
  end if;
  if (select count(*) from app.demande_suppression where utilisateur_id = '00000000-0000-0000-0000-00000000000b') != 1 then
    raise exception 'control failed: learner B demande_suppression row missing';
  end if;
end $$;

-- 3. Switch identity: authenticated as learner A.
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

-- 4. Positive control: A can read exactly one profile row (their own).
-- Guards against a false green where everything is denied because the
-- harness itself is broken.
do $$
begin
  if (select count(*) from app.profil) != 1 then
    raise exception 'positive control failed: learner A cannot read their own profile row';
  end if;
end $$;

-- 5. Negative assertion 1 — horizontal read: A reads zero of B's profile rows.
do $$
declare
  leaked_count int;
begin
  select count(*) into leaked_count from app.profil where utilisateur_id = '00000000-0000-0000-0000-00000000000b';
  if leaked_count != 0 then
    raise exception 'RLS-ISOLATION LEAK: learner A read % of learner B profil row(s)', leaked_count;
  end if;
  raise notice 'RLS-ISOLATION: profil cross-read DENIED';
end $$;

-- 6. Negative assertion 2 — horizontal write: A cannot update or insert
-- against B's row.
do $$
declare
  updated_rows int;
  insert_raised boolean := false;
begin
  update app.profil set prenom = 'pirate' where utilisateur_id = '00000000-0000-0000-0000-00000000000b';
  get diagnostics updated_rows = row_count;
  if updated_rows != 0 then
    raise exception 'RLS-ISOLATION LEAK: learner A updated % of learner B profil row(s)', updated_rows;
  end if;

  begin
    insert into app.profil (utilisateur_id, email)
    values ('00000000-0000-0000-0000-00000000000b', 'forged@example.test');
  exception
    when others then
      insert_raised := true;
  end;

  if not insert_raised then
    raise exception 'RLS-ISOLATION LEAK: learner A inserted a profil row for learner B without refusal';
  end if;

  raise notice 'RLS-ISOLATION: profil cross-write DENIED';
end $$;

-- 7. Negative assertion 3 — vertical escalation: A cannot promote themself
-- to administrator (the withheld column grant, not the RLS predicate, is
-- what refuses it — expects SQLSTATE 42501).
do $$
declare
  escalation_raised boolean := false;
begin
  begin
    update app.profil set role = 'administrator' where utilisateur_id = '00000000-0000-0000-0000-00000000000a';
  exception
    when insufficient_privilege then
      escalation_raised := true;
  end;

  if not escalation_raised then
    raise exception 'RLS-ISOLATION LEAK: learner A escalated their own role to administrator';
  end if;

  raise notice 'RLS-ISOLATION: role escalation DENIED';
end $$;

-- 8. Negative assertion 4 — the other two tables: A reads zero of B's rows,
-- while both demonstrably hold one row owned by B (proven in step 2).
do $$
declare
  leaked_support int;
  leaked_suppression int;
begin
  select count(*) into leaked_support from app.acces_support where utilisateur_id = '00000000-0000-0000-0000-00000000000b';
  select count(*) into leaked_suppression from app.demande_suppression where utilisateur_id = '00000000-0000-0000-0000-00000000000b';
  if leaked_support != 0 or leaked_suppression != 0 then
    raise exception 'RLS-ISOLATION LEAK: learner A read % acces_support and % demande_suppression row(s) owned by learner B', leaked_support, leaked_suppression;
  end if;
  raise notice 'RLS-ISOLATION: acces_support and demande_suppression cross-read DENIED';
end $$;

rollback;

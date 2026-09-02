-- AGD-07, D-17: Easter computus and the seeded holiday calendar. Local-only:
-- lives under supabase/tests/, never under supabase/migrations/, and is
-- never pushed. Runs against the SEEDED database -- run `npm run agenda:seed`
-- first (steps 4-6 assert against rows scripts/seed-agenda.mjs writes).
--
-- Run with: docker exec -i supabase_db_ElearningAriba psql -U postgres
-- -d postgres -v ON_ERROR_STOP=1 -f - < supabase/tests/lot4_feries.sql
-- Single transaction, rolled back at the end so it leaves no data and can be
-- re-run at will.

begin;

-- 1. app.paques computus, verified against the five known dates in
-- 04-RESEARCH.md Pattern 9.
do $$
begin
  if app.paques(2024) != '2024-03-31' then
    raise exception 'FERIES: step 1 -- paques(2024) returned %, expected 2024-03-31', app.paques(2024);
  end if;
  if app.paques(2025) != '2025-04-20' then
    raise exception 'FERIES: step 1 -- paques(2025) returned %, expected 2025-04-20', app.paques(2025);
  end if;
  if app.paques(2026) != '2026-04-05' then
    raise exception 'FERIES: step 1 -- paques(2026) returned %, expected 2026-04-05', app.paques(2026);
  end if;
  if app.paques(2027) != '2027-03-28' then
    raise exception 'FERIES: step 1 -- paques(2027) returned %, expected 2027-03-28', app.paques(2027);
  end if;
  if app.paques(2028) != '2028-04-16' then
    raise exception 'FERIES: step 1 -- paques(2028) returned %, expected 2028-04-16', app.paques(2028);
  end if;
  raise notice 'FERIES: step 1 OK, paques(2024..2028) = 2024-03-31, 2025-04-20, 2026-04-05, 2027-03-28, 2028-04-16';
end $$;

-- 2. The three derived feasts for 2026.
do $$
declare
  v_paques date := app.paques(2026);
begin
  if v_paques + 1 != '2026-04-06' then
    raise exception 'FERIES: step 2 -- Lundi de Paques 2026 was %, expected 2026-04-06', v_paques + 1;
  end if;
  if v_paques + 39 != '2026-05-14' then
    raise exception 'FERIES: step 2 -- Ascension 2026 was %, expected 2026-05-14', v_paques + 39;
  end if;
  if v_paques + 50 != '2026-05-25' then
    raise exception 'FERIES: step 2 -- Lundi de Pentecote 2026 was %, expected 2026-05-25', v_paques + 50;
  end if;
  raise notice 'FERIES: step 2 OK, 2026 derived feasts: Lundi de Paques 2026-04-06, Ascension 2026-05-14, Lundi de Pentecote 2026-05-25';
end $$;

-- 3. Easter Sunday itself carries no motif = 'ferie' row.
do $$
declare
  v_paques date := app.paques(extract(year from current_date)::int);
begin
  if exists (select 1 from app.exception_agenda where motif = 'ferie' and jour = v_paques) then
    raise exception 'FERIES: step 3 -- Easter Sunday % is seeded as a ferie, and must not be', v_paques;
  end if;
  raise notice 'FERIES: step 3 OK, Easter Sunday % carries no ferie row', v_paques;
end $$;

-- 4. Eleven ferie rows for the current year, eleven for the next -- against
-- the seeded database (npm run agenda:seed must have been run first).
do $$
declare
  v_annee_courante int := extract(year from current_date)::int;
  v_compte_courant int;
  v_compte_suivant int;
begin
  select count(*) into v_compte_courant
  from app.exception_agenda
  where motif = 'ferie' and extract(year from jour) = v_annee_courante;

  select count(*) into v_compte_suivant
  from app.exception_agenda
  where motif = 'ferie' and extract(year from jour) = v_annee_courante + 1;

  if v_compte_courant != 11 then
    raise exception 'FERIES: step 4 -- % ferie row(s) for %, expected 11 (run npm run agenda:seed first)', v_compte_courant, v_annee_courante;
  end if;
  if v_compte_suivant != 11 then
    raise exception 'FERIES: step 4 -- % ferie row(s) for %, expected 11', v_compte_suivant, v_annee_courante + 1;
  end if;

  raise notice 'FERIES: step 4 OK, 11 ferie rows for % and 11 for %', v_annee_courante, v_annee_courante + 1;
end $$;

-- 5. Every motif = 'ferie' row has ouvert = false, a non-null libelle, and
-- null hours.
do $$
declare
  v_mauvais int;
begin
  select count(*) into v_mauvais
  from app.exception_agenda
  where motif = 'ferie'
    and (ouvert != false or libelle is null or heure_debut is not null or heure_fin is not null);

  if v_mauvais != 0 then
    raise exception 'FERIES: step 5 -- % ferie row(s) violate the ouvert=false/libelle-set/null-hours shape', v_mauvais;
  end if;
  raise notice 'FERIES: step 5 OK, every ferie row is ouvert=false with a libelle and null hours';
end $$;

-- 6. A ferie day yields zero rows from app.creneaux_libres even when a
-- weekly rule covers its weekday, and flipping ouvert to true makes
-- instants reappear (D-17's "closed by default, each date re-openable").
-- The target date is a fresh ferie-shaped row inserted by this step, not one
-- read from the ambient seed: the French calendar has no public holiday
-- inside the D-13 8-week booking horizon for large stretches of the year
-- (e.g. mid-July to All Saints), which would make this step vacuous on those
-- dates -- the row shape (motif='ferie', ouvert=false, null hours) is
-- identical to what scripts/seed-agenda.mjs writes, so this still exercises
-- the exact same production code path.
do $$
declare
  v_ferie date;
  v_isodow int;
  v_count_avant int;
  v_count_apres int;
begin
  select min(d) into v_ferie
  from generate_series(current_date + 5, current_date + 45, interval '1 day') d
  where extract(isodow from d) between 1 and 5
    and not exists (select 1 from app.exception_agenda e where e.jour = d::date);

  if v_ferie is null then
    raise exception 'FERIES: step 6 setup failed -- no free weekday found in the search window';
  end if;
  v_isodow := extract(isodow from v_ferie)::int;

  insert into app.type_rendez_vous (id, libelle, duree_minutes, tampon_minutes, prix_centimes)
  values ('individuelle', 'Session individuelle', 60, 15, 9000)
  on conflict (id) do nothing;

  insert into app.disponibilite_hebdomadaire (jour_semaine, heure_debut, heure_fin)
  values (v_isodow, '09:00', '17:00');

  insert into app.exception_agenda (jour, ouvert, motif, libelle, heure_debut, heure_fin)
  values (v_ferie, false, 'ferie', 'Jour ferie de test', null, null);

  select count(*) into v_count_avant from app.creneaux_libres('individuelle', v_ferie, v_ferie);
  if v_count_avant != 0 then
    raise exception 'FERIES: step 6 -- ferie day % yielded % instant(s) although motif=ferie/ouvert=false should close it', v_ferie, v_count_avant;
  end if;

  update app.exception_agenda set ouvert = true where motif = 'ferie' and jour = v_ferie;

  select count(*) into v_count_apres from app.creneaux_libres('individuelle', v_ferie, v_ferie);
  if v_count_apres = 0 then
    raise exception 'FERIES: step 6 -- flipping ouvert to true on % did not make instants reappear', v_ferie;
  end if;

  raise notice 'FERIES: step 6 OK, ferie day % closed by default (0 instants), reopened (% instant(s))', v_ferie, v_count_apres;
end $$;

rollback;

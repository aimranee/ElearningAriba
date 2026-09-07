-- AGD-08/AGD-09: the three admin-only gestures on an existing reservation —
-- move, cancel, book on a learner's behalf — plus the RLS policy an
-- administrator needs to read a learner's own profil row at export/read
-- time (plan 04-07's admin-queries.ts join). insert and update on
-- app.reservation stay withheld from authenticated, administrator included;
-- every write below goes through a security definer function that checks
-- app.est_administrateur() in its own body, never relying on the grant alone.
-- Strictly additive: creates objects only, no `alter` and no `drop` against
-- anything Lot 1-3 or the two prior Lot 4 migrations made.
-- Reversible with:
--   drop policy profil_admin_select on app.profil;
--   revoke execute on function app.deplacer_reservation(uuid, timestamptz) from authenticated;
--   revoke execute on function app.annuler_reservation(uuid) from authenticated;
--   revoke execute on function app.reserver_pour_apprenant(text, text, timestamptz, text) from authenticated;
--   drop function app.deplacer_reservation(uuid, timestamptz);
--   drop function app.annuler_reservation(uuid);
--   drop function app.reserver_pour_apprenant(text, text, timestamptz, text);

-- ============================================================================
-- app.deplacer_reservation — AGD-08 move
-- ============================================================================

create function app.deplacer_reservation(
  p_id    uuid,
  p_debut timestamptz
)
returns table (resultat text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_row  app.reservation%rowtype;
  v_type app.type_rendez_vous%rowtype;
  v_fin            timestamptz;
  v_fin_avec_tampon timestamptz;
begin
  -- why: the in-body check is the control, not the grant below — a definer
  -- function granted to authenticated is reachable by every learner.
  if not app.est_administrateur() then
    return query select 'non_autorise'::text; return;
  end if;

  select * into v_row from app.reservation where id = p_id;
  if not found then
    return query select 'introuvable'::text; return;
  end if;
  if v_row.statut = 'annulee' then
    return query select 'reservation_annulee'::text; return;
  end if;

  -- why: duration and buffer are re-derived from the row's own type_id,
  -- never from a parameter — the administrator moves the instant, not the
  -- appointment's shape.
  select * into v_type from app.type_rendez_vous where id = v_row.type_id;
  v_fin := p_debut + (v_type.duree_minutes * interval '1 minute');
  v_fin_avec_tampon := p_debut + ((v_type.duree_minutes + v_type.tampon_minutes) * interval '1 minute');

  begin
    update app.reservation
    set debut = p_debut,
        fin = v_fin,
        fin_avec_tampon = v_fin_avec_tampon,
        ics_sequence = ics_sequence + 1
    where id = p_id;
  exception
    when exclusion_violation then                 -- 23P01, AGD-05
      return query select 'creneau_indisponible'::text; return;
  end;

  -- D-27: the administrator outranks a stale hold on the instant they have
  -- just sold — delete any retention overlapping the new range so the slot
  -- does not stay hidden from every other visitor until it lapses on its own.
  delete from app.maintien_creneau
  where plage && tstzrange(p_debut, v_fin_avec_tampon, '[)');

  return query select 'ok'::text;
end;
$$;

comment on function app.deplacer_reservation(uuid, timestamptz) is 'AGD-08: moves an existing reservation to a new instant. Never re-derives the target against app.creneaux_libres — the administrator is explicitly allowed outside the published weekly rules and the D-13 window; the exclusion constraint remains the only hard limit.';

-- ============================================================================
-- app.annuler_reservation — AGD-08/AGD-09 cancel
-- ============================================================================

create function app.annuler_reservation(p_id uuid)
returns table (resultat text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_row app.reservation%rowtype;
begin
  if not app.est_administrateur() then
    return query select 'non_autorise'::text; return;
  end if;

  select * into v_row from app.reservation where id = p_id;
  if not found then
    return query select 'introuvable'::text; return;
  end if;
  if v_row.statut = 'annulee' then
    return query select 'deja_annulee'::text; return;
  end if;

  -- why: the partial exclusion predicate (where statut <> 'annulee') is what
  -- frees the slot the instant this write commits — the same release path
  -- AGD-09/Lot 7 needs.
  update app.reservation
  set statut = 'annulee',
      annulee_le = now(),
      ics_sequence = ics_sequence + 1
  where id = p_id;

  return query select 'ok'::text;
end;
$$;

comment on function app.annuler_reservation(uuid) is 'AGD-08/AGD-09: cancelling frees the slot through reservation_pas_de_chevauchement''s partial WHERE clause — no separate release step exists or is needed.';

-- ============================================================================
-- app.reserver_pour_apprenant — AGD-08/D-18 create on a learner's behalf
-- ============================================================================

create function app.reserver_pour_apprenant(
  p_email   text,
  p_type_id text,
  p_debut   timestamptz,
  p_lieu    text
)
returns table (resultat text, reservation_id uuid)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid   uuid;
  v_type  app.type_rendez_vous%rowtype;
  v_id    uuid;
  v_fin_avec_tampon timestamptz;
begin
  if not app.est_administrateur() then
    return query select 'non_autorise'::text, null::uuid; return;
  end if;

  -- D-18: resolves an existing account only — no account is ever created
  -- from the back-office. auth.users, not app.profil, is authoritative for
  -- "does this email have an account".
  select id into v_uid from auth.users where email = p_email;
  if v_uid is null then
    return query select 'apprenant_introuvable'::text, null::uuid; return;
  end if;

  select * into v_type from app.type_rendez_vous where id = p_type_id and actif;
  if not found then
    return query select 'type_inconnu'::text, null::uuid; return;
  end if;

  v_fin_avec_tampon := p_debut + ((v_type.duree_minutes + v_type.tampon_minutes) * interval '1 minute');

  begin
    insert into app.reservation (
      utilisateur_id, type_id, debut, fin, fin_avec_tampon, lieu, ics_uid
    ) values (
      v_uid, p_type_id, p_debut,
      p_debut + (v_type.duree_minutes * interval '1 minute'),
      v_fin_avec_tampon,
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

  -- D-27, same reasoning as app.deplacer_reservation above.
  delete from app.maintien_creneau
  where plage && tstzrange(p_debut, v_fin_avec_tampon, '[)');

  return query select 'ok'::text, v_id;
end;
$$;

comment on function app.reserver_pour_apprenant(text, text, timestamptz, text) is 'AGD-08/D-18: resolves an existing account by email; creates nothing when no account matches. statut and paiement_requis stay at their column defaults, same as app.reserver_creneau.';

-- ============================================================================
-- Grants — belong with the functions they create, not the earlier grants
-- migration. No insert/update on app.reservation is granted anywhere here.
-- ============================================================================

revoke execute on function app.deplacer_reservation(uuid, timestamptz) from public;
revoke execute on function app.annuler_reservation(uuid) from public;
revoke execute on function app.reserver_pour_apprenant(text, text, timestamptz, text) from public;

grant execute on function app.deplacer_reservation(uuid, timestamptz) to authenticated;
grant execute on function app.annuler_reservation(uuid) to authenticated;
grant execute on function app.reserver_pour_apprenant(text, text, timestamptz, text) to authenticated;

revoke execute on function app.deplacer_reservation(uuid, timestamptz) from anon;
revoke execute on function app.annuler_reservation(uuid) from anon;
revoke execute on function app.reserver_pour_apprenant(text, text, timestamptz, text) from anon;

-- ============================================================================
-- app.profil — the read-time join this plan's admin-queries.ts needs
-- ============================================================================

-- why: Lot 3 shipped only profil_self_select (no admin surface existed yet).
-- src/lib/agenda/admin-queries.ts joins app.profil at read time to render
-- the reservation's learner name/email, "compte supprime" when
-- utilisateur_id is null (D-08) — without this policy an administrator's
-- session could read only their OWN profil row via RLS, so every OTHER
-- learner's reservation would render as "compte supprime" even though the
-- account still exists. select on app.profil is already granted to
-- authenticated (20260831161000_lot3_grants.sql); only the missing policy
-- is added here, mirroring the reservation_admin_all / dispo_admin_all
-- pattern already established by the first Lot 4 migration.
create policy profil_admin_select on app.profil
  for select to authenticated using (app.est_administrateur());

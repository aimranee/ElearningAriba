-- Bugfix (plan 04-02, Rule 1): app.creneaux_libres bounded the D-13 8-week
-- horizon only at day granularity (the last generated calendar day is
-- now()+8weeks's date in Europe/Paris), with no filter on the instant
-- itself. A carrier day whose slots run into the afternoon can therefore
-- return an instant up to ~24h past the exact now()+8weeks mark -- caught by
-- supabase/tests/lot4_creneaux_libres.sql step 4 (this plan's own D-13
-- horizon proof). The 24-hour notice already filters the instant precisely
-- (`pas.debut >= now() + interval '24 hours'`); this migration adds the
-- symmetric upper bound so the must_haves truth "nothing beyond 8 weeks"
-- holds to the instant, not just to the day. create or replace, not an edit
-- of the already-applied migration file -- strictly additive.
-- Reversible with:
--   (re-apply 20260901180000_lot4_agenda.sql's original app.creneaux_libres body)

create or replace function app.creneaux_libres(
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
      least(p_au,  ((now() + interval '8 weeks') at time zone 'Europe/Paris')::date),   -- D-13 horizon (day granularity for the day-generation cutoff)
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
    and pas.debut <= now() + interval '8 weeks'                        -- D-13 horizon, to the instant
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

comment on function app.creneaux_libres(text, date, date, uuid) is 'AGD-02/D-02/D-23: returns only free instants, never a per-day status enum, which would publish the trainer''s activity volume. security definer because it anti-joins app.reservation, which anon must never SELECT directly. D-13 horizon bounded to the instant (20260902091000 fix), not only to the day.';

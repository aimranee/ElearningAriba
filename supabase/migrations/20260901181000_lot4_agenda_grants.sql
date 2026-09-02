-- RLS confers no table privilege by itself (the same lesson Lot 3's grants
-- migration and 20260830093000_grant_service_role_content.sql recorded).
-- Strictly additive: grants only, no `create`, `alter` or `drop` against
-- anything the prior migration made.
-- Reversible with:
--   revoke all on app.type_rendez_vous, app.disponibilite_hebdomadaire,
--     app.exception_agenda, app.reservation, app.maintien_creneau from service_role;
--   revoke execute on function app.purger_maintiens_expires() from service_role;
--   revoke execute on function app.liberer_creneau(uuid) from anon, authenticated;
--   revoke execute on function app.maintenir_creneau(text, timestamptz, uuid) from anon, authenticated;
--   revoke execute on function app.reserver_creneau(text, timestamptz, text, uuid) from authenticated;
--   revoke execute on function app.creneaux_libres(text, date, date, uuid) from anon, authenticated;
--   revoke update on app.type_rendez_vous from authenticated;
--   revoke insert, update, delete on app.disponibilite_hebdomadaire, app.exception_agenda from authenticated;
--   revoke select on app.reservation, app.disponibilite_hebdomadaire, app.exception_agenda from authenticated;
--   revoke select on app.type_rendez_vous from anon, authenticated;

-- app.type_rendez_vous is public reference data.
grant select on app.type_rendez_vous to anon, authenticated;

grant select on app.reservation, app.disponibilite_hebdomadaire, app.exception_agenda to authenticated;

-- why: RLS confers no table privilege, so without these three grants the
-- admin screens in plans 04-06/04-09 would be refused by a missing privilege
-- before dispo_admin_all / exception_admin_all / type_admin_update were ever
-- evaluated -- those policies would be dead letters. For these three tables
-- the privilege is granted broadly and the **policy** is the enforcing
-- layer (app.est_administrateur()). For app.reservation the opposite choice
-- is made below, because a learner writing that table directly would
-- pre-empt the Lot 7 seam. insert and delete on app.type_rendez_vous are
-- deliberately NOT granted and have no policy either -- AGD-03 configures
-- existing types, it does not create or destroy them.
grant insert, update, delete on app.disponibilite_hebdomadaire, app.exception_agenda to authenticated;
grant update on app.type_rendez_vous to authenticated;

grant all on app.type_rendez_vous, app.disponibilite_hebdomadaire, app.exception_agenda, app.reservation, app.maintien_creneau to service_role;

-- why: Postgres grants EXECUTE to PUBLIC by default on every new function --
-- revoking a privilege from a single role (below) does not remove a grant
-- every role still inherits through PUBLIC membership. Every new Lot 4
-- function is stripped from PUBLIC first, so each one's reachable role set
-- is exactly what this file grants explicitly, nothing more.
revoke execute on function app.est_administrateur() from public;
revoke execute on function app.paques(int) from public;
revoke execute on function app.creneaux_libres(text, date, date, uuid) from public;
revoke execute on function app.purger_maintiens_expires() from public;
revoke execute on function app.maintenir_creneau(text, timestamptz, uuid) from public;
revoke execute on function app.liberer_creneau(uuid) from public;
revoke execute on function app.reserver_creneau(text, timestamptz, text, uuid) from public;

grant execute on function app.creneaux_libres(text, date, date, uuid) to anon, authenticated;

grant execute on function app.reserver_creneau(text, timestamptz, text, uuid) to authenticated;

-- D-27 retention grants, and the shape matters: a visitor chooses their slot
-- before identifying themselves (D-28), so both must be reachable by anon.
grant execute on function app.maintenir_creneau(text, timestamptz, uuid) to anon, authenticated;
grant execute on function app.liberer_creneau(uuid) to anon, authenticated;

-- called only from inside app.maintenir_creneau / app.reserver_creneau -- no
-- client needs it, and exposing a bulk delete to anon would be gratuitous.
grant execute on function app.purger_maintiens_expires() to service_role;

-- why: combined with app.maintien_creneau's deliberate absence of any RLS
-- policy, granting NO table privilege here is what makes the three RPCs the
-- only reachable path and stops a visitor reading which slots are held or
-- by whom -- the activity signal D-23 exists to withhold. No grant statement
-- for anon or authenticated appears against app.maintien_creneau anywhere in
-- this file, deliberately.

-- why: the security definer RPC is the only writer of app.reservation --
-- the RLS with check predicate alone would let a learner write
-- paiement_requis = false or statut = 'confirmee' directly and pre-empt the
-- Lot 7 seam. Same control lot3_grants.sql:18-31 applied by withholding the
-- role column privilege. insert and update on app.reservation are
-- deliberately NOT granted to authenticated anywhere in this file.

-- grant usage on schema app to anon; -- already granted, 20260830090000_public_content.sql:102

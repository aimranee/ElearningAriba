-- RLS confers no table privilege by itself (the same lesson
-- 20260830093000_grant_service_role_content.sql recorded for the content
-- tables). Strictly additive: grants only, no `create`, `alter` or `drop`
-- against anything the prior migration made.
-- Reversible with:
--   revoke all on app.profil, app.acces_support, app.demande_suppression from service_role;
--   revoke update (prenom, nom, telephone, profil_professionnel, preference_rappels, preference_actualites) on app.profil from authenticated;
--   revoke insert on app.demande_suppression from authenticated;
--   revoke select on app.profil, app.acces_support, app.demande_suppression from authenticated;
--   revoke usage on schema app from authenticated;

grant usage on schema app to authenticated;

grant select on app.profil, app.acces_support, app.demande_suppression to authenticated;

grant insert on app.demande_suppression to authenticated;

-- why: this column list is the vertical-privilege-escalation control for
-- CPT-08/D-09. The RLS `using` predicate on profil_self_update alone would
-- let a learner run `update app.profil set role = 'administrator' where
-- utilisateur_id = auth.uid()` on their own row — withholding the column
-- privilege on `role` (and `email`, `utilisateur_id`, `created_at`,
-- `updated_at`) is what refuses it.
grant update (
  prenom,
  nom,
  telephone,
  profil_professionnel,
  preference_rappels,
  preference_actualites
) on app.profil to authenticated;

grant all on app.profil, app.acces_support, app.demande_suppression to service_role;

-- Bugfix (plan 04-02, Rule 1): 20260901181000_lot4_agenda_grants.sql revokes
-- EXECUTE on app.paques(int) from PUBLIC (line 45) but never re-grants it to
-- any role. app.paques is the D-17 computus scripts/seed-agenda.mjs calls via
-- .rpc("paques", { annee }) to derive Lundi de Paques/Ascension/Lundi de
-- Pentecote -- without this grant the seed fails "permission denied for
-- function paques" under service_role, which bypasses RLS but not function
-- EXECUTE grants. Strictly additive: one grant, nothing else touched.
-- Reversible with:
--   revoke execute on function app.paques(int) from service_role;

grant execute on function app.paques(int) to service_role;

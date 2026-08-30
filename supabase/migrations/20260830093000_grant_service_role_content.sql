-- Task 3 (02-02) discovered the content seed cannot write through
-- SUPABASE_SERVICE_ROLE_KEY: `service_role` bypasses RLS but still needs an
-- explicit schema-level grant on any schema outside `public`. The prior
-- migration (20260830090000) granted `usage` and table privileges only to
-- `anon` (D-28's read/insert-only policy) and never touched `service_role`.
-- Strictly additive: grants only, no `alter` and no `drop` against anything
-- the prior migration made (D-26).
-- Reversible with:
--   revoke all on app.content_section, app.content_item, app.contact_message from service_role;
--   revoke usage on schema app from service_role;

grant usage on schema app to service_role;
grant all on app.content_section, app.content_item, app.contact_message to service_role;

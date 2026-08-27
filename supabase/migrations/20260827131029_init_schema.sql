-- Proves the migration mechanism end to end before any real schema depends on it:
-- created, applied locally with `supabase db reset`, and its effect observed in
-- the running database. Reversible with a single `drop schema app cascade;`.
-- No domain table is created here — Lot 3 and later lots own the schema.

create schema if not exists app;

comment on schema app is 'Namespace later lots place their objects in.';

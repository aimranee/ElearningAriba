-- Local-only seed, NOT a migration — deliberately outside supabase/migrations/
-- so it is never picked up by `supabase db push` and never reaches a hosted
-- project. `CPT-07` has no source of entitlement in Lot 3 because enrolment
-- is Lot 6 (D-05); these two rows exist purely so the signed-URL mechanism
-- (src/lib/documents/signed-url.ts, src/app/api/documents/[id]/route.ts) can
-- be exercised and verified before Lot 6 supplies real entitlement.
-- Idempotent — safe to re-run: `on conflict (utilisateur_id, chemin_fichier)
-- do nothing` leaves exactly two rows for the target learner after any
-- number of runs.
--
-- Usage (against the local stack only) — learner_email is unquoted, `:'var'`
-- below is what quotes it as a SQL literal:
--   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
--     -v learner_email=camille@example.test \
--     -f supabase/seed/lot3_acces_support_local.sql
--
-- A grant row pointing at a missing storage object proves nothing — place
-- the two matching PDF objects into the private `supports` bucket first,
-- e.g. with the Supabase CLI's storage commands (or the equivalent local
-- API calls):
--   npx supabase storage cp ./local-fixtures/support-1.pdf \
--     ss:///supports/lot3-demo/support-1.pdf --experimental
--   npx supabase storage cp ./local-fixtures/support-2.pdf \
--     ss:///supports/lot3-demo/support-2.pdf --experimental
--
-- Reversible with: delete from app.acces_support where chemin_fichier like 'lot3-demo/%';

with cible as (
  select utilisateur_id
  from app.profil
  where email = :'learner_email'
)
insert into app.acces_support (utilisateur_id, titre, chemin_fichier, octets)
select utilisateur_id, 'Support de formation — Module 1', 'lot3-demo/support-module-1.pdf', 482304
from cible
union all
select utilisateur_id, 'Support de formation — Module 2', 'lot3-demo/support-module-2.pdf', 519168
from cible
on conflict (utilisateur_id, chemin_fichier) do nothing;

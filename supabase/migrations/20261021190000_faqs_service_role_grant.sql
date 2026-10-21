-- 2026-10-30 Supabase change: new public tables no longer get automatic Data API grants.
-- public.faqs is written by the server-only admin client (secret key = service_role).
-- Grant it explicitly so new projects, preview branches and `supabase db reset` keep admin FAQ CRUD working.
-- Idempotent: the live project already has these privileges.
grant select, insert, update, delete on table public.faqs to service_role;

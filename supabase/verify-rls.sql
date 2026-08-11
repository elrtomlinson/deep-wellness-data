-- Run this in the Supabase SQL editor (or via `supabase db execute`) before
-- shipping any schema change. Every query below should return ZERO rows.
-- Any row is a table or view that the public anon key can reach.

-- 1. Tables in an exposed schema with Row Level Security disabled.
--    Each row here is fully readable AND writable by anyone holding the anon
--    key, which is published in the browser bundle.
select
  n.nspname as schema,
  c.relname as table_name,
  'RLS DISABLED' as problem
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'r'
  and n.nspname in ('public', 'storage')
  and not c.relrowsecurity;

-- 2. Tables with RLS enabled but no policies at all.
--    These deny everything, which is safe but usually means the feature is
--    silently broken rather than intentionally locked.
select
  n.nspname as schema,
  c.relname as table_name,
  'RLS ENABLED, NO POLICIES' as problem
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'r'
  and n.nspname = 'public'
  and c.relrowsecurity
  and not exists (
    select 1 from pg_policy p where p.polrelid = c.oid
  );

-- 3. UPDATE policies missing a WITH CHECK clause.
--    Without it, a user can update their own row and reassign it to another
--    user by changing user_id.
select
  n.nspname as schema,
  c.relname as table_name,
  p.polname as policy,
  'UPDATE POLICY MISSING WITH CHECK' as problem
from pg_policy p
join pg_class c on c.oid = p.polrelid
join pg_namespace n on n.oid = c.relnamespace
where p.polcmd = 'w'
  and p.polwithcheck is null;

-- 4. Views that run as their owner and therefore bypass RLS.
select
  n.nspname as schema,
  c.relname as view_name,
  'VIEW WITHOUT security_invoker' as problem
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'v'
  and n.nspname = 'public'
  and coalesce(
    (select option_value
     from pg_options_to_table(c.reloptions)
     where option_name = 'security_invoker'),
    'false'
  ) <> 'true';

-- 5. SECURITY DEFINER functions without a pinned search_path.
--    These run as the owner and are a privilege-escalation path.
select
  n.nspname as schema,
  p.proname as function_name,
  'SECURITY DEFINER WITHOUT search_path' as problem
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.prosecdef
  and n.nspname = 'public'
  and not exists (
    select 1 from unnest(coalesce(p.proconfig, '{}')) cfg
    where cfg like 'search_path=%'
  );

# Supabase migrations

**There are currently no tables.** The `public` schema is empty and the Supabase
client in `src/integrations/supabase/client.ts` is unused — all app data lives
client-side in localStorage and IndexedDB.

This directory exists so that the first table ever created arrives as a reviewed,
version-controlled migration rather than a dashboard click. That distinction is
the whole ballgame: the failure pattern behind the large-scale Supabase data
exposures is a table created outside version control, shipped with Row Level
Security left off, and read straight out of the public anon key that is already
in the browser bundle.

## The rule

Every migration that creates a table must, in the same file:

1. `alter table ... enable row level security;`
2. Declare explicit policies for each operation the app actually needs.

Enabling RLS with no policies denies everything. That is the correct starting
point — open it up one operation at a time.

## Template

```sql
create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  logged_on date not null,
  created_at timestamptz not null default now()
);

alter table public.daily_logs enable row level security;

create policy "owners read own logs"
  on public.daily_logs for select
  using (auth.uid() = user_id);

create policy "owners insert own logs"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

-- UPDATE needs BOTH clauses. `using` picks which rows are targetable;
-- `with check` constrains what they may become. Without `with check`,
-- a user can reassign their row to somebody else's user_id.
create policy "owners update own logs"
  on public.daily_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owners delete own logs"
  on public.daily_logs for delete
  using (auth.uid() = user_id);
```

## Before merging any schema change

- Run `supabase/verify-rls.sql` against the project and confirm zero rows.
- Run the Supabase security advisors and resolve every finding.
- Confirm no `service_role` key appears anywhere under `src/`.

## Other traps

- Views bypass RLS unless created `with (security_invoker = true)`.
- `SECURITY DEFINER` functions bypass RLS; set an explicit `search_path` and
  justify each one in a comment.
- `raw_user_meta_data` is user-editable — never authorize against it.

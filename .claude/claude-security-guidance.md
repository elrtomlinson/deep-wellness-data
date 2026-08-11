# Security guidance for deep-wellness-data

This app tracks chronic-illness symptoms, medications, conditions, and journal
entries. Treat everything it stores as sensitive health data, even though the
app is not a covered entity under HIPAA. The blast radius of a leak here is a
person's medical history.

## Current architecture (read this before assuming a backend exists)

All user data currently lives **client-side only**, in `localStorage` and
IndexedDB (`src/hooks/useLocalStorage.ts`, `src/hooks/useIndexedDB.ts`). The
Supabase client in `src/integrations/supabase/client.ts` is wired up but
**unused** — the `public` schema has no tables. There is no server, no auth, and
no multi-user data today.

That means the current risk is local (shared devices, XSS reading storage,
third-party scripts), not server-side. The rules below cover both the code as it
stands and the moment a backend is introduced.

## Supabase rules — apply the moment the first table is created

The single most common way apps in this class get breached is a table shipped
without Row Level Security, read via the public anon key. Assume any table you
create is internet-facing.

- Every `create table` MUST be followed by `alter table ... enable row level
  security;` and explicit policies **in the same migration**. A table with RLS
  off is fully readable and writable by anyone with the anon key and the project
  URL, both of which are in the public JS bundle.
- Enabling RLS with no policies denies all access. That is the correct default —
  add policies deliberately, one operation at a time.
- `UPDATE` policies need **both** `using` (which rows can be targeted) and
  `with check` (what they may become). With only `using`, a user can reassign a
  row to another user.
- Views bypass RLS unless created `with (security_invoker = true)`.
- `SECURITY DEFINER` functions run as their owner and bypass RLS. Justify each
  one in a comment, and always set an explicit `search_path`.
- Never authorize off `raw_user_meta_data` — users can edit it directly. Use a
  separate roles table protected by RLS.
- The `service_role` key bypasses RLS completely. It belongs only in Edge
  Functions, never in `src/`, never in a `VITE_` variable.
- Run the Supabase security advisors after every schema change and resolve
  findings before merging.

## Client-side secrets

- Anything prefixed `VITE_` is inlined into the public bundle at build time.
  Only the project URL and the publishable/anon key may carry that prefix.
- `.env` is gitignored and must stay that way. Add new variables to
  `.env.example` with placeholder values instead.

## Health data handling

- Do not log symptom values, medication names, condition names, journal text, or
  any user identifier to the console or to an error reporter. Strip to counts
  and IDs before logging.
- PDF and report exports (`jspdf`) must be generated in-browser and never
  uploaded anywhere without an explicit user action.
- If analytics or error tracking is added, scrub the payload — route names are
  fine, route params and form values are not.

## Web application basics

- Render user-controlled strings as text. No `dangerouslySetInnerHTML`,
  `.innerHTML =`, or `document.write` on user data.
- Validate all imported data (file uploads, pasted JSON, URL params) with the
  existing `zod` schemas before it reaches storage or state.
- Keep `localStorage` reads defensive: parse failures must not crash the app or
  silently wipe a user's history.

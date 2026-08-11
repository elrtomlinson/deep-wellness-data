# Scaffolding a new project

## The standing stack

| Layer | Choice |
|---|---|
| Runtime | Expo (managed workflow), current stable SDK |
| Routing | Expo Router — one `app/` directory becomes native stacks and web routes |
| Language | TypeScript, strict |
| Validation | zod |
| Styling | NativeWind (Tailwind syntax for React Native) |
| Components | React Native Reusables (shadcn/ui for RN — same names, same copy-in model) |
| Server (when needed) | Supabase: Postgres, Auth, RLS, Edge Functions |
| Session storage | AsyncStorage, with the key encrypted via `expo-secure-store` |
| Server state | TanStack Query |
| Unit tests | Jest via `jest-expo` |
| E2E | Maestro |
| Build and ship | EAS Build / Submit / Update |

Two notes that catch people out:

- **Playwright cannot drive a native app.** Maestro is the E2E tool here. If the
  project also ships web, Playwright is fine for the web target only.
- **Supabase sessions exceed `expo-secure-store`'s 2 KB limit.** Store the
  session in AsyncStorage or MMKV and keep only the encryption key in
  SecureStore. Do not try to put the session itself in SecureStore.

## Check the commands before running them

Do **not** trust remembered CLI invocations. The Expo and React Native Reusables
CLIs change between SDK releases, and a wrong flag wastes a scaffold.

Before running anything, check the current documented commands:

- Expo: `https://docs.expo.dev/more/create-expo/` and the latest SDK changelog
- NativeWind: its installation guide for the Expo + Expo Router path
- React Native Reusables: `https://reactnativereusables.com/docs`

Then run the official generators rather than hand-writing config. The shape is:

1. Create the Expo app with the default template (includes TypeScript and Expo
   Router).
2. Add NativeWind and its peer dependencies via `npx expo install`, so versions
   match the SDK. Never plain `npm install` for anything with a native
   component — `expo install` picks the version compatible with the SDK.
3. Initialise React Native Reusables, which sets up the Tailwind config, theme
   tokens, and the `components/ui` directory.
4. Add the remaining libraries: zod, TanStack Query, and Supabase only if the
   project needs a server.

If a generator fails, read its error and fix the cause. Do not fall back to
hand-writing what it would have generated — that config drifts and breaks at the
next SDK upgrade.

## Project layout

```
app/                    Expo Router routes; the file tree is the navigation
  _layout.tsx
  (tabs)/
components/
  ui/                   React Native Reusables components, copied in
lib/
  supabase.ts           only if the project has a server
hooks/
types/
docs/                   the documents from phase 2
supabase/
  migrations/           every table arrives here with RLS in the same file
.maestro/               E2E flows
```

## Tablet and large screen, from the start

Not a later polish pass. Apple rejects apps that render badly on iPad even when
`ios.supportsTablet` is false, and Android 17 ignores orientation and window
size locks on screens 600dp and wider — mandatory for all new apps and updates
by August 2027.

So:

- Set `ios.supportsTablet: true` in `app.json` from the first commit.
- Never lock orientation unless there is a real reason. Write it down if you do.
- Use NativeWind breakpoints for layout above 600dp rather than assuming phone
  width anywhere.
- Add a tablet device to the Maestro flows.

## Accessibility, from the start

- Tap targets: 44pt on iOS, 48dp on Android, minimum.
- Every interactive element gets an accessibility label.
- Support dynamic type — do not hardcode font sizes that ignore system settings.
- Honour reduced-motion.

## If the project needs a server

Supabase only. The rule that matters:

**Every `create table` ships with `alter table ... enable row level security`
and its policies in the same migration.** A table without RLS is readable and
writable by anyone holding the anon key, which is in the app bundle. This is the
single most common way apps in this class leak their entire database.

Also:
- `UPDATE` policies need both `USING` and `WITH CHECK`. With only `USING`, a
  user can reassign a row to someone else.
- Views bypass RLS unless created `with (security_invoker = true)`.
- The `service_role` key never appears in app code. Edge Functions only.
- Run the Supabase security advisors after every schema change.

If the project does **not** need a server, do not install the Supabase client
"for later". An unused client with a live key in the bundle is pure liability.
Add it the day it is needed.

# deep-wellness-data

A chronic-illness tracking PWA: daily symptom/medication logging, condition
management, correlation analysis, and exportable reports. Originally scaffolded
in Lovable, now developed in Claude Code.

## Stack

- **Vite 5** + **React 18** + **TypeScript** (strict-ish; see `tsconfig.app.json`)
- **Tailwind** + **shadcn/ui** (Radix primitives in `src/components/ui/`)
- **React Router 6** — routes declared in `src/App.tsx`
- **TanStack Query** — provider is mounted, but there is no server to query yet
- **zod** + **react-hook-form** for validation
- **Vitest** + Testing Library for unit tests, **Playwright** for e2e
- **Supabase** client is wired up but **unused** — no tables exist yet

## Data layer — important

There is no backend. All user data persists client-side via
`src/hooks/useLocalStorage.ts` and `src/hooks/useIndexedDB.ts`. `useHealthData`
is the main entry point for reads and writes.

Do not introduce Supabase queries without also adding the corresponding
migration with RLS policies. See `.claude/claude-security-guidance.md`.

## Commands

```bash
npm run dev          # dev server on :8080
npm run build        # production build
npm run lint         # eslint
npm test             # vitest run (unit)
npm run test:watch   # vitest watch
npm run test:e2e     # playwright
npx tsc --noEmit     # typecheck
```

## Definition of done

A change is not finished until all four pass:

1. `npx tsc --noEmit` — clean
2. `npm run lint` — clean
3. `npm test` — passing, and the change has a test that would fail without it
4. `npm run build` — succeeds

Never report work as complete without having actually run these. If a step is
skipped, say so explicitly.

## Conventions

- Path alias `@/` maps to `src/`.
- New UI composes existing shadcn primitives from `src/components/ui/` — do not
  add a new component library or hand-roll a control that already exists there.
- Feature components live in `src/components/`, routed pages in `src/pages/`,
  reusable logic in `src/hooks/`.
- Types shared across features go in `src/types/`.
- Tailwind design tokens are defined in `tailwind.config.ts` and `src/index.css`.
  Use the semantic tokens (`bg-background`, `text-muted-foreground`) rather than
  raw palette colors, so dark mode keeps working.
- This app is used by people with brain fog and fatigue. `BrainFogContext`
  exists to simplify the UI on demand — respect it in new screens, keep tap
  targets large, and avoid motion-heavy interactions.

## Working style

- Plan before implementing anything non-trivial. For a multi-step feature, write
  the plan first and get it agreed.
- Prefer editing existing files over adding new ones.
- Do not commit `.env`, build output, or generated Supabase types by hand —
  `src/integrations/supabase/types.ts` is generated.

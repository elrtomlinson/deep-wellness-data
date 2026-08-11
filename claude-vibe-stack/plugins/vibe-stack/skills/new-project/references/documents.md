# The document set

House style for all of them:

- Write for someone joining in three months who was not in the room.
- Short sentences. No marketing voice. No "seamlessly", "robust", "leverage".
- If something is undecided, write `**Undecided:** <the question>` rather than
  inventing an answer. Undecided is information; invention is damage.
- Every claim about a user should be traceable to the interview.

Scale to the project. A weekend tool needs `00-brief.md`, a screen list, and
`CLAUDE.md` — say so and skip the rest. A product with real users needs all of
it. Ask which this is if it is not obvious.

---

## `docs/00-brief.md`

One page maximum.

```markdown
# <App name>

<One sentence: what it is, for whom.>

## The problem
<What the user does today and why it's bad. Two or three sentences.>

## The solution
<What this app does about it. Not a feature list — the shape of the answer.>

## Primary user
<One concrete person. Their situation, not a demographic.>

## Success in three months
<Concrete and checkable.>

## Explicitly not doing
<The v1 boundary, as a list. This is the most important section.>
```

---

## `docs/01-prd.md`

```markdown
# Product requirements

## Users
<Each user type, what they're trying to achieve, and what they know already.>

## Jobs to be done
<"When <situation>, I want to <motivation>, so I can <outcome>." One per job.
Ordered by importance. The first one is the core loop.>

## Version one scope
<Numbered features. Each with a one-line description and an acceptance
criterion that can actually be checked.>

## Not in version one
<List. For each, one line on why not, so future-you doesn't re-argue it.>

## Open questions
<Things genuinely undecided. Keep this section alive as the project runs.>
```

Requirements must be checkable. "Logging should be fast" is not a requirement.
"A user can record a symptom entry in under 10 seconds from a cold app start"
is.

---

## `docs/02-design-direction.md`

```markdown
# Design direction

## Feel
<The emotional register, in a sentence, and what it rules out.>

## References
<The apps named in the interview, and specifically what to take from each.>

## Colour
<Semantic tokens, not raw palette: background, foreground, muted, primary,
destructive. Give light and dark values. State the contrast ratio target.>

## Type
<Font family, the scale, and what each step is for.>

## Spacing and density
<Base unit and how generous the layout is. A brain-fog or accessibility-first
app is deliberately sparse; a data tool is dense.>

## Motion
<How much, and where. Note any reduced-motion requirement.>

## Accessibility targets
<Minimum contrast, minimum tap target (44pt iOS / 48dp Android), dynamic type
support, screen reader expectations. These are commitments, not aspirations.>

## Tablet and large screen
<What changes at tablet width. Required — Apple rejects apps that render badly
on iPad, and Android 17 ignores orientation and size locks above 600dp.>
```

---

## `docs/03-wireframes.md`

Start with a complete screen inventory, then a low-fidelity layout for each.

Use fenced ASCII blocks for the layouts. They are readable in a terminal, they
diff cleanly in git, and they are fast to change — which matters, because these
will change.

```markdown
# Wireframes

## Screen inventory
| Screen | Route | Purpose | Entry point |
|---|---|---|---|

## <Screen name>
<One line on what the user is doing here.>

​```
┌─────────────────────────────┐
│ ← Title              [icon] │
├─────────────────────────────┤
│                             │
│  <content>                  │
│                             │
├─────────────────────────────┤
│  [ Primary action ]         │
└─────────────────────────────┘
​```

**States:** empty / loading / error / populated
**Tablet:** <what changes above 600dp>
```

Every screen needs its four states thought about. The empty state is the one
that gets forgotten and it is the first thing a new user sees.

---

## `docs/04-workflows.md`

The journeys that cross screens. Mermaid, because it renders on GitHub.

```markdown
# User workflows

## <Journey name>
<One line on when this happens.>

​```mermaid
flowchart TD
    A[Opens app] --> B{Logged in?}
    B -->|No| C[Sign in]
    B -->|Yes| D[Home]
​```

**Failure modes:** <what happens when it goes wrong — no network, denied
permission, empty data.>
```

Cover at minimum: first run and onboarding, the core loop, and one recovery
path such as losing data or being offline.

---

## `docs/05-tech-stack.md`

Record the standing stack plus the decisions specific to this project. Read
`scaffold.md` for the standing stack and copy the table.

The per-project section is what matters:

```markdown
## Decisions for this project
| Decision | Choice | Why |
|---|---|---|
| Server needed | <yes/no> | <reason from the interview> |
| Auth | <none / Supabase Auth> | |
| Local storage | <expo-sqlite / MMKV / AsyncStorage> | |
| Offline | <not needed / read-only / full sync> | |
| Sensitive data | <categories, or none> | |
| Web target | <shipped / not shipped> | |
```

---

## `docs/06-data-model.md`

Entities, their fields, relationships, and critically **where each lives** —
on device, on the server, or both.

If there is a server, every table gets an RLS policy specified here before any
migration is written. State the ownership column and the access rule for each
operation in plain language, then in SQL.

```markdown
## <Entity>
| Field | Type | Notes |
|---|---|---|

**Lives:** <device / server / synced>
**Owned by:** <user_id column, or n/a>
**Access:** <who can read, who can write, in plain language>
```

---

## `CLAUDE.md`

The operating manual for every future session. Not a summary of the docs — the
things Claude will get wrong without being told.

```markdown
# <Project name>

<One sentence.> See `docs/` for full context; start with `docs/00-brief.md`.

## Stack
<The table from 05-tech-stack.md.>

## Data layer
<Where data lives and the single entry point for reads and writes. Be explicit
about what does NOT exist yet — an unused client that looks wired up is how
people end up building against a backend that has no tables.>

## Commands
<Every command, with what it does.>

## Definition of done
A change is not finished until these pass:
1. `npm run typecheck`
2. `npm run lint`
3. `npm test` — with a test that would fail without the change
4. the app builds

Never report work as complete without running them. If a step is skipped, say so.

## Conventions
<Path aliases, where files go, token usage, component library rules.>

## This app's users
<Anything about the audience that constrains the UI. Accessibility needs,
context of use, constraints like one-handed operation or cognitive load.>
```

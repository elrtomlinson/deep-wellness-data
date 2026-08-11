# Integrations worth installing

Verified against the actual source repositories in August 2026, not against
aggregator sites. Re-check before recommending — this ecosystem moves, and
several entries below exist specifically because something that still ranks
well in search is archived or fake.

Recommend these to the user. Do not install them silently; MCP servers in
particular cost context on every turn.

## Anchor: the official Expo plugin

The single highest-value install for this stack.

```
/plugin install expo@claude-plugins-official
```

Published by Expo, listed in Anthropic's own marketplace, actively maintained.
Around 19 skills covering Expo Router, Expo UI, NativeWind setup, data
fetching, dev clients, SDK upgrades, and the EAS set: app store submission,
workflows, update insights, and simulator access.

Source: `github.com/expo/skills`

## React Native depth

| Install | What it adds | Publisher |
|---|---|---|
| `npx skills add callstackincubator/agent-skills --skill '*'` | Performance, navigation, React Native Testing Library, GitHub Actions CI, brownfield migration | Callstack — RN core contributors |
| `/plugin marketplace add software-mansion-labs/skills` | Reanimated, Gesture Handler, JSI, multithreading | Software Mansion — authors of Reanimated |

Callstack's testing and CI bundle covers ground the Expo plugin does not. Add
Software Mansion only if the project leans on gesture-driven or animated UI.

## Backend

```
npx skills add supabase/agent-skills --skill supabase -a claude-code
```

Official Supabase. Encodes the RLS traps that matter: policies, exposed
schemas, service-role handling, JWT claims, views, and `SECURITY DEFINER`
functions.

Pair it with the official Supabase MCP server for `get_advisors`, which lints
a live project for missing RLS. Run it after every schema change.

**Only install these when the project actually has a server.** Having Supabase
tooling loaded is a standing invitation to add Supabase calls to an app that
does not need them.

## Testing

**Maestro MCP ships inside the Maestro CLI.** Install Maestro, then run
`maestro mcp` and point your MCP config at it. It drives a real simulator or
emulator and can write and self-correct flows.

> The standalone `mobile-dev-inc/maestro-mcp` repository is **archived** and
> superseded, but still ranks highly in search and appears in aggregator
> listings. Do not install it. Likewise `luxury-labs/maestro-mcp` is an
> unaffiliated reimplementation with negligible adoption.

For the web target of a universal app, `chrome-devtools-mcp` (published by the
Chrome team) gives network, console, and performance inspection.

## Design

The official Figma MCP server reads design context — layers, variables, tokens,
auto-layout — and can write generated UI back as editable layers. **Code
Connect** maps real components to Figma nodes, and does support React Native,
so it is how you wire React Native Reusables components into a Figma design
system.

## Project workflow

Check what the machine already has before installing anything here.

`obra/superpowers` provides brainstorming, plan-writing, TDD, and systematic
debugging skills, and is widely used. It is **not** built into Claude Code —
if those skills are present, someone installed or synced them. On a fresh
machine they will not exist. Verify with `claude plugin list` and by checking
`~/.claude/skills/` before assuming either way.

GitHub's `spec-kit` offers heavier formal spec-driven artifacts. Worth it for a
team; usually too much process for a solo project.

## Known gaps

Do not go hunting for these — as of August 2026 they do not exist, and what
turns up claiming otherwise is not worth installing.

- **No Figma → React Native Reusables/NativeWind generator.** Code Connect maps
  components you have already built; nothing reliably generates idiomatic
  RNR + NativeWind markup from a frame. Expect to read design context and do
  the componentisation by hand.
- **No `jest-expo` mocking skill.** Native module and `expo-*` shim mocking is
  the thinnest spot in the whole toolchain. Budget real time for test setup.

## How to evaluate anything not on this list

The signal-to-noise ratio here is poor — one index tracked over 15,000 plugin
repositories in 2026, and much of what ranks is SEO reposting with fabricated
star counts and misattributed authorship.

Before recommending anything:

1. Open the actual GitHub repository. Check it is not archived.
2. Check the last commit date. Six months of silence on a fast-moving
   integration is a red flag.
3. Confirm the publisher. "In the official Anthropic marketplace" and "a
   person's repo named after a vendor" are very different things.
4. Prefer the vendor's own repo over any third-party wrapper of it.

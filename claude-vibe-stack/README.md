# vibe-stack

A Claude Code plugin marketplace for starting and running app projects.

Currently one plugin, `vibe-stack`, providing the `new-project` skill: it
interviews you about an idea, writes the project documentation set, scaffolds a
universal Expo app, and wires in the security and testing harness.

## Install

From the directory containing this folder:

```
/plugin marketplace add ./claude-vibe-stack
/plugin install vibe-stack@vibe-stack
```

Once this is pushed to its own repository, the first command becomes:

```
/plugin marketplace add <owner>/<repo>
```

Check the install summary — if it says `Run /reload-plugins to activate.`, run
that.

## Use

```
/vibe-stack:new-project
```

Or just describe an app you want to build; the skill's description should
trigger it.

## The stack it scaffolds

| Layer | Choice |
|---|---|
| Runtime | Expo, managed workflow, current stable SDK |
| Routing | Expo Router — one `app/` dir → native stacks and web routes |
| Language | TypeScript strict + zod |
| Styling | NativeWind |
| Components | React Native Reusables |
| Backend | Supabase (Postgres, Auth, RLS, Edge Functions) — only when needed |
| Server state | TanStack Query |
| Unit tests | Jest via `jest-expo` |
| E2E | Maestro |
| Ship | EAS Build / Submit / Update |

Native rather than a web wrapper because Apple's Guideline 4.2 enforcement makes
WebView-wrapped web apps close to un-shippable. Tablet layouts are treated as
mandatory, not polish: Apple rejects apps that render badly on iPad, and Android
17 removes orientation and window-size locks on large screens for all new apps
and updates by August 2027.

## What's in the plugin

```
plugins/vibe-stack/
└── skills/new-project/
    ├── SKILL.md              the phased process
    └── references/
        ├── intake.md         the interview
        ├── documents.md      structure and house style for each document
        ├── scaffold.md       the stack and how to set it up
        └── harness.md        security config, gitignore, CI
```

`SKILL.md` stays lean and loads the references as it needs them, so the skill
costs little context until it is actually running.

# vibe-stack

A private Claude Code plugin marketplace for starting and running app projects.

One plugin, `vibe-stack`, providing the `new-project` skill: it interviews you
about an idea, writes the project documentation set, scaffolds a universal Expo
app, and wires in the security and testing harness.

## Set up once, on each machine

Add the marketplace and install the plugin at **user scope**, so it is available
in every session regardless of which directory you start in. This matters —
`new-project` has to be loaded *before* the project exists.

```
/plugin marketplace add elrtomlinson/vibe-stack
/plugin install vibe-stack@vibe-stack
```

Choose **user scope** when prompted. If the install summary says
`Run /reload-plugins to activate.`, run that.

This repository is private, so adding the marketplace uses your local git
credentials. If the clone fails, check `gh auth status` or your SSH key.

### Or configure it declaratively

Equivalent, in `~/.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "vibe-stack": {
      "source": { "source": "github", "repo": "elrtomlinson/vibe-stack" },
      "autoUpdate": true
    }
  },
  "enabledPlugins": {
    "vibe-stack@vibe-stack": true
  }
}
```

`autoUpdate` keeps the plugin current as this repo changes.

### Cloud sessions

User-scoped plugins do not carry into Claude Code on the web, because those run
in a fresh container. For a cloud session, either add the marketplace at the
start of the session, or declare `enabledPlugins` in that project's checked-in
`.claude/settings.json`.

## Use

Start a session in an empty directory and either run the skill directly:

```
/vibe-stack:new-project
```

or just describe the app you want to build — the skill's description should
trigger it.

## What it does

Six rounds of intake, then documents in dependency order, gating on you between
each:

`00-brief` → `01-prd` → `02-design-direction` → `03-wireframes` →
`04-workflows` → `05-tech-stack` → `06-data-model` → `CLAUDE.md`

Then it scaffolds the app, installs the harness, and runs typecheck, lint,
tests and a build before claiming to be done.

The rule it holds to: **interview before writing.** A PRD invented from a
one-line prompt is fiction, and fiction in `docs/` gets treated as decided.

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

Native rather than a wrapped web app, because Apple's Guideline 4.2 enforcement
makes WebView-wrapped web apps close to un-shippable. Tablet layouts are
mandatory rather than polish: Apple rejects apps that render badly on iPad, and
Android 17 removes orientation and window-size locks on large screens for all
new apps and updates by August 2027.

## Layout

```
.claude-plugin/marketplace.json     the catalog
plugins/vibe-stack/
├── .claude-plugin/plugin.json
└── skills/new-project/
    ├── SKILL.md                    the phased process
    └── references/
        ├── intake.md               the interview
        ├── documents.md            structure and house style per document
        ├── scaffold.md             the stack and how to set it up
        ├── harness.md              security config, gitignore, CI
        └── integrations.md         verified plugins, skills and MCP servers
```

`SKILL.md` stays lean and loads references on demand: about 180 tokens of
always-on cost per session, ~1.6k only when the skill actually fires.

## Changing it

Edit, bump `version` in **both** `.claude-plugin/marketplace.json` and
`plugins/vibe-stack/.claude-plugin/plugin.json`, then push. Users only receive
updates when the version changes.

Test a change locally before pushing:

```
/plugin marketplace add ./path/to/this/repo
```

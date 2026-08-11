---
name: new-project
description: Start a new app project from nothing. Runs a structured intake interview, then produces the project documentation set (brief, PRD, design direction, wireframes, user workflows, tech stack, data model) and scaffolds a working universal Expo app with the security and testing harness pre-wired. Use when the user says "new project", "start a new app", "scaffold a project", "I have an idea for an app", "set up a new build", or describes an app they want to build that does not exist yet. Do NOT use for adding a feature to an existing project.
---

# Start a new project

You are taking an idea that currently exists only in someone's head and turning it
into a documented, scaffolded, running project. The output is a repository where
the next session can start building immediately without re-litigating what the
app is.

## The rule that makes this work

**Interview first. Do not generate documents from a one-line prompt.**

A PRD invented from "an app for tracking plants" is fiction, and fiction in
`docs/` is worse than no docs — it gets treated as decided. Every document you
write must trace back to something the user actually told you.

Work through the phases in order. Each phase gates the next. Never batch the
whole thing into one response and never write a document the user has not had a
chance to correct.

## Phase 0 — Check the ground

Before anything:

1. Confirm the working directory is empty or is a fresh repo. If there is an
   existing app here, stop and ask whether they want a new subdirectory or a
   different location.
2. Check whether `docs/` or `CLAUDE.md` already exist. If they do, this is not a
   new project — ask what they actually want.

## Phase 1 — Intake interview

Read `references/intake.md` and run the interview.

Ask questions in small batches, not all at once. Use the `AskUserQuestion` tool
where the answer is a genuine choice between options; use plain conversation
where the answer is prose. Follow up when an answer is vague — "everyone" is not
an audience and "it should be easy to use" is not a requirement.

Do not move on until you can state, in your own words and without hedging:

- who this is for and what they do instead today
- the single most important thing a user does in the app
- what is explicitly NOT in v1
- whether it needs a server, and why

If you cannot fill those four in, keep interviewing.

## Phase 2 — Write the documents

Read `references/documents.md` for the structure and house style of each file.

Write them in this order, because each depends on the one before. After each,
show the user what you wrote and ask for corrections before continuing:

| Order | File | Purpose |
|---|---|---|
| 1 | `docs/00-brief.md` | One page. What, who, why, what success looks like |
| 2 | `docs/01-prd.md` | Users, jobs to be done, v1 scope, explicit non-goals |
| 3 | `docs/02-design-direction.md` | Tone, references, colour and type tokens, accessibility targets |
| 4 | `docs/03-wireframes.md` | Screen inventory and low-fidelity layouts |
| 5 | `docs/04-workflows.md` | The main user journeys, as Mermaid diagrams |
| 6 | `docs/05-tech-stack.md` | The stack and the per-project decisions within it |
| 7 | `docs/06-data-model.md` | Entities, fields, relationships, and where they live |
| 8 | `CLAUDE.md` | The operating instructions for every future session |

If the user has a Figma MCP connection available, offer to push the wireframes
and design tokens into a Figma file once `docs/03-wireframes.md` is agreed. Do
not do it unasked — it creates a real document in their account.

## Phase 3 — Scaffold

Read `references/scaffold.md` and follow it.

That file describes the target stack and the shape of the setup. It deliberately
does **not** hardcode every command, because the Expo and React Native Reusables
CLIs change between SDK releases. Check the current documented commands before
running them, and prefer the official generator over hand-writing config.

## Phase 4 — Install the harness

Read `references/harness.md` and write the security and CI configuration,
adapting the security guidance to the data this specific app handles.

Then read `references/integrations.md` and tell the user which plugins, skills,
and MCP servers are worth adding for this project. Recommend; do not install
silently. MCP servers cost context on every turn, so only suggest the ones this
project will actually use.

## Phase 5 — Verify, then hand over

A project is not scaffolded until it runs. Actually run these and report real
output:

```bash
npm run typecheck
npm run lint
npm test
npx expo export --platform web   # proves the bundle builds
```

Then commit everything as a single initial commit and tell the user:

- what was created, in one short list
- anything you had to assume, called out explicitly
- the exact next command to run to see the app (`npx expo start`)
- what is deliberately not built yet

## Things that will make this go wrong

- **Writing docs nobody asked for.** If the user wants a weekend toy, a 12-page
  PRD is waste. Scale the documents to the ambition. Ask.
- **Inventing requirements to fill a template.** An empty section that says
  "not decided yet" is honest and useful. A confident paragraph of invented
  scope is neither.
- **Scaffolding before the docs are agreed.** The data model comes from the PRD.
  Building first means rewriting.
- **Claiming it works without running it.** Run the commands. Paste the results.

# The project harness

Guardrails that go in every project. Write these during phase 4, after the docs
exist, because the security guidance depends on knowing what data the app holds.

## `.claude/settings.json`

Enables the review plugins for everyone who opens the repo — including cloud
sessions, where user-scoped installs do not carry — and blocks the commands
that cause damage.

```json
{
  "enabledPlugins": {
    "security-guidance@claude-plugins-official": true,
    "typescript-lsp@claude-plugins-official": true
  },
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./**/*.pem)",
      "Read(./**/*.key)",
      "Bash(git push --force:*)",
      "Bash(git reset --hard:*)",
      "Bash(curl:* | sh)",
      "Bash(curl:* | bash)",
      "Bash(supabase db reset:*)"
    ],
    "ask": [
      "Bash(git push:*)",
      "Bash(eas submit:*)",
      "Bash(eas build:*)",
      "Bash(supabase db push:*)"
    ]
  }
}
```

`eas submit` is in `ask` deliberately — it pushes a binary to a real app store.

## `.claude/security-patterns.yaml`

Deterministic per-edit checks. No model call, so they cost nothing. Start from
this base and add rules specific to the app's data.

```yaml
patterns:
  - rule_name: service_role_clientside
    substrings: ["SUPABASE_SERVICE_ROLE", "service_role"]
    paths: ["**/app/**", "**/components/**", "**/lib/**", "**/hooks/**"]
    reminder: >-
      service_role bypasses RLS entirely and must never ship in app code.
      Move this to a Supabase Edge Function.

  - rule_name: public_env_secret
    regex: "EXPO_PUBLIC_[A-Z0-9_]*(SECRET|SERVICE|PRIVATE|PASSWORD|TOKEN)"
    reminder: >-
      EXPO_PUBLIC_ variables are embedded in the app bundle and readable by
      anyone who downloads it. This cannot hold a secret.

  - rule_name: hardcoded_credential
    substrings: ["sk_live_", "AKIA", "-----BEGIN PRIVATE KEY-----", "ghp_"]
    reminder: >-
      Hardcoded credential. Load from an environment variable and rotate this
      value if it was ever committed.

  - rule_name: table_without_rls
    regex: "create\\s+table"
    paths: ["**/supabase/migrations/**"]
    reminder: >-
      New tables need `enable row level security` and explicit policies in the
      SAME migration. UPDATE policies need both USING and WITH CHECK.

  - rule_name: view_without_security_invoker
    regex: "create\\s+(or\\s+replace\\s+)?view"
    paths: ["**/supabase/**"]
    reminder: >-
      Views bypass RLS unless created `with (security_invoker = true)`.

  - rule_name: session_in_securestore
    regex: "SecureStore\\.setItemAsync\\([^)]*session"
    reminder: >-
      expo-secure-store has a 2 KB limit and a Supabase session exceeds it.
      Store the session in AsyncStorage or MMKV and keep only the encryption
      key in SecureStore.
```

Note: the YAML form needs PyYAML importable by the plugin's Python. If the rules
never fire, write `security-patterns.json` instead — same schema, works
everywhere.

## `.claude/claude-security-guidance.md`

Prose threat model for the model-backed reviews. **Adapt this to the app.** The
sensitive-data answers from the interview drive it.

Always include:
- what data the app holds and where it lives
- what must never be logged
- the RLS rules, if there is a server
- what is safe to put in an `EXPO_PUBLIC_` variable (only the Supabase URL and
  anon key)

If the app handles a sensitive category — health, financial, location,
biometric, genetic, children's data, private messages — say so explicitly at the
top and state the handling rules. A reviewer that knows the data is medical
catches things a generic one will not.

## `.gitignore`

Beyond the Expo defaults, make sure these are present:

```
.env
.env.local
.env.*.local
CLAUDE-SECURITY-*/
.claude/settings.local.json
/maestro-debug-output/
```

Commit a `.env.example` with the keys and empty values, so the next person knows
what to fill in without a secret ever being tracked.

## CI

Two workflows.

**`ci.yml`** — on every PR: typecheck, lint, unit tests, and a bundle build
(`npx expo export`). Add a Maestro run once there are flows worth running; it
needs an emulator, so it belongs in its own job.

**`security-review.yml`** — `anthropics/claude-code-security-review` on every
PR. Gate it on the presence of `ANTHROPIC_API_KEY` so it skips cleanly rather
than failing every PR before the secret is set:

```yaml
- name: Check for API key
  id: check
  run: |
    if [ -n "${{ secrets.ANTHROPIC_API_KEY }}" ]; then
      echo "enabled=true" >> "$GITHUB_OUTPUT"
    else
      echo "enabled=false" >> "$GITHUB_OUTPUT"
      echo "::notice::ANTHROPIC_API_KEY not set - skipping security review."
    fi
```

## Recommended, not written by this skill

Tell the user these exist; do not install them silently.

```
/plugin install security-guidance@claude-plugins-official
/plugin install claude-security@claude-plugins-official
npx skills add supabase/agent-skills --skill supabase -a claude-code
```

The settings file enables the first two, but a plugin still has to be installed
once per machine.

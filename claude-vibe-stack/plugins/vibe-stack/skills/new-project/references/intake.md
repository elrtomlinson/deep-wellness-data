# Intake interview

The goal is not to fill in a form. It is to understand the app well enough that
every document you write afterwards is reporting, not inventing.

Ask in batches of two or three. Let the answers redirect you. If an answer opens
something more interesting than your next scripted question, follow it.

## Round 1 — What and who

1. **Describe the app in one sentence, as if to a friend.**
   If they can't, the idea isn't ready — help them find the sentence before
   going further.

2. **Who is this for?** Push past "anyone". Ask for one real person they have in
   mind. If the answer is "me", that is a perfectly good answer and it changes
   the recommendation — a personal tool needs no auth, no onboarding, no empty
   states for strangers.

3. **What do they do today instead?** Every app replaces something, even if that
   something is a notes app, a spreadsheet, or nothing. The alternative tells you
   what "better" has to mean.

## Round 2 — The core loop

4. **What is the single most important thing a user does?** One action. If they
   list five, ask which one, if broken, makes the app pointless.

5. **How often do they do it?** Many times a day, daily, weekly, and rarely are
   four completely different apps. This drives navigation, notifications, and
   whether speed of entry matters more than richness.

6. **What do they get back?** The payoff. If there isn't one, the app is a chore
   and people will stop using it in a fortnight.

## Round 3 — Boundaries

7. **What is explicitly NOT in version one?** Push for a real list. This is the
   most valuable answer in the whole interview and the one people most want to
   avoid giving.

8. **What does success look like in three months?** Concrete. "I still use it
   every day" is a great answer. "10,000 users" is a different app.

## Round 4 — Technical shape

Use `AskUserQuestion` for these — they are genuine multiple-choice.

9. **Does it need a server?** Determine this from answers, not by asking
   directly, then confirm. It needs a server if any of these are true:
   - more than one person has an account
   - the same person needs it on more than one device
   - data must survive losing the phone
   - it integrates with a third-party service needing a secret (OAuth, payments)
   - anything is shared between users

   If none are true, it is a local-only app. Say so, and say why — people often
   assume they need a backend when they do not.

10. **Does it need to work offline?** For most mobile apps the honest answer is
    yes, at least partially. This decides whether you need local-first storage
    with sync or can rely on the network.

11. **What is the platform priority?** Phone-first, tablet-first, or genuinely
    both. Note that tablet layouts are not optional — Apple rejects apps that
    render badly on iPad, and Android 17 removes the ability to lock orientation
    or window size on large screens. Both must at minimum be usable.

## Round 5 — Sensitive data

12. **Does the app touch any of these?** Health or medical data, financial
    details, precise location, biometric or genetic data, anything about
    children, private messages, government identifiers.

    If yes, this materially changes the design. Record which categories, because
    the security guidance and data model both depend on it, and local-only
    storage stops being a limitation and becomes a feature worth advertising.

## Round 6 — Design direction

13. **Name two or three apps whose feel you like.** Ask what specifically —
    the calm, the density, the speed, the typography. "I like Things 3" tells
    you more about the target than any adjective will.

14. **Any brand constraints?** Existing logo, colours, a name already chosen.

15. **What is the emotional register?** A tool used by someone in pain wants
    calm and low effort. A fitness app might want energy. A finance app wants to
    feel trustworthy and boring. This drives colour, motion, and copy.

## Closing check

Before leaving the interview, state back to the user:

- the one-sentence description, in your words
- the primary user and the one action that matters
- the v1 boundary
- whether it needs a server, and the reason
- any sensitive data categories

Ask them to correct anything wrong. Then start writing.

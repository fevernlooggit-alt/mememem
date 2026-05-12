# Module 1 — Intake & Classification

## Job
Take a raw new-requirement message (from ops, testing, or backend) and
turn it into a structured intake card.

## Required input
- `requirement_text`: the raw message, pasted verbatim
- `source`: who sent it (ops / testing / backend / other)
- Optional: `received_at` (defaults to now)

## Steps

1. Read the requirement text once, top to bottom. Do not skim.
2. Identify the **type** (pick one): bug, feature-request, data-fix,
   config-change, account-issue, content-update, ambiguous.
3. Identify the **affected surface** (pick all that apply): client,
   server, account-system, payment, push-notification, in-game-mail,
   localization, analytics, other.
4. Identify the **urgency** (pick one, using the anchors below):
   - **P0** — production is down or revenue is bleeding now
   - **P1** — a single major feature is broken for many users
   - **P2** — a feature is degraded or a minority is affected
   - **P3** — cosmetic, edge-case, or backlog
5. Identify the **dependencies** — what other team / system needs to be
   touched for this to resolve.
6. Identify the **open questions** — things the requester didn't say
   that you'd need before acting.

## Output template (write exactly this structure)

```
# Intake — <one-line title>

**Slug:** <kebab-case-slug>
**Source:** <ops | testing | backend | other> — <name if stated>
**Received:** <YYYY-MM-DD HH:MM>
**Type:** <bug | feature-request | data-fix | config-change | account-issue | content-update | ambiguous>
**Urgency:** <P0 | P1 | P2 | P3>
**Affected surfaces:** <comma-separated>

## Original message
<verbatim paste, in a blockquote>

## What is being asked
<2–4 sentences, plain language>

## Affected
- Players: <who / how many / which segment>
- Systems: <list>
- Revenue / KPI: <if implied>

## Dependencies
- <team or system> — <what they need to do>

## Open questions
- <question 1>
- <question 2>
- ...

## Suggested next action
<one action, one owner if obvious>
```

## Rules

- Do not classify as P0 unless the message explicitly says production
  is down, payments are failing, or a large number of users cannot log
  in. "Urgent" alone is not P0.
- If type is `ambiguous`, the "open questions" section must contain at
  least 3 questions.
- Never invent a player count or revenue impact. If unstated, write
  "not stated".
- Slug = first 4–6 words of the title, lowercased, hyphenated.

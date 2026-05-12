# Classification Taxonomy — for Module 1 (intake)

## Type

| Type | Definition | Examples |
|------|-----------|----------|
| **bug** | Something is broken vs. spec / prior behavior | crash, wrong number, missing UI |
| **feature-request** | New behavior that doesn't exist | "Add a confirm dialog before purchase" |
| **data-fix** | Correct or restore stored data | "Player X lost 500 gems after rollback" |
| **config-change** | Server-side config flip, no code change | "Enable double-XP weekend" |
| **account-issue** | Login, identity, store, payment | "Player can't log in with Google" |
| **content-update** | Copy, localization, asset swap | "Patch notes typo in French" |
| **ambiguous** | Can't tell from message alone | requires open questions |

If a message contains multiple types, pick the dominant one and list
the others under "Dependencies".

## Urgency anchors (hard rules)

| Level | Hard rule (one of) |
|-------|---------------------|
| **P0** | Production down / payments failing / mass login failure / data loss in progress |
| **P1** | A single major feature is broken for many users; revenue impact named |
| **P2** | A feature is degraded; minority of users affected; no revenue impact named |
| **P3** | Cosmetic, edge case, backlog candidate |

"Urgent" / "ASAP" / "today" in the message does NOT auto-upgrade
urgency. The hard rule must match.

## Affected surfaces — pick all

- **client** — game client (Android, iOS, PC)
- **server** — game server, backend logic
- **account-system** — login, identity, linking
- **payment** — IAP, store, billing
- **push-notification** — push, in-app messaging
- **in-game-mail** — mail system, attachments
- **localization** — text, language packs
- **analytics** — events, dashboards
- **other** — anything else (name it)

## Slug rules

- Lowercase, ASCII, hyphens only
- 4–6 words from the title
- No version numbers in slug (those go in title)
- Examples: `login-crash-ios-1-4-2`, `gem-rollback-player-12345`,
  `daily-quest-reward-doubled`

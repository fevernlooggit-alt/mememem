---
name: cs-intel-workflow
description: >-
  Personal customer-service intelligence workflow for a game operations
  context. Use when the user needs to (1) intake and classify a new
  requirement from operations, testing, or backend, (2) analyze content
  released by the game team (patch notes, test reports, announcements),
  (3) generate AI-bot rule update suggestions, (4) record or audit
  Google / iOS store account state and settings, or (5) produce a
  numerical / balance test report. Triggers on phrases like "new
  requirement came in", "game team published X — analyze", "update bot
  rules", "audit iOS / Google account", "run numbers test", or
  "wrap today's CS intel". Runs locally via Claude Code, writes
  every artifact to /outputs as dated markdown, and never silently
  drops a module — if input is missing for a module, it must explicitly
  state "SKIPPED — no input provided".
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
---

# CS Intel Workflow — Personal Aggregation Loop

## What this skill does

A single-operator workflow that takes raw inputs from a game operations
context (new requirements, game-team publications, account state dumps,
numerical change specs) and produces five categories of structured
markdown artifacts, all stored under `/outputs/<YYYY-MM-DD>/<module>/`.

It is **not** a team tool. It does not send notifications, does not
write to ticketing systems, does not call any third-party API. It reads
local files, runs the appropriate module prompt, and writes markdown.

## When to trigger

Trigger on any of:
- "New requirement: ..."
- "Game team just published ..."
- "Analyze this patch / test report / announcement"
- "Update bot rules based on ..."
- "Audit / log iOS / Google account state"
- "Run numerical test on ..."
- "Daily wrap" / "CS wrap"

Do NOT trigger for:
- Generic Claude Code coding requests with no CS / game-ops framing
- Pure translation requests
- Anything outside the five named modules

## Module map

| # | Module ID | Job-to-be-done | Output filename pattern |
|---|---|---|---|
| 1 | `intake` | Classify a new requirement | `01_intake_<slug>.md` |
| 2 | `gameteam` | Analyze game-team publication | `02_gameteam_<slug>.md` |
| 3 | `botrules` | Suggest bot rule updates | `03_botrules_<slug>.md` |
| 4 | `accounts` | Log / audit store account state | `04_accounts_<platform>.md` |
| 5 | `numbers` | Numerical test report | `05_numbers_<slug>.md` |

Each module has its own prompt file under `/prompts/<module>.md`. The
orchestrator picks the module by intent, never by guessing.

## Workflow (per invocation)

### Phase 0 — Route (1 turn, silent)

Read the user's request. Pick exactly one module, or "wrap" (all
modules, daily summary). If intent is ambiguous, ask ONE question with
≤ 4 options and stop. Never run two modules at once unless the user
said "wrap" or "run all".

### Phase 1 — Intake check (1 turn)

For the chosen module, verify required inputs are present:

| Module | Required input | If missing |
|---|---|---|
| intake | requirement text | ask user to paste it |
| gameteam | publication content + source label | ask for both |
| botrules | current rule set + trigger content | ask for missing piece |
| accounts | platform (iOS / Google) + state dump | ask which platform |
| numbers | baseline values + change spec + test scope | ask for missing piece |

Do not invent missing input. Do not run with "assume defaults".

### Phase 2 — Run module (1 turn)

Load `/prompts/<module>.md`. Execute its instructions. Produce the
output in the module's specified format.

### Phase 3 — Write artifact (1 turn)

Write to `/outputs/<YYYY-MM-DD>/<module>/<filename>.md`. If a file with
the same slug exists, append `_v2`, `_v3`, etc. — never overwrite.

Update `/outputs/<YYYY-MM-DD>/INDEX.md` with one line: timestamp,
module, slug, one-sentence summary.

### Phase 4 — Self-check (1 turn, silent unless fails)

For every module, verify:
- All required output sections present (per the module's template)
- No placeholder text remaining (`<TBD>`, `<FILL>`, `...`)
- Source / evidence labels present for every external claim
- For `numbers`: every formula spelled out, no "approximately" without a number range

If self-check fails, regenerate the failed sections (max 1 retry),
then report what was fixed. If still failing after retry, output the
artifact with a `## ⚠ SELF-CHECK FAILED` banner listing the gaps.

## Stop conditions

A single-module run stops when:
- Artifact written to `/outputs/...`
- INDEX.md updated
- Self-check passed OR clearly marked as failed

A "wrap" run stops when all five modules have either produced an
artifact or written `SKIPPED — no input provided` to a stub file.

Never loop. Never run more than one retry per module.

## Anti-failure rules

- **No silent skipping.** If a module has no input, write a stub file
  that says so. The user must be able to see at a glance what was and
  wasn't covered today.
- **No fabricated game-team content.** If a publication is summarized,
  every bullet must trace to a line in the source. If you cannot find
  the line, drop the bullet.
- **No bot rule auto-apply.** This skill only proposes rules. The user
  applies them manually elsewhere.
- **No account credentials in outputs.** Even if the user pastes them
  in, the artifact records "credential present, redacted" and never
  the value. Module 4 enforces this.
- **No "approximately X%" in numbers reports.** Either a number, a
  range, or "unknown — needs measurement".

## Output formats

Each module's template is in `/prompts/<module>.md`. The orchestrator
must use that template exactly, including section order.

### Daily INDEX.md format

```
# CS Intel — YYYY-MM-DD

| Time  | Module    | Slug                | Summary                                |
|-------|-----------|---------------------|----------------------------------------|
| 09:14 | intake    | login-crash-ios     | New P1: iOS login crash post-1.4.2     |
| 10:02 | gameteam  | patch-1-4-3-notes   | 14 changes, 3 player-facing            |
| 11:30 | botrules  | login-crash-faq     | 2 new FAQ rules proposed               |
| ...   | ...       | ...                 | ...                                    |
```

## Directory layout

```
cs-workflow/
├── skill/SKILL.md                # this file
├── prompts/
│   ├── intake.md                 # module 1
│   ├── gameteam.md               # module 2
│   ├── botrules.md               # module 3
│   ├── accounts.md               # module 4
│   ├── numbers.md                # module 5
│   └── wrap.md                   # daily wrap orchestrator
├── inputs/                       # user drops raw files here
├── outputs/<YYYY-MM-DD>/         # generated artifacts
├── references/
│   ├── classification_taxonomy.md
│   ├── bot_rule_format.md
│   └── numbers_test_checklist.md
└── scripts/
    └── run.sh                    # CLI entry: ./run.sh <module> <input>
```

## Operating rules

- Outputs are markdown only. No JSON, no HTML, no PDF.
- Filenames are lowercase, hyphen-separated, ASCII only.
- Dates are ISO (YYYY-MM-DD), times are 24h local.
- All five module prompts must be readable independently — no cross-
  module dependencies beyond the orchestrator.
- If the user pastes Chinese content, the artifact is written in
  Chinese. If English, English. Don't mix unless the source mixes.

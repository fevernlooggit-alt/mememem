# Module 3 — AI Bot Rule Update Suggestions

## Job
Given (a) what's changed in the game and (b) the current bot rule set,
propose specific, copy-pasteable rule updates. Do not apply them.

## Required input
- `trigger_content`: the change driving the update — usually a Module 2
  output, a Module 1 intake, or a raw publication
- `current_rules`: the current bot rule set, or a path to it. If the
  user has no current rules to share, ask. Don't proceed without.
- `bot_platform`: which bot (Intercom, Zendesk Answer Bot, Dialogflow,
  custom Claude/GPT prompt, other) — affects rule syntax

## Steps

1. Read trigger content. Extract every distinct player question or
   intent it implies. List them.
2. Read current rules. Map: which existing rules cover which intents.
3. For each intent **not** covered, propose a new rule.
4. For each intent **partly** covered, propose a rule edit (show
   before / after).
5. For each existing rule that is now **obsolete or contradicted** by
   the trigger content, propose retirement or rewrite.
6. Group proposals by priority: must-add (P0), should-add (P1), nice-
   to-add (P2).

## Output template

```
# Bot Rule Update Proposal — <trigger title>

**Slug:** <kebab>
**Trigger:** <source — e.g. patch-1-4-3 analysis>
**Bot platform:** <name>
**Current rules reviewed:** <N>
**Proposals:** <X new, Y edited, Z retired>

## Intent coverage map
| Intent | Covered by existing rule? | Action |
|--------|---------------------------|--------|
| <intent 1> | Rule #12 (partial) | EDIT |
| <intent 2> | No | ADD |
| <intent 3> | Rule #4 (full) | KEEP |
| <intent 4> | Rule #7 (contradicted) | RETIRE |

## P0 — must add before next CS shift

### Proposal A1 — ADD: <rule name>
- **Trigger phrases:** "<phrase 1>", "<phrase 2>", "<phrase 3>"
- **Bot response:**
  > <exact response text>
- **Escalation:** <when to hand off to a human>
- **Source justification:** <which line in the trigger content makes this needed>

### Proposal A2 — EDIT: rule #<id> "<rule name>"
- **Before:**
  > <current response>
- **After:**
  > <new response>
- **Why changed:** <1 sentence tied to the trigger>

## P1 — should add this week
<same format>

## P2 — nice to have
<same format>

## Retirement candidates
| Rule # | Name | Reason to retire | Replacement |
|--------|------|------------------|-------------|
| 7 | "Old login flow" | New flow as of patch 1.4.3 | Proposal A1 |

## Open decisions for the operator
- <thing only the human can decide — e.g. "Do we compensate players
  affected by the bug? Bot reply depends on this.">
```

## Rules

- Every proposal references a specific line in the trigger content. No
  free-floating rules.
- Bot responses are written in the voice / register of the existing
  rules. If the existing rules are formal Chinese, new ones are formal
  Chinese. If casual English, casual English.
- Never propose a rule that promises compensation, refunds, or
  remediation without the operator's explicit input. If a rule needs
  that, the proposal lists it under "Open decisions for the operator"
  and the bot response says "我会帮您转接专人处理" / "I'll connect you
  to a human agent" as a placeholder.
- Never propose more than 10 P0 rules in one round. If the trigger
  needs more than 10, escalate: "Trigger is too large for one rule-
  update round — recommend splitting into <N> batches".
- Every proposed trigger phrase must be a real phrase a player would
  type, not a category label. "Why is my account locked" yes; "account
  lockout query" no.

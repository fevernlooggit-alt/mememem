# Module 2 — Game Team Publication Analysis

## Job
Take something the game team just published (patch notes, test report,
internal announcement, design doc) and produce a CS-perspective
analysis — what players will ask, what the bot needs to know, what
ops needs to prepare for.

## Required input
- `publication_text`: the content, pasted verbatim or as a file path
- `publication_type`: patch-notes | test-report | announcement | design-doc | other
- `publication_date`: when it was released

## Steps

1. Read the publication end to end before writing anything.
2. Build an **inventory** of every discrete item (every changed value,
   added feature, fixed bug, known issue). Number them.
3. For each item, classify:
   - **Player visibility**: visible / invisible / partly-visible
   - **Player sentiment risk**: positive / neutral / negative / mixed
   - **Likely CS questions**: 1–3 questions players will probably ask
4. Identify the **top 5 player-facing items** by combined visibility +
   sentiment risk. These get the deep treatment.
5. Identify **unstated implications** — things the publication doesn't
   say but a player or CS rep would want to know.
6. Identify **conflicts with prior state** — anything that contradicts
   a previous patch or a known FAQ.

## Output template

```
# Game Team Analysis — <publication title>

**Slug:** <kebab>
**Type:** <patch-notes | test-report | announcement | design-doc | other>
**Published:** <YYYY-MM-DD>
**Items inventoried:** <N>

## Top 5 player-facing items

### 1. <item title>
- **What changed:** <1 sentence>
- **Visibility:** <visible | invisible | partly-visible>
- **Sentiment risk:** <positive | neutral | negative | mixed> — <why>
- **Likely player questions:**
  - <Q1>
  - <Q2>
  - <Q3>
- **Suggested CS reply angle:** <1–2 sentences>
- **Source line:** "<exact quote from the publication>"

### 2. ...
### 3. ...
### 4. ...
### 5. ...

## Full inventory
| # | Item | Player-visible | Sentiment risk | Source line # |
|---|------|----------------|----------------|---------------|
| 1 | ...  | ...            | ...            | ...           |
| 2 | ...  | ...            | ...            | ...           |

## Unstated implications
- <thing the publication didn't say but matters>
- ...

## Conflicts with prior state
- <prior FAQ / patch / setting> — <what now contradicts>
- If none: write "None identified"

## Recommended CS prep
- FAQ updates needed: <yes / no — see Module 3 if yes>
- Macro updates needed: <list>
- Watch-list (signals to monitor): <list>
```

## Rules

- Every bullet in "Top 5" and "Full inventory" must trace to a quoted
  line in the source. If you cannot quote it, drop it.
- Never extrapolate beyond what the publication says. If the patch
  notes don't quantify a nerf, write "magnitude not stated" — do not
  guess at percentages.
- "Conflicts with prior state" is only filled if the user has
  previously provided prior state OR the publication itself references
  a prior version. Otherwise write "None identified — no prior state
  in scope".
- If the publication is a test report, the inventory is of test
  findings, not player-facing changes. Adapt the template: replace
  "Player-visible" with "Severity" (blocker / major / minor / info).

# Wrap — Daily Aggregation

## Job
At the end of a day (or session), produce a single rollup that
references every artifact written that day and highlights what
matters most for the next CS shift.

## When to run
- User says "wrap", "daily wrap", "CS wrap", "end of day"
- After 3+ modules have produced artifacts in the same day

## Required input
- None — the wrap reads `/outputs/<today>/INDEX.md` and the individual
  artifacts.

## Steps

1. Read `/outputs/<YYYY-MM-DD>/INDEX.md`. If it doesn't exist, write
   "No CS intel artifacts for today" and stop.
2. For each module that produced an artifact today, read the artifact
   and extract:
   - Headline (1 sentence)
   - Top action item (if any)
   - Open question for the operator (if any)
3. For each module that produced NO artifact today, note it.
4. Cross-reference:
   - If `intake` had a P0/P1 → does `botrules` cover it? If not, flag.
   - If `gameteam` flagged player-facing items → does `botrules` cover
     them? If not, flag.
   - If `numbers` recommended Ship → is there an `intake` or
     `gameteam` artifact that downstream-references it? If not, flag.
5. Identify the **top 3 things for tomorrow**.

## Output template

```
# CS Intel Wrap — YYYY-MM-DD

## Today at a glance
- Artifacts produced: <N>
- P0 / P1 intakes: <N>
- Bot rule proposals: <N>
- Modules skipped today: <list>

## Per-module headline

### Intake
- <headline 1>
- <headline 2>
- ...

### Game team analysis
- <headline 1>
- ...

### Bot rule proposals
- <headline 1>
- ...

### Account audits
- <headline 1 or "none today">

### Numbers tests
- <headline 1 or "none today">

## Cross-module checks
- [ ] Every P0/P1 intake has a bot rule proposal: <yes / no — gaps>
- [ ] Every player-facing game-team item has a bot rule: <yes / no — gaps>
- [ ] Every shipped numbers change has downstream coverage: <yes / no — gaps>

## Open questions for the operator
1. <question 1> — from <artifact slug>
2. <question 2> — from <artifact slug>
3. ...

## Top 3 for tomorrow
1. <thing 1> — why it matters
2. <thing 2> — why it matters
3. <thing 3> — why it matters

## Skipped modules
- <module>: <reason>
```

## Rules

- Never invent content not present in today's artifacts.
- If "Cross-module checks" finds a gap, the gap is named with the
  specific intake / gameteam slug that's uncovered. No vague "some
  intakes lack rules".
- "Top 3 for tomorrow" is the operator's morning checklist. Items must
  be specific and actionable, not "review the situation".
- The wrap itself is written to `/outputs/<YYYY-MM-DD>/WRAP.md` and
  added as the last line of INDEX.md.

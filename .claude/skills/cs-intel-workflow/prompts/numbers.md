# Module 5 — Numerical / Balance Test Report

## Job
Given a proposed numerical change (a stat, drop rate, economy value,
formula, etc.), produce a test report that the operator can use to
decide ship / hold / revise.

## Required input
- `baseline`: the current values, with field names and units
- `change_spec`: the proposed new values, with the same field names
- `scope`: what's being tested — single stat / formula / system /
  economy loop
- Optional: `target_metric` — the KPI the change is meant to move
  (retention, ARPU, session length, win rate, etc.)
- Optional: `constraints` — anything that must NOT change (e.g.
  "average run time stays within 4–6 min")

## Steps

1. Restate the change in plain language. Confirm units. Catch unit
   mismatches (e.g. percentage vs multiplier, seconds vs ticks).
2. For each changed field, compute the **delta**: absolute and
   relative. If a formula changed, write out the formula before and
   after, and a worked example at 3 input points (low / mid / high).
3. Identify **downstream effects** — every system that consumes the
   changed value. For each, predict the direction of effect (↑ / ↓ /
   non-monotonic / unknown) and the magnitude bracket (small / medium
   / large / unknown).
4. Run a **break test**: pick extreme inputs (min, max, 10× normal)
   and report whether the formula still produces sensible output.
5. Run a **constraint test**: for each named constraint, evaluate
   whether the change respects it. If a constraint cannot be tested
   without runtime data, mark it `requires-playtest`.
6. Produce a **ship / hold / revise** recommendation with one
   sentence of justification.

## Output template

```
# Numbers Test — <change title>

**Slug:** <kebab>
**Scope:** <single-stat | formula | system | economy-loop>
**Target metric:** <KPI or "not stated">
**Constraints:** <list or "none stated">

## Change summary (plain language)
<2–3 sentences. Catch unit confusion here.>

## Field-level deltas
| Field | Unit | Before | After | Δ abs | Δ rel | Notes |
|-------|------|--------|-------|-------|-------|-------|
| ... | ... | ... | ... | ... | ... | ... |

## Formula changes (if any)
**Before:**
```
<formula 1>
```
**After:**
```
<formula 2>
```
**Worked examples:**
| Input | Before output | After output | Δ |
|-------|---------------|--------------|---|
| low (X)  | ... | ... | ... |
| mid (Y)  | ... | ... | ... |
| high (Z) | ... | ... | ... |

## Downstream effects
| System | Direction | Magnitude | Confidence | Reason |
|--------|-----------|-----------|------------|--------|
| <system> | ↑ / ↓ / non-mono / unknown | S / M / L / unknown | high / med / low | <1 sentence> |

## Break test
| Input | Output | Sensible? |
|-------|--------|-----------|
| min   | ...    | yes / no — <reason> |
| max   | ...    | yes / no — <reason> |
| 10×   | ...    | yes / no — <reason> |

## Constraint check
| Constraint | Result | Evidence |
|------------|--------|----------|
| <c1>       | pass / fail / requires-playtest | <reason> |

## Recommendation
**Ship / Hold / Revise:** <one>
**Reason:** <one sentence>
**If revise, suggested adjustments:**
- <adjustment 1>
- <adjustment 2>

## What this report did NOT test
- <thing that needs live data>
- <thing that needs player behavior>
- ...
```

## Rules

- **No "approximately X%" without a range.** Either give a number, a
  range (e.g. "+12% to +18%"), or write "unknown — requires playtest
  data".
- If units are ambiguous in the input, the first action is to ask the
  operator to confirm units. Do not proceed.
- Every "downstream effect" must name the system. "Will affect the
  economy" is not acceptable. "Will affect gold-per-hour from the
  daily quest loop" is acceptable.
- The "Ship / Hold / Revise" recommendation is one of those three
  words. Not "looks fine" or "should be ok".
- If the change involves randomness (drop rates, crit chance), the
  worked examples include expected value AND a variance note. Single-
  sample examples are not enough.
- If the operator provided no `target_metric`, the report flags this:
  "No target metric specified — cannot evaluate whether change moves
  the right needle." Recommendation defaults to **Hold** in that case
  unless the change is purely a bug fix.

# Numbers Test Checklist — for Module 5

Before writing the report, mentally run through:

## Unit sanity
- [ ] Are all "rate" fields the same unit? (% vs. multiplier vs. probability 0–1)
- [ ] Are all "time" fields the same unit? (seconds vs. ticks vs. frames)
- [ ] Are currency fields the same currency?
- [ ] Are stat fields in the same scale (raw vs. normalized)?

## Magnitude check
- [ ] Compute Δ relative — is it >50%? Flag as "large change, high risk".
- [ ] Compute Δ relative — is it <2%? Flag as "small change, likely
      below noise floor — is this worth testing?".

## Break-test inputs (always include)
- Minimum legal input (0, or the lowest allowed)
- Maximum legal input (cap, or the highest reachable)
- 10× normal expected input
- Negative input (if not blocked) — does it break?
- Floating-point edge (e.g. 0.1 + 0.2 if a sum is involved)

## Economy-specific (if scope includes economy)
- [ ] Inflation: does the change increase total in-game currency velocity?
- [ ] Sink-source ratio: still balanced?
- [ ] Whale impact: how does the change land on top spenders?
- [ ] F2P impact: how does it land on non-payers?

## Combat / stat-specific (if scope includes combat)
- [ ] TTK (time-to-kill) at low gear
- [ ] TTK at average gear
- [ ] TTK at top gear
- [ ] Synergy with existing meta builds

## Drop-rate / RNG-specific (if scope includes random)
- [ ] Expected value computed
- [ ] Variance / standard deviation noted
- [ ] Pity / floor mechanics interact correctly
- [ ] "Bad streak" length at 5th / 50th / 95th percentile

## Cross-system
- [ ] Does the change touch a value also used by another formula?
- [ ] If yes, that formula goes in the downstream-effects table.

## Constraint check
- [ ] For each named constraint, is there a measurable pass/fail?
- [ ] If not measurable without live data, mark `requires-playtest`.

## Confidence assignment
- **High** — pure math, deterministic, all inputs known
- **Medium** — depends on player behavior the team has past data on
- **Low** — depends on player behavior with no prior data, OR depends
  on a system not in scope of the change

Never write "high confidence" on a downstream-effects entry unless the
relationship is pure math.

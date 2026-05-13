# Module 9 — 发版前 / 发版后 Checklist (release)

## Job
Produce a release-readiness and post-release-monitoring checklist for
a single upcoming or in-progress release. The artifact is a phone-
friendly punch list with metric thresholds, alert conditions, and a
named rollback trigger.

## Required input
- `release_spec`: version number + 5-line summary of the main changes
- `release_window`: planned go-live time (ISO 8601 + timezone)
- `platform`: ios | android | both | web
- Optional: `baseline_metrics` — current crash rate, login success
  rate, IAP rate, ticket volume (last 7d average)
- Optional: `gradual_rollout` — % rollout plan if applicable

## Steps

1. Restate the release scope. Mark which sub-items are **risky**
   (touches login, payment, save-game, account binding, large balance
   change). Mark each high-risk item with a 🚩 in the checklist.
2. **T-24h checklist**: things that must be true 24h before go-live.
   Build store-platform-specific items (App Store review status,
   Play Console release rollout %, signed build verified, etc).
3. **T-4h checklist**: monitoring readiness — dashboards open,
   on-call confirmed, comms templates pre-staged, rollback procedure
   re-confirmed.
4. **T-1h checklist**: final go/no-go criteria.
5. **T+0 to T+1h monitoring**: name 4-6 metrics + threshold + check
   cadence. The threshold is a HARD number; "monitor closely" is not
   acceptable.
6. **T+1h to T+4h monitoring**: same shape, broader signals.
7. **T+24h checklist**: extend rollout / decide retention next steps /
   set up retrospective.
8. **Rollback trigger conditions**: list 3-5 specific conditions that
   force a rollback. Each is an inequality, not a vibe.
9. **Comm templates** to pre-stage: maintenance notice, post-mortem
   stub, player apology, rollback notice.
10. **Risk list**: rank top 3 things most likely to go wrong, with
    mitigation already prepared.

## Output template

```
# Release Plan — <version> — <YYYY-MM-DD HH:MM TZ>

**Slug:** <kebab>
**Version:** <e.g. 1.4.3>
**Platform:** <ios | android | both | web>
**Go-live window:** <YYYY-MM-DD HH:MM TZ>
**Gradual rollout:** <% / staged / 100% / n/a>

## Scope (risky items flagged 🚩)
- <item 1> 🚩
- <item 2>
- <item 3> 🚩
- ...

## T-24h checklist
- [ ] Build signed and verified (build #<N>)
- [ ] <store-specific: TestFlight approved | Play internal track validated>
- [ ] Crash-reporter / Sentry SDK config matches production
- [ ] Server-side feature flags pre-set (all 🚩 items behind a flag)
- [ ] Migration scripts (if any) tested on prod-like data
- [ ] Customer-support FAQ updated — bot rules from botrules module deployed
- [ ] On-call schedule confirmed (primary + backup with phones)
- [ ] Rollback procedure documented and accessible from phone
- [ ] Hotfix branch ready to cut from
- [ ] Release notes finalized in all target locales

## T-4h checklist
- [ ] Dashboards open in browser: <list>
- [ ] Slack / Discord channels active and pinned
- [ ] Comm templates pre-drafted (see below)
- [ ] Rollback rehearsed in last 30 days — verify
- [ ] No conflicting events scheduled (no major promo / no marketing push within ±2h)

## T-1h go/no-go
- [ ] Baseline metrics recorded (snapshot ↓)
- [ ] No active P0/P1 incidents
- [ ] Eng on-call confirms ready
- [ ] CS on-call confirms ready
- [ ] Operator confirms ready (this is the human gate)

### Baseline snapshot (last 7d avg)
| Metric | Value | Source |
|--------|-------|--------|
| Crash rate (sessions) | <X%> | <dashboard> |
| Login success rate | <X%> | <dashboard> |
| IAP success rate | <X%> | <dashboard> |
| Ticket volume / hour | <N> | <CS tool> |
| <other relevant metric> | <X> | <source> |

## T+0 → T+1h monitoring
Cadence: check every 10 minutes. Pager fires automatically.

| Metric | Warn threshold | Alert threshold | Status |
|--------|----------------|-----------------|--------|
| Crash rate (sessions) | >baseline + 0.3pp | >baseline + 1pp | pending |
| Login success rate | <baseline - 1pp | <baseline - 3pp | pending |
| IAP success rate | <baseline - 2pp | <baseline - 5pp | pending |
| Ticket volume / hour | >baseline × 1.5 | >baseline × 3 | pending |
| 🚩 specific risky-item metric | <set per item> | <set per item> | pending |

## T+1h → T+4h monitoring
Cadence: every 30 min.

| Metric | Warn | Alert | Notes |
|--------|------|-------|-------|
| Same as above plus: | | | |
| Session length | <baseline - 10% | <baseline - 20% | retention proxy |
| D1 cohort start | not applicable yet | — | track for T+24h |

## T+24h checklist
- [ ] Confirm metrics back to baseline ±1pp
- [ ] No spike in refund / chargeback requests
- [ ] Decide: extend rollout / hold at current % / rollback
- [ ] If rollout extended: re-snapshot baseline at new %
- [ ] Schedule retrospective for T+72h

## Rollback triggers (hard rules)
Rollback if ANY of the following is true:

- [ ] Crash rate > baseline + 1pp for >15 minutes
- [ ] Login success rate < baseline - 3pp for >10 minutes
- [ ] IAP success rate < baseline - 5pp for >10 minutes
- [ ] Ticket volume > baseline × 3 sustained for >30 minutes
- [ ] Any data-loss report confirmed (1 confirmed = rollback)
- [ ] 🚩 risky-item-specific trigger: <define per item>

**Rollback procedure:** <one-line where to find it; full procedure in <link or runbook path>>

## Pre-staged comm templates
- **Maintenance / known issue notice** (in-app banner): <draft 1 line>
- **Apology + ETA** (Twitter / Discord): <draft 2 lines>
- **Rollback notice** (in-game-mail + status page): <draft 2 lines>
- **All-clear** (post-monitoring): <draft 1 line>

## Top 3 risks for this release
1. <risk> — likelihood: <high/med/low> — mitigation prepared: <yes/no>
2. <risk> — likelihood: ... — mitigation: ...
3. <risk> — likelihood: ... — mitigation: ...

## Open questions for the operator
- <thing the input didn't tell us>
- ...
```

## Rules

- **Every threshold must be a number or a number ± delta.** "Monitor
  closely" is not an acceptable threshold. If you don't have a baseline
  for a metric, write `baseline-not-provided — set before go-live` in
  the Status column and add it to Open questions.
- **Every rollback trigger is an inequality**, not a vibe. "If things
  look bad" is not a trigger.
- **The first ticked T-1h checkbox is the human gate.** "Operator
  confirms ready" is the last line of go/no-go. Without it, no release.
- **🚩 risky-item items** must have at least one paired metric in
  monitoring tables. If you can't name a metric for a risky item, that
  item itself gets an Open question.
- **Never recommend skipping T-24h items.** If the operator pasted a
  release happening in 2 hours, the report still lists T-24h items
  with status "OVERDUE — confirm or accept the risk in writing".
- For `platform: web`, store-specific items become CDN / DNS items —
  CDN cache flush plan, DNS TTL verified, rollback URL pre-staged.
- For `gradual_rollout`: every monitoring table also tracks the
  rollout %, and the alert thresholds apply at the *current* rollout
  share (not at the eventual 100% projection).

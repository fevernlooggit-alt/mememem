# Module 7 — P0/P1 事故处理 Checklist (incident)

## Job
Take a live incident description and produce a structured 25-30 item
checklist that walks the operator through diagnosis → containment →
communication → recovery → post-mortem. Designed for solo operators
who need a memory aid under stress, not a multi-team runbook.

## Required input
- `incident_text`: what is happening, paste verbatim
- `detected_at`: when the symptom was first observed
- Optional: `current_status` (still firing / partially mitigated / resolved)
- Optional: `affected_segment` (region / platform / player segment if known)

## Steps

1. Restate the incident in one sentence. If unclear, list the
   ambiguities — the first checklist item is "clarify what is broken".
2. Classify severity using HARD anchors (same as intake):
   - P0: production down / payments failing / mass login failure / data loss
   - P1: a major feature broken for many users; revenue impact named
   - P2: feature degraded, minority affected
3. Build the **5W check** — write each W with either the answer from
   the input or `unknown — needs investigation`.
4. Build the **immediate-action checklist** for the next 15 minutes.
   Order matters: stop the bleeding before anything else.
5. Build the **communication matrix**: who needs to know now, who can
   wait, what the external (player-facing) message looks like.
6. Build the **mitigation decision tree**: rollback / feature flag /
   hotfix / wait — list each with its trigger condition and risk.
7. Estimate **player impact**: rough bracket (×10 / ×100 / ×1000 / ×10k+)
   based on what's in the input. If unknown, write "needs measurement
   — see open questions".
8. Trigger **compensation evaluation** if any of: player can't play
   for >1h, paid feature is broken, data was lost. Write the trigger
   met or not.
9. Produce a **post-mortem question list** (5 Whys + prevention).
10. List **open questions / unknowns** explicitly — what's blocking a
    full picture.

## Output template (write exactly this structure)

```
# Incident — <one-line title>

**Slug:** <kebab>
**Detected at:** <YYYY-MM-DD HH:MM>
**Severity:** <P0 | P1 | P2>
**Status:** <still firing | partially mitigated | resolved | unknown>
**Affected segment:** <comma-separated, or "unknown">

## One-line summary
<the incident in one sentence>

## 5W check
- **What:** <symptom> | unknown
- **When:** <since when, frequency, duration> | unknown
- **Where:** <surface, region, platform> | unknown
- **Who:** <which players, how many> | unknown
- **Why:** <suspected cause> | unknown — under investigation

## Immediate actions (next 15 min)
- [ ] <action 1 — stop the bleeding>
- [ ] <action 2>
- [ ] <action 3>
- [ ] <preserve evidence: logs, crash reports, screenshots>
- [ ] <decide: rollback / flag / hotfix / wait — see decision tree below>

## Within 1 hour
- [ ] <action>
- [ ] <action>
- [ ] <update internal stakeholders>
- [ ] <external comms decision>

## Within 4 hours
- [ ] <action>
- [ ] <begin root-cause analysis>
- [ ] <measure actual blast radius>

## Communication matrix
| Audience | Channel | Message gist | When | Status |
|----------|---------|--------------|------|--------|
| Eng on-call | <Slack/phone> | <one line> | now | pending |
| Ops lead | <channel> | <one line> | within 30min | pending |
| Affected players | <in-app/store/social> | <one line> | <when> | pending |
| Internal #incidents | <channel> | <one line> | continuous | pending |

## Mitigation options
| Option | Trigger to choose | Risk | Time-to-effect |
|--------|-------------------|------|----------------|
| Rollback to <prev version> | <when this is preferred> | <what could go wrong> | <est minutes> |
| Feature flag off | <when> | <risk> | <est minutes> |
| Hotfix | <when> | <risk> | <est hours> |
| Wait + monitor | <when acceptable> | <risk> | n/a |

**Recommended path:** <one of the above + one-sentence justification>

## Player impact estimate
- **Bracket:** <×10 / ×100 / ×1000 / ×10k+ / unknown>
- **Evidence:** <ticket count, log volume, telemetry, or "not measured yet">
- **Revenue impact:** <if implied or "not stated">

## Compensation evaluation
- **Trigger met?** <yes/no — reason>
- **If yes:** <draft package — needs operator approval; see refund module for individual cases>

## Post-mortem questions (do not answer now — capture for later)
1. Why did this happen? (proximate cause)
2. Why didn't we catch it before production?
3. Why didn't monitoring alert sooner?
4. What's the systemic fix vs the point fix?
5. What prevention can we add?

## Open questions / unknowns
- <thing the input didn't tell us that matters>
- <thing we need to measure>
- ...

## Evidence to preserve before it rotates out
- [ ] Crash logs (last 4h)
- [ ] Server error logs (window: <start> to now)
- [ ] Affected player IDs (sample of 10+)
- [ ] Screenshots from one affected client
- [ ] Telemetry snapshot of <relevant metric>
```

## Rules

- **Severity is by hard anchor only.** "Looks bad" / "urgent" is not P0
  unless the hard anchor matches.
- Every checklist item is an **action**, not a question. Questions go
  under "Open questions".
- Communication matrix must include at least one entry for **affected
  players** even if the recommendation is "no external comms yet" —
  in that case the channel is "n/a" and message is "deferred".
- The **5W check** must NOT silently skip a row. Every W either has an
  answer or `unknown — needs investigation`.
- **Mitigation table:** always include `Wait + monitor` as an option,
  even when it's clearly wrong — forces the operator to articulate why
  not.
- Never recommend external comms for P2. Internal only.
- Never invent player counts, revenue numbers, or root cause. If
  unstated, the report says so.
- The artifact is meant to be opened on a phone at 2am. Keep section
  headings short and lead with the next-15-min actions.

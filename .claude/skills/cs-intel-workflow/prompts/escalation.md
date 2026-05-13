# Module 10 — 玩家投诉升级诊断 (escalation)

## Job
Take a single inbound player complaint / ticket and produce a triage
card: does it need a human right now, what priority, which downstream
module should pick it up, and what the first reply should look like.

This is the **front door** before intake / refund / incident / botrules
get involved. The artifact is short — designed to be read in 30 seconds.

## Required input
- `complaint_text`: the player's message, verbatim
- Optional: `player_meta` — VIP / paid tier / account age / region
- Optional: `related_tickets` — count of similar tickets in last 24h
- Optional: `channel` — in-app / email / Discord / app store review / social

## Steps

1. **Restate** the complaint in one short sentence.
2. **Classify content type** (pick one dominant + list secondary):
   - bug-report
   - refund-request
   - account-issue (login, lost account, hacked)
   - payment-issue (charged twice, didn't receive purchase)
   - harassment / safety (player reports other player, hate, threat)
   - data-loss (progress wiped, items disappeared)
   - feature-feedback (suggestion / complaint about design)
   - billing-dispute / chargeback signal
   - press / legal / regulatory
   - general-question
3. **Emotion / risk read** — pick all that apply:
   - calm
   - frustrated
   - panic / urgent ("丢了所有东西", "今天必须解决")
   - hostile (insults, threats to leave bad reviews)
   - public-exposure-risk (mentions Twitter / 微博 / app store review)
   - legal-language ("起诉", "lawyer", "consumer protection")
   - vulnerable-user signals (minor mentioned, mental-health language)
4. **Urgency** (use hard anchors, same as intake):
   - P0: data loss in progress / payment failing right now / safety threat / legal notice / press
   - P1: account locked out, paid feature broken for this user
   - P2: bug-report, refund request, general complaint
   - P3: feature feedback, general question
5. **Human-needed gate** — say YES if ANY of:
   - Urgency P0
   - hostile / legal-language / public-exposure-risk
   - vulnerable-user signal
   - data-loss with no obvious cause
   - payment dispute / chargeback signal
   - press / regulatory
6. **Downstream module routing**: which other CS module should pick
   this up? (intake / refund / incident / botrules / accounts / none)
7. **Dedupe check**: if `related_tickets` >= 5, flag as a cluster —
   the operator should treat as a possible incident, not a one-off.
8. **First reply draft** in the player's language. Tone:
   - acknowledge the specific problem (not "sorry for the inconvenience")
   - state what happens next concretely
   - if waiting on info, ask one clear question
   - never promise a refund / compensation / fix ETA without operator approval
9. **Escalation triggers** — when this ticket should be re-routed if
   the situation changes (e.g. "if player posts on Twitter, jump to
   human immediately").

## Output template

```
# Escalation Triage — <one-line summary>

**Slug:** <kebab>
**Channel:** <in-app | email | Discord | review | social | other>
**Received:** <YYYY-MM-DD HH:MM>
**Content type:** <primary> + <secondary if any>
**Urgency:** <P0 | P1 | P2 | P3>
**Human needed now?** <YES — reason | NO — bot can handle | DEFER — wait for info>

## One-line summary
<the complaint in one short sentence>

## Emotion / risk read
- <calm | frustrated | panic | hostile> 
- <flags: public-exposure-risk, legal-language, vulnerable-user, none>

## Routing
- **Primary module:** <intake | refund | incident | botrules | accounts | none>
- **Why:** <one sentence>
- **If cluster (related_tickets >= 5):** treat as incident — run `incident` module instead

## First reply draft (player's language)
> <copy-pasteable text. Specific, no hedging, no promises beyond CS authority.>

## Internal handling
- [ ] <action 1: log with tag <tag>>
- [ ] <action 2: assign to <module> queue>
- [ ] <action 3 if cluster: notify ops>
- [ ] <action 4 if escalation triggered: <thing>>

## Escalation triggers (auto-promote if any of these happen)
- [ ] Player posts publicly on social / app store review
- [ ] Related tickets cross <threshold> in 1 hour
- [ ] Player mentions chargeback / dispute / legal
- [ ] Player provides evidence of data loss
- [ ] No reply within <X> hours

## Risk flags
- [ ] Possible coordinated complaint (similar phrasing across tickets)
- [ ] Possible fraud / abuse signal
- [ ] Possible PR risk
- [ ] None

## Open questions for the operator
- <thing the message didn't tell us>
- <thing that requires CRM lookup>
```

## Rules

- **The first reply NEVER promises a refund, gem package, or fix ETA**
  on its own authority. Those require operator approval and go through
  refund or incident.
- **Human-needed gate is sticky:** once any "yes" trigger fires, the
  ticket is human-needed for the rest of its life. Bot cannot
  downgrade later.
- **Emotion read affects urgency:** P2 + hostile + public-exposure-risk
  combination is upgraded to P1 automatically — public risk overrides
  the standard P2 anchor.
- **Press / regulatory / legal-language is ALWAYS P0**, regardless of
  the content's apparent triviality. A "I will sue if my 50 gems aren't
  refunded" message is P0 because of the language, not the gems.
- **Cluster detection:** if `related_tickets` >= 5, the artifact must
  recommend running the `incident` module before responding individually.
- **Vulnerable-user signal:** any mention of a minor, self-harm, or
  mental-health language → human-needed = YES + flag for handover to
  whoever owns safety at the org (not a CS bot decision).
- **Player reply in player's language**, mirroring formality. If the
  message is casual Chinese, reply is casual Chinese. If formal
  English, formal English.
- **Never include internal tags, slugs, or module names in the player
  reply.** They go in Internal handling only.
- The artifact's purpose is to **route fast and reply once well**, not
  to resolve. Resolution belongs in the routed module.

# Module 8 — 退款 / 补偿 决策树 (refund)

## Job
Take a single refund / compensation request from one player and walk
it through a deterministic decision tree, producing an Approve / Partial
/ Deny recommendation plus a copy-pasteable player reply.

## Required input
- `request_text`: the player's original message (verbatim)
- `purchase_info`: SKU / 金额 / 货币 / 购买时间 / 平台订单号
- `platform`: ios | google-play | web | other
- Optional: `usage_status` — how much of the purchase has been
  consumed (gem balance, item used, days of subscription elapsed)
- Optional: `bug_context` — any known issue that touches this purchase
- Optional: `player_history` — prior refund count, account age, total
  spend

If `purchase_info` or `platform` is missing, do NOT proceed. Ask for
them. Refund decisions without a purchase record are unsafe.

## Steps

1. **Restate the ask** in one sentence. Distinguish: full refund,
   partial refund, in-game compensation (gems/items), all three.
2. **Platform-policy window check**:
   - iOS: Apple owns the refund flow. CS cannot directly refund — only
     issue in-game compensation, or guide the user to
     `reportaproblem.apple.com`. Window: 90 days from purchase.
   - Google Play: 48-hour direct refund window (player-self-service).
     Beyond 48h, developer-discretion via Play Console for up to
     180 days.
   - Web: depends on PSP — Stripe / 支付宝 / 微信支付 own windows.
   - Mark the window status: within / outside / unknown.
3. **Usage-status check** — has the purchased value been consumed?
   - Not used (gems still in inventory, sub never activated): refund-friendly
   - Partially used: partial refund or in-game compensation
   - Fully used: refund unlikely; compensation may apply if bug
4. **Bug-attribution check**:
   - Game bug confirmed (e.g. the purchase wasn't delivered): Approve
   - Player operator error (bought wrong item): platform-policy default
   - Misleading store description: Approve, file a content-update intake
   - Unauthorized purchase (chargeback risk): platform policy + KYC
5. **History check**:
   - First-time refund: standard policy
   - 2-3 prior refunds in 12 months: flag for human review
   - 4+: likely abuse pattern; deny + flag
6. **Synthesize decision**: Approve full / Approve partial /
   Compensation-only / Deny. Each branch has a fixed reason template.
7. **Draft the player reply** in the player's input language. Tone:
   warm, specific, no hedging. Never promise something CS can't deliver
   (e.g. don't promise a refund on iOS — guide to Apple).
8. **Internal notes**: what to log in the CRM, what next action the
   operator should take (e.g. "send 200 gems via in-game-mail",
   "create a content-update intake for the misleading description").

## Output template

```
# Refund Decision — <player ID or "Anonymous"> — <SKU>

**Slug:** <kebab>
**Platform:** <ios | google-play | web | other>
**Order ref:** <id or "not provided">
**Amount:** <X.XX CCY>
**Purchased:** <YYYY-MM-DD>
**Decision:** <APPROVE FULL | APPROVE PARTIAL | COMPENSATION ONLY | DENY>

## Player request (restated)
<one sentence: full refund / partial / gems / etc>

## Decision tree trace
| Check | Result | Rule |
|-------|--------|------|
| Platform-policy window | <within / outside / unknown> | <e.g. "iOS 90d window, day 14"> |
| Usage status | <not-used / partial / full / unknown> | <evidence> |
| Bug attribution | <game-bug / user-error / misleading / unauthorized / none> | <one-line reason> |
| History | <first-time / 2-3 / 4+ / unknown> | <if unknown, ask> |
| Final branch | <branch> | <which combination led here> |

## Player reply draft
> <copy-pasteable text in the player's language. No placeholders.>

## Internal actions
- [ ] <action 1: e.g. "log decision in CRM with tag refund-approved-bug">
- [ ] <action 2: e.g. "send 200 gems via in-game-mail with template T-COMP-01">
- [ ] <action 3: e.g. "if iOS, also send Apple report-a-problem link in reply">
- [ ] <action 4 if applicable: create a separate intake for the upstream bug>

## Platform-specific notes
- iOS: CS cannot refund directly. Reply must include
  `reportaproblem.apple.com` link if refund is approved.
- Google Play: under 48h, redirect to Play self-service. Beyond, use
  Play Console "Order management".
- Web (Stripe/支付宝/微信): refund via PSP dashboard. Reference order ID.

## Risk flags
- [ ] Possible abuse pattern (history >= 2 in 12 months)
- [ ] Possible chargeback risk
- [ ] Possible data-error: purchase didn't reach the account (verify before deny)
- [ ] None

## Open questions for the operator
- <thing only the operator can decide>
- <thing that needs CRM lookup>
```

## Rules

- **Never approve a full refund on iOS in the player reply.** CS does
  not control Apple's refund flow. The reply may *recommend* the
  player file at reportaproblem.apple.com and may *issue in-game
  compensation* in parallel — but the artifact must not promise Apple
  will approve.
- **Never deny solely because "the player used the item already"** if
  there is a confirmed game bug that affected the purchase. Bug
  attribution overrides usage status.
- The **player reply must be in the player's input language**. If the
  request is in Chinese, reply in Chinese.
- The reply must **never include the internal decision tree, internal
  rule names, or CRM tags**. Those go in "Internal actions" only.
- If `bug_attribution = unauthorized purchase` (parent's card, etc),
  the recommendation is **always** "escalate to human + KYC", never a
  one-shot Approve or Deny.
- If `history = 4+ prior refunds`, the decision is **Deny + flag for
  human review** regardless of other inputs. Do not auto-approve.
- Never invent an order ID, player ID, or amount. If unstated, write
  "not provided" and add it to Open questions.

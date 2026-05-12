# Bot Rule Format Reference — for Module 3

## Canonical rule shape (platform-agnostic)

Every rule has these fields. Adapt syntax per platform.

```yaml
id: <stable id, e.g. 0042>
name: <short human label>
status: active | proposed | retired
trigger_phrases:
  - "<phrase 1>"
  - "<phrase 2>"
  - "<phrase 3>"
intent_summary: <one sentence>
response: |
  <multi-line response text>
escalation: <condition that hands off to human>
preconditions: <e.g. "only after patch 1.4.3">
source_justification: <link or quote that justifies this rule>
last_reviewed: <YYYY-MM-DD>
```

## Platform-specific notes

### Intercom Custom Bot / Resolution Bot
- Trigger phrases → "Customer says" conditions
- Response → reply block
- Escalation → "Route to team" action

### Zendesk Answer Bot
- Trigger phrases → article-matching keywords
- Response → article body or macro
- Escalation → trigger that opens a ticket

### Dialogflow / CX
- Trigger phrases → training phrases
- Response → fulfillment text
- Escalation → handoff intent

### Custom Claude / GPT system prompt
- Trigger phrases → embedded in system prompt as "if user says X..."
- Response → embedded as "...respond with Y"
- Escalation → "if confidence < threshold, reply '我帮您转接专人'"

## Anti-patterns to avoid

- **Overlapping triggers** — two rules competing for the same phrase
- **Catch-all responses** — "Sorry I don't understand" as a rule
  belongs in the fallback layer, not as a triggered rule
- **Promises the bot can't keep** — refunds, account unlocks, ban
  appeals. These always escalate.
- **Conditional logic in the response text** — "if you bought before
  Tuesday, X; otherwise Y" → split into two rules
- **Hardcoded dates** — "before March 1, 2025" without a precondition
  date → use the `preconditions` field

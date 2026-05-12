# Module 4 — Google / iOS Account State Audit

## Job
Record the current state of a store account (Google Play Console or
App Store Connect) and its associated settings, so the operator has a
local, dated audit trail. This module does NOT log in, does NOT change
settings, does NOT store credentials.

## Required input
- `platform`: google-play | app-store
- `state_dump`: a paste or screenshot description of what the operator
  is looking at in the console — settings page, account page, build
  page, etc.
- `purpose`: why this audit is happening (routine / pre-launch / post-
  incident / handover)

## Steps

1. Read the state dump. Identify which console screen it is from.
2. Build a key-value list of every setting visible.
3. Flag any value that looks like a credential, key, secret, or PII.
   These are **redacted** in the output — record only "present,
   redacted" and the field name.
4. Compare with prior audit if one exists in `/outputs/.../accounts/`
   for this platform. List deltas.
5. Identify settings that are likely to drift / cause issues — auto-
   renewing certs, payment configs, sandbox vs production toggles,
   bundle ID / package name, API access, team roles.
6. Produce action items only for things the operator can verify or
   change themselves.

## Output template

```
# Account Audit — <platform> — <YYYY-MM-DD>

**Platform:** <google-play | app-store>
**Console screen:** <e.g. "Google Play Console → App content → Privacy policy">
**Purpose:** <routine | pre-launch | post-incident | handover>
**Operator:** <name if stated, else "self">

## Settings snapshot
| Field | Value | Notes |
|-------|-------|-------|
| Bundle ID / package name | com.example.game | — |
| Build number | 1042 | — |
| API key (signing) | present, REDACTED | rotate every 90d |
| ... | ... | ... |

## Roles / access
| Member | Role | Last active | Notes |
|--------|------|-------------|-------|
| ... | ... | ... | ... |

## Delta vs prior audit (<prior date>)
- <field> — <old> → <new>
- If no prior: "No prior audit found for this platform"

## Drift-risk watchlist
- [ ] <thing that expires> — expiry <date if known>
- [ ] <thing that needs rotation>
- [ ] <thing that's misconfigured>

## Action items
- [ ] <action 1> — owner: <self> — due: <date>
- [ ] ...

## What was NOT verified this audit
- <screen / setting the dump didn't cover>
- ...
```

## Rules (security)

- **NEVER write a credential, API key, secret, token, password, or
  recovery code into the output.** If the user pastes one, the output
  records `<field name>: present, REDACTED`.
- **NEVER write a real email address of a team member into the
  output.** Use a role label or initials: "Lead dev (J.S.)" instead of
  the full address.
- If the user pastes a screenshot description containing what appears
  to be a key, secret, or other sensitive value, write a one-line
  warning at the top of the output:
  `## ⚠ Sensitive value detected in input — redacted from this artifact`
- The artifact is meant to be safe to commit to a personal git repo.
  Treat it as such.

## Rules (content)

- Never recommend a setting change without naming the specific risk it
  mitigates. "Enable 2FA" → "Enable 2FA — current state allows password-
  only login, single point of failure".
- "Drift-risk watchlist" must include any cert / cred / config with a
  known expiry, even if expiry > 6 months out.
- If `platform` is `app-store`, the watchlist must include: signing
  cert expiry, provisioning profile expiry, push cert expiry, and
  in-app-purchase agreement status.
- If `platform` is `google-play`, the watchlist must include: upload
  key, signing key (Play App Signing status), Play Console payment
  profile status, and any policy-violation flags.

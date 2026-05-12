# CS Intel Workflow

Solo-operator customer-service intelligence aggregator for a game-ops
context. Runs locally via Claude Code. Reads inputs from `inputs/`,
writes dated markdown to `outputs/<YYYY-MM-DD>/`.

## What it covers

| Module | What it does |
|--------|--------------|
| **intake** | Classify a new requirement from ops / testing / backend |
| **gameteam** | Analyze game-team publications (patch notes, test reports, announcements) from a CS angle |
| **botrules** | Propose AI-bot rule updates based on a trigger (no auto-apply) |
| **accounts** | Audit Google Play Console / App Store Connect state (no credentials stored) |
| **numbers** | Test numerical / balance changes — Ship / Hold / Revise |
| **wrap** | Daily rollup across all modules |

## Setup (one-time)

```bash
# 1. Clone or copy this folder somewhere durable
cd /path/to/cs-workflow

# 2. Make the runner executable
chmod +x scripts/run.sh

# 3. Optional — install Claude Code if you haven't
#    https://docs.claude.com/en/docs/claude-code

# 4. Optional — symlink into the user-skills dir so it's auto-loaded
mkdir -p ~/.claude/skills
ln -s "$(pwd)/skill" ~/.claude/skills/cs-intel-workflow
```

## Daily use

### Quick path — natural language in Claude Code

Just type what happened. The skill routes itself.

```
> 新需求来了：iOS 1.4.2 玩家登录后闪退，已有 50+ 工单。来自 testing。
```

→ Claude routes to `intake`, produces a classified intake card, writes
   to `outputs/<today>/intake/01_intake_<slug>.md`.

```
> 游戏组刚发了 patch 1.4.3 的内部说明，分析下对客服的影响：
[paste content]
```

→ Claude routes to `gameteam`, produces the analysis, writes to
   `outputs/<today>/gameteam/...`.

```
> wrap today
```

→ Claude reads today's INDEX.md, produces the daily rollup.

### Scripted path — CLI

```bash
./scripts/run.sh intake --file inputs/req_2026-05-12.txt --source ops
./scripts/run.sh gameteam --file inputs/patch.md --type patch-notes --date 2026-05-12
./scripts/run.sh numbers --baseline inputs/before.csv --change inputs/after.csv --scope economy-loop
./scripts/run.sh wrap
```

Each invocation writes a complete prompt file under `outputs/<today>/`
that you then pass to Claude Code (`claude < <prompt>` or paste).

## File layout

```
cs-workflow/
├── README.md                     # this file
├── MASTER_PROMPT.md              # what Claude Code reads first
├── skill/
│   └── SKILL.md                  # skill spec (auto-loaded if symlinked)
├── prompts/
│   ├── intake.md
│   ├── gameteam.md
│   ├── botrules.md
│   ├── accounts.md
│   ├── numbers.md
│   └── wrap.md
├── references/
│   ├── classification_taxonomy.md
│   ├── bot_rule_format.md
│   └── numbers_test_checklist.md
├── inputs/                       # drop raw files here
├── outputs/<YYYY-MM-DD>/         # generated artifacts (gitignore optional)
└── scripts/
    └── run.sh                    # CLI helper
```

## Safety guarantees

- **No credentials in outputs.** The `accounts` module redacts any
  value that looks like a key, secret, token, or password — the
  artifact only records "present, REDACTED".
- **No auto-apply.** The `botrules` module proposes changes; it never
  pushes to a bot platform.
- **No fabrication.** Modules trace every claim to a source line. If
  the source doesn't say it, the artifact doesn't either.
- **No silent skips.** Modules with missing input write a stub file
  saying so, instead of pretending nothing was asked.

## Open extension points

Things you may want to add later, but the current version intentionally
does not include:

- Ticket-system integration (Zendesk / Intercom write-back)
- Live game DB queries for the `numbers` module
- Multi-game support (currently single-game / single-operator)
- Team handoff format (the current artifacts are personal notes, not
  team docs)

Each of these would be its own module added to the same skill.

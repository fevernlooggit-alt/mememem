#!/usr/bin/env bash
# CS Intel Workflow — CLI entry
#
# Usage:
#   ./run.sh intake "<requirement text>"
#   ./run.sh intake --file inputs/req.txt --source ops
#   ./run.sh gameteam --file inputs/patch.md --type patch-notes --date 2026-05-12
#   ./run.sh botrules --trigger outputs/2026-05-12/gameteam/02_gameteam_patch.md --rules inputs/current_rules.yml --platform intercom
#   ./run.sh accounts --platform app-store --file inputs/asc_dump.txt --purpose routine
#   ./run.sh numbers --baseline inputs/baseline.csv --change inputs/change.csv --scope formula
#   ./run.sh wrap
#
# This script does NOT call Claude on its own. It assembles a
# Claude Code invocation by:
#   1. Resolving today's output directory
#   2. Reading the relevant module prompt
#   3. Reading the inputs the operator passed
#   4. Building a single prompt that Claude Code can execute
#
# You then pipe the assembled prompt to `claude` (Claude Code CLI),
# or paste it into a Claude Code session.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TODAY="$(date +%Y-%m-%d)"
OUT_DIR="${ROOT}/outputs/${TODAY}"

mkdir -p "${OUT_DIR}"

MODULE="${1:-}"
if [[ -z "${MODULE}" ]]; then
  echo "Usage: ./run.sh <module> [args]"
  echo "Modules: intake | gameteam | botrules | accounts | numbers | wrap"
  exit 1
fi
shift

case "${MODULE}" in
  intake|gameteam|botrules|accounts|numbers|wrap)
    ;;
  *)
    echo "Unknown module: ${MODULE}"
    echo "Valid: intake | gameteam | botrules | accounts | numbers | wrap"
    exit 1
    ;;
esac

PROMPT_FILE="${ROOT}/prompts/${MODULE}.md"
MASTER_FILE="${ROOT}/MASTER_PROMPT.md"

if [[ ! -f "${PROMPT_FILE}" ]]; then
  echo "Module prompt not found: ${PROMPT_FILE}"
  exit 1
fi

# Assemble the full prompt
ASSEMBLED="${OUT_DIR}/.run_${MODULE}_$(date +%H%M%S).prompt.md"

{
  echo "# === MASTER PROMPT ==="
  cat "${MASTER_FILE}"
  echo
  echo "# === MODULE PROMPT: ${MODULE} ==="
  cat "${PROMPT_FILE}"
  echo
  echo "# === OPERATOR INPUT ==="
  echo "Today: ${TODAY}"
  echo "Module: ${MODULE}"
  echo "Output dir: ${OUT_DIR}/${MODULE}/"
  echo
  echo "## Raw args"
  printf '  %s\n' "$@"
  echo
  echo "## Input files (resolve any --file paths below)"
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --file|--trigger|--rules|--baseline|--change)
        if [[ -f "${2:-}" ]]; then
          echo "### ${1} = ${2}"
          echo '```'
          cat "${2}"
          echo '```'
          shift 2
        else
          echo "### ${1} = ${2:-MISSING}"
          shift 2 || true
        fi
        ;;
      *)
        shift
        ;;
    esac
  done
} > "${ASSEMBLED}"

echo "Assembled prompt: ${ASSEMBLED}"
echo
echo "Next: pipe this to Claude Code, e.g."
echo "  claude < ${ASSEMBLED}"
echo
echo "Or open it and paste into a Claude Code session."

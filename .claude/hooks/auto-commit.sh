#!/bin/bash
# Auto-commit and push any uncommitted changes at the end of each Claude session turn.
# Triggered by the Stop hook in .claude/settings.json.

set -e

REPO="/Users/aabdelre/Desktop/dalil"
cd "$REPO"

# Only act if there are changes
if [ -z "$(git status --porcelain)" ]; then
  exit 0
fi

# Stage all changes
git add -A

# Build a commit summary from the diff
CHANGED=$(git diff --cached --stat | tail -1)
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

git commit -m "chore: auto-commit — $CHANGED [$TIMESTAMP]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

# Push — soft-fail so a network issue doesn't break the session
git push origin main 2>/dev/null && echo "[dalil] pushed to origin/main" || echo "[dalil] push skipped (no network or auth issue)"

#!/usr/bin/env bash

set -euo pipefail

timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
message="${1:-chore: backup ${timestamp}}"

git add -A

if git diff --cached --quiet; then
  echo "No changes to back up."
  exit 0
fi

git commit -m "${message}"
git push

echo "Backup completed: ${message}"

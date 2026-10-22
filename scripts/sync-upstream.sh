#!/usr/bin/env bash
# Merge upstream/main into $BRANCH (default sync/upstream) as a real merge commit.
# bundled/ is CI-owned: keep the fork's copy, Build rebuilds it on main after the merge.
# pnpm-lock.yaml is regenerated. Any other conflict stops the sync for a manual merge.
set -euo pipefail
BRANCH=${BRANCH:-sync/upstream}
git config user.name >/dev/null || git config user.name 'github-actions[bot]'
git config user.email >/dev/null || git config user.email '41898282+github-actions[bot]@users.noreply.github.com'

git switch --quiet -C "$BRANCH"
git merge --no-ff --no-commit upstream/main || true

git rm -r --cached --quiet bundled
git checkout HEAD -- bundled
git clean -fdq bundled

if git diff --name-only --diff-filter=U | grep -qx pnpm-lock.yaml; then
  git checkout --theirs pnpm-lock.yaml
fi
left=$(git diff --name-only --diff-filter=U | grep -vx pnpm-lock.yaml || true)
if [ -n "$left" ]; then
  echo "::error::Upstream conflicts need a manual sync: $left"
  exit 1
fi
pnpm install --lockfile-only --silent
git add pnpm-lock.yaml
git commit --quiet --no-edit -m "Merge upstream/main ($(git rev-list --count HEAD..upstream/main) commits)"
git merge-base --is-ancestor upstream/main HEAD
echo "Merged: $(git log --oneline -1)"

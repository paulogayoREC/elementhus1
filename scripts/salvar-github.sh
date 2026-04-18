#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

branch="$(git branch --show-current)"
if [ -z "$branch" ]; then
  echo "Nao foi possivel identificar a branch atual."
  exit 1
fi

remote_url="$(git remote get-url origin 2>/dev/null || true)"
if [ -z "$remote_url" ]; then
  echo "O remoto origin nao esta configurado."
  exit 1
fi

echo "Repositorio: $repo_root"
echo "Branch: $branch"
echo "Remoto: $remote_url"
echo

git add -A

if git diff --cached --quiet; then
  echo "Nenhuma alteracao para salvar."
else
  if [ "${1:-}" != "" ]; then
    commit_message="$*"
  else
    commit_message="Atualizacao $(date '+%Y-%m-%d %H:%M')"
  fi

  git commit -m "$commit_message"
fi

echo
echo "Sincronizando com o GitHub..."
git pull --rebase origin "$branch"
git push -u origin "$branch"

echo
echo "Versao salva no GitHub com sucesso."

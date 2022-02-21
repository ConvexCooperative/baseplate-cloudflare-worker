#!/bin/sh

if [ $# -eq 0 ]
then
  echo "Please pass in org name"
  exit 1
fi

echo "Syncing org $1"
pnpm exec wrangler kv:key put org-settings-$1 '{"orgExists": true}' --binding MAIN_KV
pnpm exec wrangler kv:key put import-map-$1-systemjs '{"imports": {"react": "https://cdn.single-spa-foundry.com/react.js"}, "scopes": {}}' --binding MAIN_KV

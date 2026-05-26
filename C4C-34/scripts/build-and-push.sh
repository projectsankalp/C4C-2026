#!/usr/bin/env bash
# Local/CI build orchestrator.
#
# Builds:
#   - apps/api          (Express + Prisma)            → .deploy/api
#   - apps/wa-bot       (whatsapp-web.js)             → .deploy/wabot
#   - root SPA (TanStack Start, Node target)          → .deploy/web
#   - vendor_ui (plain static HTML/CSS/JS)            → .deploy/vendor-web
#
# Then rsyncs to EC2 (DEPLOY_HOST) and triggers scripts/deploy.sh remotely.
#
# Required env:
#   DEPLOY_HOST   default 'hastkala' (an SSH config alias)
#   DEPLOY_KEY    optional path to SSH private key
set -euo pipefail
log() { printf "\033[1;34m[ship]\033[0m %s\n" "$*"; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DEPLOY_HOST="${DEPLOY_HOST:-hastkala}"
SSH_OPTS=(-o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30)
[ -n "${DEPLOY_KEY:-}" ] && SSH_OPTS+=(-i "$DEPLOY_KEY")

STAGE="$ROOT/.deploy"
rm -rf "$STAGE"
mkdir -p "$STAGE"/{api,wabot,web,vendor-web}

# ---- Root deps ----
log "Installing root deps"
npm ci --no-audit --no-fund --legacy-peer-deps

# ---- Build API ----
log "Building API"
( cd apps/api && npm ci --no-audit --no-fund && npm run build )

log "Staging API"
rsync -a --delete \
    --include='dist/' --include='dist/***' \
    --include='prisma/' --include='prisma/***' \
    --include='package.json' \
    --include='package-lock.json' \
    --exclude='*' \
    apps/api/ "$STAGE/api/"

# ---- Build wa-bot ----
log "Building wa-bot"
( cd apps/wa-bot && npm ci --no-audit --no-fund && npm run build )

log "Staging wa-bot"
rsync -a --delete \
    --include='dist/' --include='dist/***' \
    --include='package.json' \
    --include='package-lock.json' \
    --exclude='*' \
    apps/wa-bot/ "$STAGE/wabot/"

# ---- Build web (TanStack Start, Node target via vite.config.prod.ts) ----
log "Building web (TanStack Start, Node target)"
npx vite build --config vite.config.prod.ts

# TanStack Start emits its prod bundle under .output/. We copy the whole thing.
if [ ! -d .output ]; then
    echo "ERROR: .output directory missing after vite build" >&2
    exit 1
fi
log "Staging web"
rsync -a --delete .output/ "$STAGE/web/.output/"
# Capture the route tree generation file & any auxiliary needed (none for prod runtime).

# ---- Stage vendor-web (no build needed) ----
log "Staging vendor-web"
rsync -a --delete \
    --exclude='node_modules' \
    --exclude='*.test.mjs' \
    --exclude='package*.json' \
    vendor_ui/ "$STAGE/vendor-web/"

# ---- Push artifacts ----
log "Pushing artifacts to $DEPLOY_HOST"
ssh "${SSH_OPTS[@]}" "$DEPLOY_HOST" "rm -rf /tmp/hastkala-deploy && mkdir -p /tmp/hastkala-deploy"
rsync -a --delete -e "ssh ${SSH_OPTS[*]}" "$STAGE/" "$DEPLOY_HOST:/tmp/hastkala-deploy/"
rsync -a -e "ssh ${SSH_OPTS[*]}" scripts/deploy.sh "$DEPLOY_HOST:/tmp/hastkala-deploy/deploy.sh"

# ---- Run deploy on the instance ----
log "Running remote deploy"
ssh "${SSH_OPTS[@]}" "$DEPLOY_HOST" "bash /tmp/hastkala-deploy/deploy.sh"

log "Done"

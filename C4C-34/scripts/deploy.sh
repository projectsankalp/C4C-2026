#!/usr/bin/env bash
# Runs ON the EC2 instance.
# Expects /tmp/hastkala-deploy populated by scripts/build-and-push.sh:
#   /tmp/hastkala-deploy/api/         api source + dist + package.json + prisma
#   /tmp/hastkala-deploy/wabot/       wabot source + dist + package.json
#   /tmp/hastkala-deploy/web/.output/ TanStack Start Node prod bundle
#   /tmp/hastkala-deploy/vendor-web/  static HTML/JS/CSS for vendor portal
set -euo pipefail
log() { printf "\033[1;32m[deploy]\033[0m %s\n" "$*"; }

STAGE=/tmp/hastkala-deploy
BASE=/opt/hastkala

for d in api wabot web vendor-web; do
    [ -d "$STAGE/$d" ] || { echo "missing $STAGE/$d"; exit 1; }
done

# ---- Sync code ----
log "Syncing api"
sudo rsync -a --delete --exclude=node_modules "$STAGE/api/"  "$BASE/api/"

log "Syncing wabot"
sudo rsync -a --delete --exclude=node_modules --exclude=.wwebjs_auth --exclude=.wwebjs_cache "$STAGE/wabot/" "$BASE/wabot/"

log "Syncing web (TanStack Start Node bundle)"
sudo rsync -a --delete "$STAGE/web/" "$BASE/web/"

log "Syncing vendor-web"
sudo rsync -a --delete "$STAGE/vendor-web/" "$BASE/vendor-web/"

sudo chown -R hastkala:hastkala "$BASE"

# ---- Persistent wa-bot session ----
log "Linking persistent wa-bot session dir"
sudo install -d -o hastkala -g hastkala "$BASE/wabot-state/.wwebjs_auth"
sudo install -d -o hastkala -g hastkala "$BASE/wabot-state/.wwebjs_cache"
sudo -u hastkala ln -sfn "$BASE/wabot-state/.wwebjs_auth"  "$BASE/wabot/.wwebjs_auth"
sudo -u hastkala ln -sfn "$BASE/wabot-state/.wwebjs_cache" "$BASE/wabot/.wwebjs_cache"

# ---- Install runtime deps ----
log "Installing api production deps"
sudo -u hastkala bash -lc "cd $BASE/api  && npm ci --omit=dev --no-audit --no-fund"

log "Installing wabot production deps"
sudo -u hastkala bash -lc "cd $BASE/wabot && npm ci --omit=dev --no-audit --no-fund"

log "Installing web production deps (puppeteer/etc not needed; TanStack Start bundle ships its own)"
# TanStack Start bundle ships node_modules-free; nothing extra to install for web.

# ---- Prisma client ----
log "Generating prisma client"
sudo -u hastkala bash -lc "cd $BASE/api && npx --yes prisma@6.19.3 generate"

# ---- Env perms ----
sudo chown root:hastkala /etc/hastkala/*.env 2>/dev/null || true
sudo chmod 0640 /etc/hastkala/*.env 2>/dev/null || true

# ---- Reload systemd & restart ----
log "Reloading systemd"
sudo systemctl daemon-reload

log "Restarting hastkala-web"
sudo systemctl restart hastkala-web
sleep 3
sudo systemctl is-active hastkala-web || { sudo journalctl -u hastkala-web -n 50 --no-pager; exit 1; }

log "Restarting hastkala-api"
sudo systemctl restart hastkala-api
sleep 3
sudo systemctl is-active hastkala-api || { sudo journalctl -u hastkala-api -n 50 --no-pager; exit 1; }

log "Restarting hastkala-wabot"
sudo systemctl restart hastkala-wabot
sleep 5
sudo systemctl is-active hastkala-wabot || { sudo journalctl -u hastkala-wabot -n 50 --no-pager; exit 1; }

# ---- Reload nginx ----
log "Reloading nginx"
sudo nginx -t
sudo systemctl reload nginx

log "Deploy complete"

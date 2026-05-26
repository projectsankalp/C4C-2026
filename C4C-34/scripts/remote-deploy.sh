#!/usr/bin/env bash
# Runs ON the EC2 instance.
# Pulls the repo, builds everything, deploys.
# Used both for the initial deploy and by GitHub Actions on every push.
set -euo pipefail
log() { printf "\033[1;32m[remote-deploy]\033[0m %s\n" "$*"; }

REPO="${REPO:-https://github.com/cyberkunju/hastkala.git}"
BRANCH="${BRANCH:-main}"
WORK=/home/fedora/hastkala-build
BASE=/opt/hastkala

# ---- Fetch source ----
if [ -d "$WORK/.git" ]; then
    log "Updating existing checkout"
    git -C "$WORK" remote set-url origin "$REPO"
    git -C "$WORK" fetch --depth=1 origin "$BRANCH"
    git -C "$WORK" reset --hard "origin/$BRANCH"
    git -C "$WORK" clean -fdx -e node_modules -e .deploy
else
    log "Cloning $REPO"
    rm -rf "$WORK"
    git clone --depth=1 --branch "$BRANCH" "$REPO" "$WORK"
fi
cd "$WORK"
log "Commit: $(git rev-parse --short HEAD)"

STAGE="$WORK/.deploy"
rm -rf "$STAGE"
mkdir -p "$STAGE"/{api,wabot,web,vendor-web}

# ---- API ----
log "Building API"
( cd apps/api && \
    npm ci --no-audit --no-fund && \
    npx --yes prisma@6.19.3 generate && \
    npm run build )
rsync -a --delete \
    --include='dist/' --include='dist/***' \
    --include='prisma/' --include='prisma/***' \
    --include='package.json' \
    --include='package-lock.json' \
    --exclude='*' \
    apps/api/ "$STAGE/api/"

# ---- WhatsApp bot ----
log "Building wa-bot"
( cd apps/wa-bot && npm ci --no-audit --no-fund && npm run build )
rsync -a --delete \
    --include='dist/' --include='dist/***' \
    --include='package.json' \
    --include='package-lock.json' \
    --exclude='*' \
    apps/wa-bot/ "$STAGE/wabot/"

# ---- Web (TanStack Start, Node target) ----
log "Building web"
npm ci --no-audit --no-fund --legacy-peer-deps
npx vite build --config vite.config.prod.ts
[ -d dist ] || { echo "ERROR: dist/ missing after vite build"; exit 1; }
[ -f dist/server/server.js ] || { echo "ERROR: dist/server/server.js missing"; exit 1; }
rsync -a --delete dist/ "$STAGE/web/dist/"
# The prod bundle imports react/h3-v2/tanstack/etc. from runtime node_modules.
# Ship the root package.json + lockfile so the deploy step can install runtime deps.
cp package.json "$STAGE/web/package.json"
[ -f package-lock.json ] && cp package-lock.json "$STAGE/web/package-lock.json"

# ---- Vendor (static) ----
log "Staging vendor-web"
rsync -a --delete \
    --exclude='node_modules' \
    --exclude='*.test.mjs' \
    --exclude='package*.json' \
    vendor_ui/ "$STAGE/vendor-web/"

# ---- Deploy ----
# Capture the hash of the *currently deployed* services before we overwrite them,
# so we can decide whether each needs a restart after the rsync.
hash_pre() {
    local d="$1"
    [ -d "$d" ] || { echo ""; return; }
    sudo find "$d" -type f \! -name '*.map' -exec sha256sum {} + 2>/dev/null \
        | awk '{print $1}' | sort | sha256sum | awk '{print $1}'
}
WEB_HASH_OLD=$(hash_pre   "$BASE/web/dist")
API_HASH_OLD=$(hash_pre   "$BASE/api/dist")
WABOT_HASH_OLD=$(hash_pre "$BASE/wabot/dist")

log "Syncing artifacts to /opt/hastkala"
sudo install -d -o hastkala -g hastkala $BASE/scripts
sudo install -m 0644 -o hastkala -g hastkala "$WORK/scripts/web-server.mjs" "$BASE/scripts/web-server.mjs"
sudo rsync -a --delete --exclude=node_modules                 "$STAGE/api/"  "$BASE/api/"
# wabot sync MUST exclude the persistent session symlinks/state to avoid wiping a paired session.
sudo rsync -a --delete \
    --exclude=node_modules \
    --exclude=.wwebjs_auth \
    --exclude=.wwebjs_cache \
    --exclude=.wwebjs_auth/** \
    --exclude=.wwebjs_cache/** \
    "$STAGE/wabot/" "$BASE/wabot/"
sudo rsync -a --delete                                         "$STAGE/web/"  "$BASE/web/"
sudo rsync -a --delete                                         "$STAGE/vendor-web/" "$BASE/vendor-web/"
sudo chown -R --no-dereference hastkala:hastkala "$BASE"

log "Linking persistent wa-bot session dir"
sudo install -d -o hastkala -g hastkala "$BASE/wabot-state/.wwebjs_auth"
sudo install -d -o hastkala -g hastkala "$BASE/wabot-state/.wwebjs_cache"
sudo -u hastkala ln -sfn "$BASE/wabot-state/.wwebjs_auth"  "$BASE/wabot/.wwebjs_auth"
sudo -u hastkala ln -sfn "$BASE/wabot-state/.wwebjs_cache" "$BASE/wabot/.wwebjs_cache"

log "Installing api production deps"
sudo -u hastkala bash -lc "cd $BASE/api  && npm ci --omit=dev --no-audit --no-fund"

log "Installing wabot production deps"
sudo -u hastkala bash -lc "cd $BASE/wabot && npm ci --omit=dev --no-audit --no-fund"

log "Installing web production deps"
sudo -u hastkala bash -lc "cd $BASE/web   && npm ci --omit=dev --no-audit --no-fund --legacy-peer-deps"

log "Generating prisma client"
sudo -u hastkala bash -lc "cd $BASE/api && npx --yes prisma generate" || log "prisma generate non-fatal"

log "Reloading systemd"
sudo systemctl daemon-reload

# ---- Smart restart: only bounce a service when its dist actually changed ----
# Hash function: full dist tree minus .map files (they change on every rebuild).
hash_dist() {
    local d="$1"
    [ -d "$d" ] || { echo ""; return; }
    sudo find "$d" -type f \! -name '*.map' -exec sha256sum {} + 2>/dev/null \
        | awk '{print $1}' | sort | sha256sum | awk '{print $1}'
}

restart_if_changed() {
    local svc="$1" dist="$2" hashfile="$3" old="$4"
    local new
    new=$(hash_dist "$dist")
    sudo install -d -o root -g root /var/lib/hastkala
    if [ "$new" != "$old" ]; then
        log "$svc dist changed (old=${old:0:8} new=${new:0:8}); restarting"
        sudo systemctl restart "$svc"
        sleep 3
        sudo systemctl is-active "$svc" || { sudo journalctl -u "$svc" -n 60 --no-pager; exit 1; }
        echo "$new" | sudo tee "$hashfile" >/dev/null
    else
        log "$svc dist unchanged (${new:0:8}); leaving running"
        sudo systemctl is-active "$svc" || sudo systemctl start "$svc"
    fi
}

restart_if_changed hastkala-web   "$BASE/web/dist"     /var/lib/hastkala/web.dist.sha256   "$WEB_HASH_OLD"
restart_if_changed hastkala-api   "$BASE/api/dist"     /var/lib/hastkala/api.dist.sha256   "$API_HASH_OLD"
restart_if_changed hastkala-wabot "$BASE/wabot/dist"   /var/lib/hastkala/wabot.dist.sha256 "$WABOT_HASH_OLD"

log "Reloading nginx"
# Install the routes snippet + main hastkala.conf if they're not yet on this box.
sudo install -d -o root -g root -m 0755 /etc/nginx/snippets
sudo install -m 0644 "$WORK/scripts/nginx-hastkala-routes.conf" /etc/nginx/snippets/hastkala-routes.conf
sudo install -m 0644 "$WORK/scripts/nginx-hastkala.conf"        /etc/nginx/conf.d/hastkala.conf
# Ensure the cert dir + placeholder exist so HTTPS server block is valid even pre-cert.
bash "$WORK/scripts/install-https.sh" >/dev/null 2>&1 || true
sudo nginx -t
sudo systemctl reload nginx

log "Deploy complete: $(git rev-parse --short HEAD)"

# ---- Cleanup ----
# Drop top-level node_modules (350 MB) and any old .deploy stage from the build
# dir so we don't keep ballooning disk usage. The next build re-downloads via
# npm cache (which we keep). Each app's node_modules under apps/* are kept
# because they're populated by `npm ci --omit=dev` against /opt/hastkala
# directly — not from the build dir.
log "Trimming build cache"
rm -rf "$WORK/.deploy" "$WORK/node_modules" "$WORK/apps/api/node_modules" "$WORK/apps/wa-bot/node_modules" 2>/dev/null || true
du -sh "$WORK" 2>/dev/null || true

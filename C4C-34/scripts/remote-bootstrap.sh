#!/usr/bin/env bash
# Remote bootstrap for the Hastkala EC2 instance.
# Idempotent: safe to re-run.
set -euo pipefail

log() { printf "\033[1;36m[bootstrap]\033[0m %s\n" "$*"; }

log "Updating system packages"
sudo dnf -y -q upgrade --refresh >/dev/null

log "Installing base packages (nginx, git, build tools, chromium deps)"
sudo dnf -y -q install \
    nginx git rsync tar unzip curl ca-certificates \
    gcc gcc-c++ make \
    chromium \
    nss freetype harfbuzz \
    libdrm libxkbcommon mesa-libgbm \
    alsa-lib atk at-spi2-atk cups-libs gtk3 libXcomposite libXdamage libXrandr libxshmfence \
    pango cairo \
    >/dev/null

log "Installing Node.js 22 (NodeSource)"
if ! command -v node >/dev/null || [[ "$(node -v)" != v22.* ]]; then
    curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo -E bash - >/dev/null
    sudo dnf -y -q install nodejs >/dev/null
fi
node -v
npm -v

log "Installing Bun globally for the deploy user"
if ! command -v bun >/dev/null; then
    curl -fsSL https://bun.sh/install | bash >/dev/null
    # bun installs to ~/.bun/bin; symlink for system-wide use
    sudo ln -sf "$HOME/.bun/bin/bun" /usr/local/bin/bun
fi
bun --version

log "Creating deploy user 'hastkala' (no login shell change, just ensures the home)"
if ! id hastkala >/dev/null 2>&1; then
    sudo useradd -m -s /bin/bash hastkala
fi

log "Creating /opt/hastkala layout"
sudo install -d -o hastkala -g hastkala /opt/hastkala
sudo install -d -o hastkala -g hastkala /opt/hastkala/api
sudo install -d -o hastkala -g hastkala /opt/hastkala/wabot
sudo install -d -o hastkala -g hastkala /opt/hastkala/web
sudo install -d -o hastkala -g hastkala /opt/hastkala/vendor-web
sudo install -d -o hastkala -g hastkala /opt/hastkala/wabot-state

log "Creating /etc/hastkala for env files"
sudo install -d -o root -g hastkala -m 0750 /etc/hastkala

log "Allowing nginx to read /opt/hastkala (SELinux contexts)"
if command -v getenforce >/dev/null && [ "$(getenforce 2>/dev/null)" = "Enforcing" ]; then
    sudo dnf -y -q install policycoreutils-python-utils >/dev/null || true
    sudo semanage fcontext -a -t httpd_sys_content_t '/opt/hastkala/web(/.*)?' 2>/dev/null || true
    sudo semanage fcontext -a -t httpd_sys_content_t '/opt/hastkala/vendor-web(/.*)?' 2>/dev/null || true
    sudo restorecon -R /opt/hastkala/web /opt/hastkala/vendor-web 2>/dev/null || true
    # Allow nginx to proxy to localhost ports
    sudo setsebool -P httpd_can_network_connect 1 2>/dev/null || true
fi

log "Enabling and starting nginx"
sudo systemctl enable --now nginx
sudo systemctl is-active nginx

log "Setting up swap (4G) for build memory headroom"
if ! swapon --show | grep -q .; then
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile >/dev/null
    sudo swapon /swapfile
    grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi
free -h | head -3

log "Bootstrap complete"

#!/usr/bin/env bash
# Installs a temporary self-signed cert at /etc/ssl/cyberkunju.com/.
# Run on the EC2 box. Once you have the real Cloudflare Origin cert, replace
# /etc/ssl/cyberkunju.com/cert.pem and key.pem and `sudo systemctl reload nginx`.
set -euo pipefail
DIR=/etc/ssl/cyberkunju.com
sudo install -d -o root -g root -m 0755 "$DIR"
if [ ! -f "$DIR/cert.pem" ]; then
    sudo openssl req -x509 -nodes -newkey rsa:2048 \
        -keyout "$DIR/key.pem" -out "$DIR/cert.pem" \
        -days 365 -subj "/CN=cyberkunju.com" \
        -addext "subjectAltName=DNS:cyberkunju.com,DNS:www.cyberkunju.com" \
        2>/dev/null
    sudo chmod 0600 "$DIR/key.pem"
    sudo chmod 0644 "$DIR/cert.pem"
fi
ls -la "$DIR"

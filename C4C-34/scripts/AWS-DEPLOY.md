# Hastkala on AWS EC2

End-to-end runbook for the deployment at **http://40.192.113.52**.

## Architecture (single-instance)

```
┌─────────────────────────────────────────────────┐
│  Fedora 43 / 30GiB RAM / 8 vCPU / 125GB disk   │
│                                                  │
│  nginx :80 (public)                             │
│   ├─ /              → 127.0.0.1:3000  (web SSR) │
│   ├─ /vendor/       → /opt/hastkala/vendor-web/ │
│   ├─ /api/          → 127.0.0.1:5000  (api)     │
│   ├─ /wabot/        → 127.0.0.1:5001  (wabot)   │
│   └─ /healthz       → 200 ok                    │
│                                                  │
│  systemd services (auto-restart):               │
│   ├─ hastkala-web    Node SSR (TanStack Start)  │
│   ├─ hastkala-api    Express + Prisma           │
│   └─ hastkala-wabot  whatsapp-web.js + Chromium │
│                                                  │
│  /opt/hastkala/{api,wabot,web,vendor-web}       │
│  /opt/hastkala/wabot-state/.wwebjs_auth         │
│  /etc/hastkala/{api,wabot,web}.env  (0640)      │
└─────────────────────────────────────────────────┘
```

## Service control

```bash
ssh hastkala
sudo systemctl status hastkala-web hastkala-api hastkala-wabot
sudo journalctl -u hastkala-wabot -f       # tail wabot logs (QR codes, errors)
sudo systemctl restart hastkala-wabot
sudo nginx -t && sudo systemctl reload nginx
```

## First WhatsApp pairing

1. `ssh hastkala`
2. `sudo journalctl -u hastkala-wabot -f`
3. Scan the QR pattern with WhatsApp on your phone.
4. The session is persisted at `/opt/hastkala/wabot-state/.wwebjs_auth/` and
   survives deploys.

## Updating env files

```bash
ssh hastkala
sudo $EDITOR /etc/hastkala/api.env       # also wabot.env, web.env
sudo systemctl restart hastkala-api      # restart whichever service was changed
```

## Manual deploy

The CI/CD workflow does this on every push, but it's also runnable on demand:

```bash
ssh hastkala "curl -fsSL https://raw.githubusercontent.com/cyberkunju/hastkala/main/scripts/remote-deploy.sh -o /tmp/remote-deploy.sh && bash /tmp/remote-deploy.sh"
```

Or from a fresh shell, by exact commit:

```bash
SHA=$(git rev-parse HEAD)
ssh hastkala "curl -fsSL https://raw.githubusercontent.com/cyberkunju/hastkala/$SHA/scripts/remote-deploy.sh -o /tmp/remote-deploy.sh && bash /tmp/remote-deploy.sh"
```

## CI/CD (GitHub Actions)

`.github/workflows/deploy.yml` runs on every push to `main` that touches code.

Required repo secrets:

| Secret | Value |
|---|---|
| `EC2_HOST` | `40.192.113.52` |
| `EC2_SSH_KEY` | private key from `/home/fedora/.ssh/gh-actions-deploy` on the box |

Already configured via `gh secret set`. The workflow:

1. Checks out the commit.
2. Writes the deploy SSH key.
3. SSHes in and runs `scripts/remote-deploy.sh` for that exact commit SHA.
4. Smoke-tests `/`, `/vendor/`, `/healthz`, `/api/products`.

If the smoke test fails, services aren't rolled back automatically. Inspect
`sudo journalctl -u hastkala-<service> -n 100`.

## Provisioning a fresh instance

```bash
ssh fedora@<NEW_IP> "curl -fsSL https://raw.githubusercontent.com/cyberkunju/hastkala/main/scripts/remote-bootstrap.sh | bash"
```

Then upload env files:

```bash
scp .deploy-env/api.env hastkala-new:/tmp/
scp .deploy-env/wabot.env hastkala-new:/tmp/
scp .deploy-env/web.env hastkala-new:/tmp/
ssh hastkala-new "sudo install -m 0640 -o root -g hastkala /tmp/api.env /etc/hastkala/api.env && sudo install -m 0640 -o root -g hastkala /tmp/wabot.env /etc/hastkala/wabot.env && sudo install -m 0640 -o root -g hastkala /tmp/web.env /etc/hastkala/web.env"
```

And run the deploy:

```bash
ssh hastkala-new "curl -fsSL https://raw.githubusercontent.com/cyberkunju/hastkala/main/scripts/remote-deploy.sh | bash"
```

## Common issues

**Web returns 500 / "This page didn't load"**
Tail `sudo journalctl -u hastkala-web -n 100`. Almost always a missing
runtime dependency in `/opt/hastkala/web/node_modules` after a `package.json`
change. Fix by running the deploy script again.

**Wabot inactive / Chromium fails to launch**
Re-check `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser` in
`/etc/hastkala/wabot.env` and ensure `~/.config` and `~/.cache` exist for the
`hastkala` user.

**WhatsApp session lost / asks for QR every restart**
Check that `/opt/hastkala/wabot-state/.wwebjs_auth/` is symlinked into
`/opt/hastkala/wabot/` and is owned by `hastkala:hastkala`.

**API returns 502 / nothing**
`sudo systemctl status hastkala-api`. Most often a missing env value (Cloudinary,
DB URL, OpenAI quota, etc).

## Free tier risk

This instance is part of an AWS Lab profile (`EC2SSMRoleForLab1`,
`Lab1` workshop). Lab environments can wipe the instance when the session ends.
Re-deploy by running `remote-bootstrap.sh` then `remote-deploy.sh` on the new
box, and re-uploading the env files from `.deploy-env/`.

# Pushes a Cloudflare Origin certificate from a local file to the EC2 box.
# The local file is plaintext with the format produced in the runbook:
#
#   ===CERT===
#   -----BEGIN CERTIFICATE-----
#   ...
#   -----END CERTIFICATE-----
#   ===KEY===
#   -----BEGIN PRIVATE KEY-----
#   ...
#   -----END PRIVATE KEY-----
#
# Usage:
#   .\scripts\push-cf-origin-cert.ps1 -BundlePath C:\Users\knava\Downloads\cf-origin.txt
param(
    [Parameter(Mandatory=$true)][string]$BundlePath,
    [string]$RemoteHost = "hastkala"
)
$ErrorActionPreference = "Stop"

if (-not (Test-Path $BundlePath)) {
    throw "Bundle file not found: $BundlePath"
}

$content = Get-Content -Raw -Path $BundlePath
if ($content -notmatch "===CERT===") { throw "Bundle missing ===CERT=== marker" }
if ($content -notmatch "===KEY===")  { throw "Bundle missing ===KEY=== marker" }

# Split into cert and key sections.
$parts = $content -split "===KEY==="
$certPart = ($parts[0] -replace "===CERT===", "").Trim()
$keyPart  = $parts[1].Trim()

if ($certPart -notmatch "BEGIN CERTIFICATE") { throw "Cert section is not PEM" }
if ($keyPart  -notmatch "BEGIN")             { throw "Key section is not PEM" }

# Write to temp files, ensure LF line endings.
$tmpDir  = Join-Path ([System.IO.Path]::GetTempPath()) ("cf-origin-" + (Get-Random))
New-Item -ItemType Directory -Path $tmpDir | Out-Null
$certFile = Join-Path $tmpDir "cert.pem"
$keyFile  = Join-Path $tmpDir "key.pem"
[System.IO.File]::WriteAllText($certFile, ($certPart -replace "`r`n", "`n") + "`n", [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText($keyFile,  ($keyPart  -replace "`r`n", "`n") + "`n", [System.Text.UTF8Encoding]::new($false))

Write-Host "Uploading to $RemoteHost..."
scp $certFile "$RemoteHost`:/tmp/cf-cert.pem"
scp $keyFile  "$RemoteHost`:/tmp/cf-key.pem"

Write-Host "Installing on $RemoteHost..."
ssh $RemoteHost @"
set -e
sudo install -d -o root -g root -m 0755 /etc/ssl/cyberkunju.com
sudo install -m 0644 -o root -g root /tmp/cf-cert.pem /etc/ssl/cyberkunju.com/cert.pem
sudo install -m 0600 -o root -g root /tmp/cf-key.pem  /etc/ssl/cyberkunju.com/key.pem
shred -u /tmp/cf-cert.pem /tmp/cf-key.pem 2>/dev/null || rm -f /tmp/cf-cert.pem /tmp/cf-key.pem
sudo openssl x509 -in /etc/ssl/cyberkunju.com/cert.pem -noout -subject -issuer -enddate
sudo nginx -t
sudo systemctl reload nginx
"@

Remove-Item -Recurse -Force $tmpDir
Write-Host "Done. Cloudflare Origin cert installed and nginx reloaded."

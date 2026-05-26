# Connecting to the Hastkala AWS instance

The lab EC2 instance lives at `40.192.113.52` (Elastic IP `Lab-ip`) in `ap-south-2`.
A dedicated ed25519 SSH key was generated and installed via cloud-init user-data.

## Files

| Path | Purpose |
|------|---------|
| `~/.ssh/hastkala_ec2`     | Private key (do not share, do not commit) |
| `~/.ssh/hastkala_ec2.pub` | Public key (already on the instance) |
| `~/.ssh/config`           | Defines the `hastkala` host alias |
| `scripts/connect-aws.cmd` | Wrapper for cmd.exe |
| `scripts/connect-aws.ps1` | Wrapper for PowerShell |

## Quick connect

From any shell:

```sh
ssh hastkala
```

PowerShell aliases (after a new shell starts so the profile loads):

```powershell
hk           # interactive shell
hastkala     # same thing
hk uptime    # run one remote command
```

Project scripts:

```cmd
scripts\connect-aws.cmd
scripts\connect-aws.cmd "df -h"
```

```powershell
.\scripts\connect-aws.ps1
.\scripts\connect-aws.ps1 "free -h"
```

## Instance reference

| Field | Value |
|-------|-------|
| Instance ID | `i-084c0491501ecd8e8` |
| Region | `ap-south-2` (Hyderabad) |
| Public IP | `40.192.113.52` |
| OS | Fedora Linux 43 (Cloud Edition) |
| User | `fedora` |
| IAM role | `EC2SSMRoleForLab1` |
| Open ports | 22 (SSH), 80 (HTTP), 443 (HTTPS) — all `0.0.0.0/0` |

## Useful CLI commands

```cmd
aws ec2 describe-instances --region ap-south-2 --instance-ids i-084c0491501ecd8e8
aws ec2 stop-instances     --region ap-south-2 --instance-ids i-084c0491501ecd8e8
aws ec2 start-instances    --region ap-south-2 --instance-ids i-084c0491501ecd8e8
aws ec2 reboot-instances   --region ap-south-2 --instance-ids i-084c0491501ecd8e8
```

## Recovery

If the key ever stops working (lost, machine wiped, etc.) the same recovery flow
is repeatable:

1. Generate a new ed25519 key locally.
2. Edit `userdata.yaml` with the new public key.
3. `aws ec2 stop-instances ...`
4. Encode user-data: `[Convert]::ToBase64String([IO.File]::ReadAllBytes('userdata.yaml')) > userdata.b64`
5. `aws ec2 modify-instance-attribute --attribute userData --value file://userdata.b64 ...`
6. `aws ec2 start-instances ...`

Cloud-init's `bootcmd` runs every boot, so the new key is appended to
`/home/fedora/.ssh/authorized_keys` automatically.

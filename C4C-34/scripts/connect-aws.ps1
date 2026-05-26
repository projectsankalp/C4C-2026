# Connect to the Hastkala AWS EC2 instance.
# Usage:
#   .\scripts\connect-aws.ps1               # interactive shell
#   .\scripts\connect-aws.ps1 "uptime"      # run one remote command
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$RemoteCommand
)
if ($RemoteCommand) {
    ssh hastkala $RemoteCommand
} else {
    ssh hastkala
}

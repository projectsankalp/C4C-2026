@echo off
REM Connect to the Hastkala AWS EC2 instance.
REM Usage:
REM   connect-aws.cmd               -> opens an interactive SSH session
REM   connect-aws.cmd "uptime"      -> runs a single remote command
ssh hastkala %*
